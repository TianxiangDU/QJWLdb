import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Input, Select, Form, Drawer, message, Tag, Upload, Modal } from 'antd';
import { PlusOutlined, UploadOutlined, EyeOutlined, FileOutlined, FilePdfOutlined, FileWordOutlined, FileImageOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import type { Key } from 'react';
import type { UploadFile } from 'antd/es/upload/interface';
import { docTemplateSampleApi, docTypeApi, DocTemplateSample, QueryParams } from '../../services/api';
import ActionButtons from '../../components/ActionButtons';
import FilterToolbar from '../../components/FilterToolbar';
import BatchActions from '../../components/BatchActions';
import DetailModal, { renderStatus } from '../../components/DetailModal';
import { exportToExcel, docTemplateSampleExportColumns } from '../../utils/exportExcel';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000' : `http://${window.location.hostname}:3000`;

const getFileIcon = (filePath: string) => {
  if (!filePath) return <FileOutlined />;
  const ext = filePath.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
  if (['doc', 'docx'].includes(ext || '')) return <FileWordOutlined style={{ color: '#1890ff' }} />;
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return <FileImageOutlined style={{ color: '#52c41a' }} />;
  return <FileOutlined />;
};

const isPreviewable = (filePath: string) => {
  if (!filePath) return false;
  const ext = filePath.split('.').pop()?.toLowerCase();
  return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
};

const defaultQueryParams: QueryParams = { page: 1, pageSize: 10 };

const detailFields = [
  { key: 'fileName', label: '文件名称' },
  { key: 'docType.name', label: '所属文件类型', render: (_: any, r: any) => r.docType?.name || '-' },
  { key: 'docType.code', label: '所属文件类型编码', render: (_: any, r: any) => r.docType?.code || '-' },
  { key: 'status', label: '状态', render: renderStatus },
  { key: 'filePath', label: '文件路径' },
  { key: 'description', label: '说明', span: 2 },
];

export default function DocTemplateSamplePage() {
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [queryParams, setQueryParams] = useState<QueryParams>(defaultQueryParams);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<DocTemplateSample[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<DocTemplateSample | null>(null);
  const queryClient = useQueryClient();

  const hasActiveFilters = !!(queryParams.keyword || queryParams.docTypeIds);

  const { data, isLoading } = useQuery({
    queryKey: ['docTemplateSamples', queryParams],
    queryFn: () => docTemplateSampleApi.list(queryParams),
  });

  const { data: docTypes } = useQuery({
    queryKey: ['docTypesAll'],
    queryFn: () => docTypeApi.all(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<DocTemplateSample>) => docTemplateSampleApi.create(data),
    onSuccess: () => { message.success('创建成功'); setDrawerOpen(false); form.resetFields(); queryClient.invalidateQueries({ queryKey: ['docTemplateSamples'] }); },
    onError: (err: any) => message.error(err.response?.data?.message || '创建失败'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DocTemplateSample> }) => docTemplateSampleApi.update(id, data),
    onSuccess: () => { message.success('更新成功'); setDrawerOpen(false); setEditingId(null); form.resetFields(); queryClient.invalidateQueries({ queryKey: ['docTemplateSamples'] }); },
    onError: (err: any) => message.error(err.response?.data?.message || '更新失败'),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) => docTemplateSampleApi.update(id, { status }),
    onSuccess: (_, variables) => { message.success(variables.status === 1 ? '启用成功' : '停用成功'); queryClient.invalidateQueries({ queryKey: ['docTemplateSamples'] }); },
    onError: () => message.error('操作失败'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => docTemplateSampleApi.delete(id),
    onSuccess: () => { message.success('删除成功'); queryClient.invalidateQueries({ queryKey: ['docTemplateSamples'] }); },
    onError: () => message.error('删除失败'),
  });

  const buildFileUrl = (filePath: string) => {
    if (filePath.startsWith('http')) return filePath;
    const staticPath = filePath.startsWith('/static/') ? filePath : `/static/${filePath}`;
    return `${API_BASE}${staticPath}`;
  };

  const handleEdit = (record: DocTemplateSample) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    if (record.filePath) {
      setFileList([{ uid: '-1', name: record.fileName || '文件', status: 'done', url: buildFileUrl(record.filePath) }]);
    } else {
      setFileList([]);
    }
    setDrawerOpen(true);
  };

  const handlePreview = (filePath: string, fileName: string) => {
    setPreviewUrl(buildFileUrl(filePath));
    setPreviewTitle(fileName);
    setPreviewVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (fileList.length > 0 && fileList[0].response?.filePath) {
        values.filePath = fileList[0].response.filePath;
      } else if (fileList.length > 0 && fileList[0].url) {
        let url = fileList[0].url;
        if (url.startsWith(API_BASE)) url = url.replace(API_BASE, '');
        if (url.startsWith('/static/')) url = url.replace('/static/', '');
        values.filePath = url;
      }
      if (editingId) { updateMutation.mutate({ id: editingId, data: values }); }
      else { createMutation.mutate(values); }
    } catch (error) { console.error('Validation failed:', error); }
  };

  const handleClearFilters = () => setQueryParams(defaultQueryParams);
  const clearSelection = () => { setSelectedRowKeys([]); setSelectedRows([]); };

  const handleBatchEnable = async (ids: number[]) => { await docTemplateSampleApi.batchEnable(ids); clearSelection(); queryClient.invalidateQueries({ queryKey: ['docTemplateSamples'] }); };
  const handleBatchDisable = async (ids: number[]) => { await docTemplateSampleApi.batchDisable(ids); clearSelection(); queryClient.invalidateQueries({ queryKey: ['docTemplateSamples'] }); };
  const handleBatchDelete = async (ids: number[]) => { await docTemplateSampleApi.batchDelete(ids); clearSelection(); queryClient.invalidateQueries({ queryKey: ['docTemplateSamples'] }); };
  const handleBatchExport = (rows: DocTemplateSample[]) => { exportToExcel(rows, docTemplateSampleExportColumns, '文件模板示例'); };
  const handleViewDetail = (record: DocTemplateSample) => { setDetailRecord(record); setDetailModalOpen(true); };

  const rowSelection: TableRowSelection<DocTemplateSample> = {
    selectedRowKeys,
    onChange: (keys: Key[], rows: DocTemplateSample[]) => { setSelectedRowKeys(keys); setSelectedRows(rows); },
  };

  const columns: ColumnsType<DocTemplateSample> = [
    { title: '文件名称', dataIndex: 'fileName', key: 'fileName', width: 200, render: (text, record) => <a onClick={() => handleViewDetail(record)} style={{ color: '#1677ff' }}>{text}</a> },
    { title: '所属文件类型', dataIndex: ['docType', 'name'], key: 'docTypeName', width: 160 },
    { title: '所属文件类型编码', dataIndex: ['docType', 'code'], key: 'docTypeCode', width: 140 },
    {
      title: '文件', dataIndex: 'filePath', key: 'filePath', width: 100,
      render: (filePath, record) => {
        if (!filePath) return <span style={{ color: '#999' }}>未上传</span>;
        return (
          <Space>
            {getFileIcon(filePath)}
            {isPreviewable(filePath) ? (
              <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handlePreview(filePath, record.fileName)}>预览</Button>
            ) : (
              <a href={buildFileUrl(filePath)} target="_blank" rel="noopener noreferrer">下载</a>
            )}
          </Space>
        );
      },
    },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="default">停用</Tag> },
    { title: '说明', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '操作', key: 'action', width: 150, fixed: 'right',
      render: (_, record) => (
        <ActionButtons record={record} recordName={record.fileName} showView onView={() => handleViewDetail(record)} onEdit={() => handleEdit(record)} onToggleStatus={(id, status) => toggleStatusMutation.mutate({ id, status })} onDelete={(id) => deleteMutation.mutate(id)} />
      ),
    },
  ];

  return (
    <div>
      <div className="page-header"><h2>文件模板/示例</h2></div>

      <div className="table-card">
        <FilterToolbar onClearFilters={handleClearFilters} hasActiveFilters={hasActiveFilters}>
          <Input.Search placeholder="搜索文件名称/说明/文件类型" allowClear value={queryParams.keyword} onChange={(e) => !e.target.value && setQueryParams({ ...queryParams, keyword: undefined, page: 1 })} onSearch={(v) => setQueryParams({ ...queryParams, keyword: v || undefined, page: 1 })} style={{ width: 260 }} />
          <Select placeholder="选择文件类型" allowClear showSearch mode="multiple" maxTagCount={2} optionFilterProp="label" style={{ width: 280 }} options={docTypes?.map(d => ({ label: `${d.code} - ${d.name}`, value: d.id }))} onChange={(v) => setQueryParams({ ...queryParams, docTypeIds: v?.join(','), page: 1 })} />
        </FilterToolbar>

        <BatchActions selectedRowKeys={selectedRowKeys} selectedRows={selectedRows} onBatchEnable={handleBatchEnable} onBatchDisable={handleBatchDisable} onBatchDelete={handleBatchDelete} onClearSelection={clearSelection} onBatchExport={handleBatchExport} entityName="模板" />

        <div className="action-buttons">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setFileList([]); setDrawerOpen(true); }}>新增</Button>
        </div>

        <Table columns={columns} dataSource={data?.list} rowKey="id" loading={isLoading} rowSelection={rowSelection} scroll={{ x: 900 }} pagination={{ current: queryParams.page, pageSize: queryParams.pageSize, total: data?.total, showSizeChanger: true, showTotal: (total) => `共 ${total} 条`, onChange: (page, pageSize) => setQueryParams({ ...queryParams, page, pageSize }) }} />
      </div>

      <Drawer title={editingId ? '编辑文件模板/示例' : '新增文件模板/示例'} open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditingId(null); form.resetFields(); }} width={500} extra={<Space><Button onClick={() => setDrawerOpen(false)}>取消</Button><Button type="primary" onClick={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>保存</Button></Space>}>
        <Form form={form} layout="vertical">
          <Form.Item name="docTypeId" label="所属文件类型" rules={[{ required: true, message: '请选择文件类型' }]}>
            <Select showSearch optionFilterProp="label" placeholder="选择文件类型" options={docTypes?.map(d => ({ label: `${d.code} - ${d.name}`, value: d.id }))} />
          </Form.Item>
          <Form.Item name="fileName" label="文件名称" rules={[{ required: true, message: '请输入文件名称' }]}>
            <Input placeholder="如：施工合同模板" />
          </Form.Item>
          <Form.Item label="上传文件" extra="支持 PDF、Word、图片等格式">
            <Upload action={`${API_BASE}/api/v1/files/upload`} fileList={fileList} onChange={({ fileList: newFileList }) => { setFileList(newFileList); if (newFileList.length > 0 && newFileList[0].status === 'done') { const fileName = form.getFieldValue('fileName'); if (!fileName && newFileList[0].name) { form.setFieldValue('fileName', newFileList[0].name.replace(/\.[^.]+$/, '')); } } }} onRemove={() => { setFileList([]); return true; }} maxCount={1}>
              {fileList.length === 0 && <Button icon={<UploadOutlined />}>选择文件</Button>}
            </Upload>
          </Form.Item>
          <Form.Item name="description" label="说明"><Input.TextArea rows={4} placeholder="描述该文件的用途和说明" /></Form.Item>
        </Form>
      </Drawer>

      <Modal title={previewTitle} open={previewVisible} onCancel={() => setPreviewVisible(false)} footer={[<Button key="close" onClick={() => setPreviewVisible(false)}>关闭</Button>, <Button key="download" type="primary" href={previewUrl} target="_blank">新窗口打开</Button>]} width={900} style={{ top: 20 }}>
        {previewUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? <img src={previewUrl} alt={previewTitle} style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }} /> : <iframe src={previewUrl} title={previewTitle} style={{ width: '100%', height: '70vh', border: 'none' }} />}
      </Modal>

      <DetailModal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="文件模板/示例详情" record={detailRecord} fields={detailFields} />
    </div>
  );
}
