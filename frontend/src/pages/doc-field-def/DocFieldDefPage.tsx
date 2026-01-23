import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Form,
  Drawer,
  message,
  Tag,
  Upload,
  Modal,
} from 'antd';
import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import type { Key } from 'react';
import { docFieldDefApi, docTypeApi, DocFieldDef, QueryParams } from '../../services/api';
import ActionButtons from '../../components/ActionButtons';
import FilterToolbar from '../../components/FilterToolbar';
import BatchActions from '../../components/BatchActions';
import DetailModal, { renderStatus, renderYesNo } from '../../components/DetailModal';
import { exportToExcel, docFieldDefExportColumns } from '../../utils/exportExcel';

const fieldCategoryOptions = ['金额', '日期', '数量', '文字', '枚举', '其他'];

const defaultQueryParams: QueryParams = { page: 1, pageSize: 10 };

// 详情弹窗字段配置
const detailFields = [
  { key: 'fieldName', label: '字段名称' },
  { key: 'fieldCode', label: '字段编码' },
  { key: 'docType.name', label: '所属文件类型名称', render: (_: any, r: any) => r.docType?.name || '-' },
  { key: 'docType.code', label: '所属文件类型编码', render: (_: any, r: any) => r.docType?.code || '-' },
  { key: 'fieldCategory', label: '字段类别' },
  { key: 'requiredFlag', label: '是否必填', render: renderYesNo },
  { key: 'valueSource', label: '取值方式' },
  { key: 'anchorWord', label: '定位词' },
  { key: 'status', label: '状态', render: renderStatus },
  { key: 'enumOptions', label: '枚举值', span: 2 },
  { key: 'exampleValue', label: '示例数据', span: 2 },
  { key: 'fieldDescription', label: '字段说明', span: 2 },
];

export default function DocFieldDefPage() {
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [queryParams, setQueryParams] = useState<QueryParams>(defaultQueryParams);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [fieldCategory, setFieldCategory] = useState<string | undefined>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<DocFieldDef[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<DocFieldDef | null>(null);
  const queryClient = useQueryClient();

  const hasActiveFilters = !!(queryParams.keyword || queryParams.docTypeIds || queryParams.fieldCategory);

  const { data, isLoading } = useQuery({
    queryKey: ['docFieldDefs', queryParams],
    queryFn: () => docFieldDefApi.list(queryParams),
  });

  const { data: docTypes } = useQuery({
    queryKey: ['docTypesAll'],
    queryFn: () => docTypeApi.all(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<DocFieldDef>) => docFieldDefApi.create(data),
    onSuccess: () => {
      message.success('创建成功');
      setDrawerOpen(false);
      form.resetFields();
      setFieldCategory(undefined);
      queryClient.invalidateQueries({ queryKey: ['docFieldDefs'] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || '创建失败'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DocFieldDef> }) => docFieldDefApi.update(id, data),
    onSuccess: () => {
      message.success('更新成功');
      setDrawerOpen(false);
      setEditingId(null);
      form.resetFields();
      setFieldCategory(undefined);
      queryClient.invalidateQueries({ queryKey: ['docFieldDefs'] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || '更新失败'),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) => docFieldDefApi.update(id, { status }),
    onSuccess: (_, variables) => {
      message.success(variables.status === 1 ? '启用成功' : '停用成功');
      queryClient.invalidateQueries({ queryKey: ['docFieldDefs'] });
    },
    onError: () => message.error('操作失败'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => docFieldDefApi.delete(id),
    onSuccess: () => {
      message.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['docFieldDefs'] });
    },
    onError: () => message.error('删除失败'),
  });

  const handleEdit = (record: DocFieldDef) => {
    setEditingId(record.id);
    setFieldCategory(record.fieldCategory);
    form.setFieldsValue(record);
    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        updateMutation.mutate({ id: editingId, data: values });
      } else {
        createMutation.mutate(values);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleImport = async (file: File) => {
    try {
      const response: any = await docFieldDefApi.import(file);
      const result = response.data || response; // 处理 { data: {...} } 结构
      message.success(`导入完成：成功 ${result.success} 条，失败 ${result.failed} 条`);
      queryClient.invalidateQueries({ queryKey: ['docFieldDefs'] });
      setImportModalOpen(false);
    } catch (error) {
      message.error('导入失败');
    }
    return false;
  };

  const handleClearFilters = () => setQueryParams(defaultQueryParams);

  const clearSelection = () => { setSelectedRowKeys([]); setSelectedRows([]); };

  const handleBatchEnable = async (ids: number[]) => {
    await docFieldDefApi.batchEnable(ids);
    clearSelection();
    queryClient.invalidateQueries({ queryKey: ['docFieldDefs'] });
  };

  const handleBatchDisable = async (ids: number[]) => {
    await docFieldDefApi.batchDisable(ids);
    clearSelection();
    queryClient.invalidateQueries({ queryKey: ['docFieldDefs'] });
  };

  const handleBatchDelete = async (ids: number[]) => {
    await docFieldDefApi.batchDelete(ids);
    clearSelection();
    queryClient.invalidateQueries({ queryKey: ['docFieldDefs'] });
  };

  const handleBatchExport = (rows: DocFieldDef[]) => {
    exportToExcel(rows, docFieldDefExportColumns, '关键信息字段');
  };

  const handleViewDetail = (record: DocFieldDef) => {
    setDetailRecord(record);
    setDetailModalOpen(true);
  };

  const rowSelection: TableRowSelection<DocFieldDef> = {
    selectedRowKeys,
    onChange: (keys: Key[], rows: DocFieldDef[]) => { setSelectedRowKeys(keys); setSelectedRows(rows); },
  };

  const columns: ColumnsType<DocFieldDef> = [
    { 
      title: '字段名称', 
      dataIndex: 'fieldName', 
      key: 'fieldName', 
      width: 130,
      render: (text, record) => <a onClick={() => handleViewDetail(record)} style={{ color: '#1677ff' }}>{text}</a>,
    },
    { title: '字段编码', dataIndex: 'fieldCode', key: 'fieldCode', width: 130 },
    { title: '所属文件类型名称', dataIndex: ['docType', 'name'], key: 'docTypeName', width: 150 },
    { title: '所属文件类型编码', dataIndex: ['docType', 'code'], key: 'docTypeCode', width: 130 },
    { title: '字段类别', dataIndex: 'fieldCategory', key: 'fieldCategory', width: 90 },
    { title: '是否必填', dataIndex: 'requiredFlag', key: 'requiredFlag', width: 90, render: (v) => v === 1 ? <Tag color="red">是</Tag> : <Tag>否</Tag> },
    { title: '取值方式', dataIndex: 'valueSource', key: 'valueSource', width: 100 },
    { title: '定位词', dataIndex: 'anchorWord', key: 'anchorWord', width: 120, ellipsis: true },
    { title: '枚举值', dataIndex: 'enumOptions', key: 'enumOptions', width: 120, ellipsis: true },
    { title: '示例数据', dataIndex: 'exampleValue', key: 'exampleValue', width: 120, ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="default">停用</Tag> },
    { title: '字段说明', dataIndex: 'fieldDescription', key: 'fieldDescription', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <ActionButtons
          record={record}
          recordName={record.fieldName}
          showView
          onView={() => handleViewDetail(record)}
          onEdit={() => handleEdit(record)}
          onToggleStatus={(id, status) => toggleStatusMutation.mutate({ id, status })}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>关键信息字段</h2>
      </div>

      <div className="table-card">
        <FilterToolbar onClearFilters={handleClearFilters} hasActiveFilters={hasActiveFilters}>
          <Input.Search
            placeholder="搜索字段名称/说明/文件类型"
            allowClear
            value={queryParams.keyword}
            onChange={(e) => !e.target.value && setQueryParams({ ...queryParams, keyword: undefined, page: 1 })}
            onSearch={(v) => setQueryParams({ ...queryParams, keyword: v || undefined, page: 1 })}
            style={{ width: 240 }}
          />
          <Select
            placeholder="选择文件类型"
            allowClear
            showSearch
            mode="multiple"
            maxTagCount={2}
            optionFilterProp="label"
            style={{ width: 280 }}
            options={docTypes?.map(d => ({ label: `${d.code} - ${d.name}`, value: d.id }))}
            onChange={(v) => setQueryParams({ ...queryParams, docTypeIds: v?.join(','), page: 1 })}
          />
          <Select
            placeholder="字段类别"
            allowClear
            style={{ width: 120 }}
            options={fieldCategoryOptions.map(c => ({ label: c, value: c }))}
            onChange={(v) => setQueryParams({ ...queryParams, fieldCategory: v, page: 1 })}
          />
        </FilterToolbar>

        <BatchActions
          selectedRowKeys={selectedRowKeys}
          selectedRows={selectedRows}
          onBatchEnable={handleBatchEnable}
          onBatchDisable={handleBatchDisable}
          onBatchDelete={handleBatchDelete}
          onClearSelection={clearSelection}
          onBatchExport={handleBatchExport}
          entityName="字段"
        />

        <div className="action-buttons">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); setFieldCategory(undefined); form.resetFields(); setDrawerOpen(true); }}>
            新增
          </Button>
          <Button icon={<DownloadOutlined />} onClick={() => docFieldDefApi.downloadTemplate()}>下载模板</Button>
          <Button icon={<UploadOutlined />} onClick={() => setImportModalOpen(true)}>批量导入</Button>
        </div>

        <Table
          columns={columns}
          dataSource={data?.list}
          rowKey="id"
          loading={isLoading}
          rowSelection={rowSelection}
          scroll={{ x: 1500 }}
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.pageSize,
            total: data?.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => setQueryParams({ ...queryParams, page, pageSize }),
          }}
        />
      </div>

      <Drawer
        title={editingId ? '编辑关键信息字段' : '新增关键信息字段'}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingId(null); setFieldCategory(undefined); form.resetFields(); }}
        width={600}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button type="primary" onClick={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>保存</Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="docTypeId" label="所属文件类型" rules={[{ required: true, message: '请选择文件类型' }]}>
            <Select showSearch optionFilterProp="label" placeholder="选择文件类型" options={docTypes?.map(d => ({ label: `${d.code} - ${d.name}`, value: d.id }))} />
          </Form.Item>
          <Form.Item name="fieldName" label="字段名称" rules={[{ required: true, message: '请输入字段名称' }]}>
            <Input placeholder="如：合同金额" />
          </Form.Item>
          <Form.Item name="fieldCode" label="字段编码" rules={[{ required: true, message: '请输入字段编码' }]}>
            <Input placeholder="如：CONTRACT_AMOUNT" />
          </Form.Item>
          <Form.Item name="fieldCategory" label="字段类别">
            <Select placeholder="选择类别" allowClear options={fieldCategoryOptions.map(c => ({ label: c, value: c }))} onChange={(v) => setFieldCategory(v)} />
          </Form.Item>
          <Form.Item name="requiredFlag" label="是否必填">
            <Select placeholder="请选择" options={[{ label: '是', value: 1 }, { label: '否', value: 0 }]} />
          </Form.Item>
          <Form.Item name="valueSource" label="取值方式" extra="指在文件中如何找到这个信息">
            <Input placeholder="如：封面、正文第X条、表格第X行、签字盖章处" />
          </Form.Item>
          <Form.Item name="anchorWord" label="定位词" extra="用于在文件中定位该字段的关键词">
            <Input placeholder="如：合同金额、甲方、签订日期" />
          </Form.Item>
          {fieldCategory === '枚举' && (
            <Form.Item name="enumOptions" label="枚举值" rules={[{ required: true, message: '字段类别为枚举时，必须填写枚举值' }]} extra="多个枚举值用逗号分隔">
              <Input placeholder="如：是,否,待定" />
            </Form.Item>
          )}
          {fieldCategory !== '枚举' && (
            <Form.Item name="enumOptions" label="枚举值" extra="仅在字段类别为枚举时需要填写">
              <Input placeholder="多个枚举值用逗号分隔" disabled />
            </Form.Item>
          )}
          <Form.Item name="exampleValue" label="示例数据">
            <Input placeholder="如：100000.00" />
          </Form.Item>
          <Form.Item name="fieldDescription" label="字段说明">
            <Input.TextArea rows={3} placeholder="描述该字段的含义和用途" />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal title="批量导入" open={importModalOpen} onCancel={() => setImportModalOpen(false)} footer={null}>
        <Upload.Dragger accept=".xlsx,.xls" showUploadList={false} beforeUpload={handleImport}>
          <p className="ant-upload-drag-icon"><UploadOutlined style={{ fontSize: 48, color: '#1677ff' }} /></p>
          <p className="ant-upload-text">点击或拖拽Excel文件到此处上传</p>
        </Upload.Dragger>
      </Modal>

      <DetailModal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="关键信息字段详情" record={detailRecord} fields={detailFields} />
    </div>
  );
}
