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
import type { ColumnsType, TableRowSelection } from 'antd/es/table';
import { docTypeApi, DocType, QueryParams } from '../../services/api';
import ActionButtons from '../../components/ActionButtons';
import FilterToolbar from '../../components/FilterToolbar';
import BatchActions from '../../components/BatchActions';
import DetailModal, { renderStatus } from '../../components/DetailModal';
import { exportToExcel, docTypeExportColumns } from '../../utils/exportExcel';

const projectPhaseOptions = [
  '立项阶段', '可研阶段', '设计阶段', '招采阶段', '施工阶段', '竣工阶段', '结算阶段', '审计阶段'
];

const defaultQueryParams: QueryParams = { page: 1, pageSize: 10 };

// 详情弹窗字段配置
const detailFields = [
  { key: 'name', label: '文件类型名称' },
  { key: 'code', label: '文件类型编码' },
  { key: 'projectPhase', label: '所属项目阶段' },
  { key: 'majorCategory', label: '所属大类' },
  { key: 'minorCategory', label: '所属小类' },
  { key: 'projectType', label: '适用项目类型' },
  { key: 'region', label: '适用地区' },
  { key: 'ownerOrg', label: '适用业主' },
  { key: 'status', label: '状态', render: renderStatus },
  { key: 'bizDescription', label: '业务说明/使用场景', span: 2 },
  { key: 'fileFeature', label: '文件特征信息（LLM识别）', span: 2 },
  { key: 'remark', label: '备注', span: 2 },
];

export default function DocTypePage() {
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [queryParams, setQueryParams] = useState<QueryParams>(defaultQueryParams);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<DocType[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<DocType | null>(null);
  const queryClient = useQueryClient();

  // 判断是否有活跃的筛选条件
  const hasActiveFilters = !!(queryParams.keyword || queryParams.projectPhase || queryParams.status !== undefined);

  const { data, isLoading } = useQuery({
    queryKey: ['docTypes', queryParams],
    queryFn: () => docTypeApi.list(queryParams),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<DocType>) => docTypeApi.create(data),
    onSuccess: () => {
      message.success('创建成功');
      setDrawerOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['docTypes'] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || '创建失败'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DocType> }) => docTypeApi.update(id, data),
    onSuccess: () => {
      message.success('更新成功');
      setDrawerOpen(false);
      setEditingId(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['docTypes'] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || '更新失败'),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) => 
      docTypeApi.update(id, { status }),
    onSuccess: (_, variables) => {
      message.success(variables.status === 1 ? '启用成功' : '停用成功');
      queryClient.invalidateQueries({ queryKey: ['docTypes'] });
    },
    onError: () => message.error('操作失败'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => docTypeApi.delete(id),
    onSuccess: () => {
      message.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['docTypes'] });
    },
    onError: () => message.error('删除失败'),
  });

  const handleEdit = (record: DocType) => {
    setEditingId(record.id);
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
      const result: any = await docTypeApi.import(file);
      message.success(`导入完成：成功 ${result.success} 条，失败 ${result.failed} 条`);
      if (result.errors?.length > 0) {
        Modal.warning({
          title: '导入警告',
          content: result.errors.slice(0, 10).join('\n'),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['docTypes'] });
      setImportModalOpen(false);
    } catch (error) {
      message.error('导入失败');
    }
    return false;
  };

  // 清除筛选
  const handleClearFilters = () => {
    setQueryParams(defaultQueryParams);
  };

  // 批量操作
  const handleBatchEnable = async (ids: number[]) => {
    await docTypeApi.batchEnable(ids);
    setSelectedRowKeys([]);
    queryClient.invalidateQueries({ queryKey: ['docTypes'] });
  };

  const handleBatchDisable = async (ids: number[]) => {
    await docTypeApi.batchDisable(ids);
    setSelectedRowKeys([]);
    queryClient.invalidateQueries({ queryKey: ['docTypes'] });
  };

  const handleBatchDelete = async (ids: number[]) => {
    await docTypeApi.batchDelete(ids);
    setSelectedRowKeys([]);
    setSelectedRows([]);
    queryClient.invalidateQueries({ queryKey: ['docTypes'] });
  };

  // 批量导出
  const handleBatchExport = (rows: DocType[]) => {
    exportToExcel(rows, docTypeExportColumns, '文件类型');
  };

  // 查看详情
  const handleViewDetail = (record: DocType) => {
    setDetailRecord(record);
    setDetailModalOpen(true);
  };

  // 表格行选择配置
  const rowSelection: TableRowSelection<DocType> = {
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    },
  };

  const columns: ColumnsType<DocType> = [
    { 
      title: '文件类型名称', 
      dataIndex: 'name', 
      key: 'name', 
      width: 160,
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)} style={{ color: '#1677ff' }}>{text}</a>
      ),
    },
    { title: '文件类型编码', dataIndex: 'code', key: 'code', width: 130 },
    { title: '所属项目阶段', dataIndex: 'projectPhase', key: 'projectPhase', width: 120 },
    { title: '所属大类', dataIndex: 'majorCategory', key: 'majorCategory', width: 100 },
    { title: '所属小类', dataIndex: 'minorCategory', key: 'minorCategory', width: 100 },
    { title: '适用项目类型', dataIndex: 'projectType', key: 'projectType', width: 140 },
    { title: '适用地区', dataIndex: 'region', key: 'region', width: 100 },
    { title: '适用业主', dataIndex: 'ownerOrg', key: 'ownerOrg', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (v) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="default">停用</Tag>,
    },
    { title: '业务说明/使用场景', dataIndex: 'bizDescription', key: 'bizDescription', width: 180, ellipsis: true },
    { title: '文件特征信息', dataIndex: 'fileFeature', key: 'fileFeature', width: 200, ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <ActionButtons
          record={record}
          recordName={record.name}
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
        <h2>文件类型</h2>
      </div>

      <div className="table-card">
        <FilterToolbar onClearFilters={handleClearFilters} hasActiveFilters={hasActiveFilters}>
          <Input.Search
            placeholder="搜索名称/说明"
            allowClear
            value={queryParams.keyword}
            onChange={(e) => !e.target.value && setQueryParams({ ...queryParams, keyword: undefined, page: 1 })}
            onSearch={(v) => setQueryParams({ ...queryParams, keyword: v || undefined, page: 1 })}
            style={{ width: 200 }}
          />
          <Select
            placeholder="所属项目阶段"
            allowClear
            value={queryParams.projectPhase}
            style={{ width: 140 }}
            options={projectPhaseOptions.map(p => ({ label: p, value: p }))}
            onChange={(v) => setQueryParams({ ...queryParams, projectPhase: v, page: 1 })}
          />
          <Select
            placeholder="状态"
            allowClear
            value={queryParams.status}
            style={{ width: 100 }}
            options={[
              { label: '启用', value: 1 },
              { label: '停用', value: 0 },
            ]}
            onChange={(v) => setQueryParams({ ...queryParams, status: v, page: 1 })}
          />
        </FilterToolbar>

        <BatchActions
          selectedRowKeys={selectedRowKeys}
          selectedRows={selectedRows}
          onBatchEnable={handleBatchEnable}
          onBatchDisable={handleBatchDisable}
          onBatchDelete={handleBatchDelete}
          onClearSelection={() => { setSelectedRowKeys([]); setSelectedRows([]); }}
          onBatchExport={handleBatchExport}
          entityName="文件类型"
        />

        <div className="action-buttons">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null);
              form.resetFields();
              setDrawerOpen(true);
            }}
          >
            新增
          </Button>
          <Button icon={<DownloadOutlined />} onClick={() => docTypeApi.downloadTemplate()}>
            下载模板
          </Button>
          <Button icon={<UploadOutlined />} onClick={() => setImportModalOpen(true)}>
            批量导入
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={data?.list}
          rowKey="id"
          loading={isLoading}
          rowSelection={rowSelection}
          scroll={{ x: 1400 }}
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
        title={editingId ? '编辑文件类型' : '新增文件类型'}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingId(null);
          form.resetFields();
        }}
        width={600}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button type="primary" onClick={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>
              保存
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="文件类型名称" rules={[{ required: true, message: '请输入文件类型名称' }]}>
            <Input placeholder="如：施工合同" />
          </Form.Item>
          <Form.Item name="code" label="文件类型编码" rules={[{ required: true, message: '请输入文件类型编码' }]}>
            <Input placeholder="如：SGHT" />
          </Form.Item>
          <Form.Item name="projectPhase" label="所属项目阶段">
            <Select placeholder="选择阶段" allowClear options={projectPhaseOptions.map(p => ({ label: p, value: p }))} />
          </Form.Item>
          <Form.Item name="majorCategory" label="所属大类">
            <Input placeholder="如：合同类" />
          </Form.Item>
          <Form.Item name="minorCategory" label="所属小类">
            <Input placeholder="如：施工合同" />
          </Form.Item>
          <Form.Item name="projectType" label="适用项目类型">
            <Input placeholder="如：房建,市政,公路" />
          </Form.Item>
          <Form.Item name="region" label="适用地区">
            <Input placeholder="如：全国" />
          </Form.Item>
          <Form.Item name="ownerOrg" label="适用业主">
            <Input placeholder="如：某某集团" />
          </Form.Item>
          <Form.Item name="bizDescription" label="业务说明/使用场景">
            <Input.TextArea rows={3} placeholder="请输入业务说明或使用场景" />
          </Form.Item>
          <Form.Item name="fileFeature" label="文件特征信息（用于LLM识别）">
            <Input.TextArea rows={3} placeholder="描述文件的关键特征，帮助AI识别文件类型，如：包含甲方乙方、工程名称、合同金额等关键信息" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注信息" />
          </Form.Item>
          {editingId && (
            <Form.Item name="status" label="状态">
              <Select
                options={[
                  { label: '启用', value: 1 },
                  { label: '停用', value: 0 },
                ]}
              />
            </Form.Item>
          )}
        </Form>
      </Drawer>

      <Modal
        title="批量导入"
        open={importModalOpen}
        onCancel={() => setImportModalOpen(false)}
        footer={null}
      >
        <Upload.Dragger
          accept=".xlsx,.xls"
          showUploadList={false}
          beforeUpload={handleImport}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ fontSize: 48, color: '#1677ff' }} />
          </p>
          <p className="ant-upload-text">点击或拖拽Excel文件到此处上传</p>
          <p className="ant-upload-hint">支持 .xlsx, .xls 格式</p>
        </Upload.Dragger>
      </Modal>

      <DetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="文件类型详情"
        record={detailRecord}
        fields={detailFields}
      />
    </div>
  );
}
