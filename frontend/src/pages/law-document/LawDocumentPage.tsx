import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Input, Select, Form, Drawer, message, Tag, Upload, Modal, DatePicker } from 'antd';
import { PlusOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType, TableRowSelection } from 'antd/es/table';
import dayjs from 'dayjs';
import { lawDocumentApi, LawDocument, QueryParams } from '../../services/api';
import ActionButtons from '../../components/ActionButtons';
import FilterToolbar from '../../components/FilterToolbar';
import BatchActions from '../../components/BatchActions';
import DetailModal, { renderStatus } from '../../components/DetailModal';
import { exportToExcel, lawDocumentExportColumns } from '../../utils/exportExcel';

const lawCategoryOptions = ['法律', '行政法规', '部门规章', '国家标准', '行业标准', '地方标准', '企业制度'];
const lawStatusOptions = ['有效', '已废止', '被替代'];
const defaultQueryParams: QueryParams = { page: 1, pageSize: 10 };

const detailFields = [
  { key: 'lawCode', label: '法规编号' },
  { key: 'lawName', label: '法规名称' },
  { key: 'lawCategory', label: '文种类别' },
  { key: 'issueOrg', label: '发布单位' },
  { key: 'issueDate', label: '发布日期', render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-' },
  { key: 'effectiveDate', label: '实施日期', render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-' },
  { key: 'expiryDate', label: '失效日期', render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-' },
  { key: 'lawStatus', label: '法规状态', render: (v: string) => { const c = v === '有效' ? 'green' : v === '已废止' ? 'red' : 'orange'; return <Tag color={c}>{v || '-'}</Tag>; } },
  { key: 'status', label: '记录状态', render: renderStatus },
  { key: 'regionScope', label: '适用地区范围' },
  { key: 'industryScope', label: '适用行业范围' },
  { key: 'summary', label: '摘要/要点说明', span: 2 },
  { key: 'remark', label: '备注', span: 2 },
];

export default function LawDocumentPage() {
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [queryParams, setQueryParams] = useState<QueryParams>(defaultQueryParams);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<LawDocument[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<LawDocument | null>(null);
  const queryClient = useQueryClient();

  const hasActiveFilters = !!(queryParams.keyword || queryParams.lawCategory || queryParams.lawStatus);

  const { data, isLoading } = useQuery({ queryKey: ['lawDocuments', queryParams], queryFn: () => lawDocumentApi.list(queryParams) });

  const createMutation = useMutation({
    mutationFn: (data: Partial<LawDocument>) => lawDocumentApi.create(data),
    onSuccess: () => { message.success('创建成功'); setDrawerOpen(false); form.resetFields(); queryClient.invalidateQueries({ queryKey: ['lawDocuments'] }); },
    onError: (err: any) => message.error(err.response?.data?.message || '创建失败'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LawDocument> }) => lawDocumentApi.update(id, data),
    onSuccess: () => { message.success('更新成功'); setDrawerOpen(false); setEditingId(null); form.resetFields(); queryClient.invalidateQueries({ queryKey: ['lawDocuments'] }); },
    onError: (err: any) => message.error(err.response?.data?.message || '更新失败'),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) => lawDocumentApi.update(id, { status }),
    onSuccess: (_, variables) => { message.success(variables.status === 1 ? '启用成功' : '停用成功'); queryClient.invalidateQueries({ queryKey: ['lawDocuments'] }); },
    onError: () => message.error('操作失败'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => lawDocumentApi.delete(id),
    onSuccess: () => { message.success('删除成功'); queryClient.invalidateQueries({ queryKey: ['lawDocuments'] }); },
    onError: () => message.error('删除失败'),
  });

  const handleEdit = (record: LawDocument) => { setEditingId(record.id); form.setFieldsValue({ ...record, issueDate: record.issueDate ? dayjs(record.issueDate) : null, effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : null, expiryDate: record.expiryDate ? dayjs(record.expiryDate) : null }); setDrawerOpen(true); };
  const handleSubmit = async () => { try { const values = await form.validateFields(); const data = { ...values, issueDate: values.issueDate?.format('YYYY-MM-DD'), effectiveDate: values.effectiveDate?.format('YYYY-MM-DD'), expiryDate: values.expiryDate?.format('YYYY-MM-DD') }; if (editingId) { updateMutation.mutate({ id: editingId, data }); } else { createMutation.mutate(data); } } catch (error) { console.error('Validation failed:', error); } };
  const handleImport = async (file: File) => { try { const result: any = await lawDocumentApi.import(file); message.success(`导入完成：成功 ${result.success} 条`); queryClient.invalidateQueries({ queryKey: ['lawDocuments'] }); setImportModalOpen(false); } catch (error) { message.error('导入失败'); } return false; };

  const handleClearFilters = () => setQueryParams(defaultQueryParams);
  const clearSelection = () => { setSelectedRowKeys([]); setSelectedRows([]); };
  const handleBatchEnable = async (ids: number[]) => { await lawDocumentApi.batchEnable(ids); clearSelection(); queryClient.invalidateQueries({ queryKey: ['lawDocuments'] }); };
  const handleBatchDisable = async (ids: number[]) => { await lawDocumentApi.batchDisable(ids); clearSelection(); queryClient.invalidateQueries({ queryKey: ['lawDocuments'] }); };
  const handleBatchDelete = async (ids: number[]) => { await lawDocumentApi.batchDelete(ids); clearSelection(); queryClient.invalidateQueries({ queryKey: ['lawDocuments'] }); };
  const handleBatchExport = (rows: LawDocument[]) => { exportToExcel(rows, lawDocumentExportColumns, '法规与标准'); };
  const handleViewDetail = (record: LawDocument) => { setDetailRecord(record); setDetailModalOpen(true); };

  const rowSelection: TableRowSelection<LawDocument> = { selectedRowKeys, onChange: (keys, rows) => { setSelectedRowKeys(keys); setSelectedRows(rows); } };

  const columns: ColumnsType<LawDocument> = [
    { title: '法规编号', dataIndex: 'lawCode', key: 'lawCode', width: 150 },
    { title: '法规名称', dataIndex: 'lawName', key: 'lawName', width: 250, render: (text, record) => <a onClick={() => handleViewDetail(record)} style={{ color: '#1677ff' }}>{text}</a> },
    { title: '文种类别', dataIndex: 'lawCategory', key: 'lawCategory', width: 100 },
    { title: '发布单位', dataIndex: 'issueOrg', key: 'issueOrg', width: 150 },
    { title: '实施日期', dataIndex: 'effectiveDate', key: 'effectiveDate', width: 120, render: (v) => v ? dayjs(v).format('YYYY-MM-DD') : '-' },
    { title: '法规状态', dataIndex: 'lawStatus', key: 'lawStatus', width: 100, render: (v) => { const c = v === '有效' ? 'green' : v === '已废止' ? 'red' : 'orange'; return <Tag color={c}>{v}</Tag>; } },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="default">停用</Tag> },
    { title: '操作', key: 'action', width: 150, fixed: 'right', render: (_, record) => <ActionButtons record={record} recordName={record.lawName} showView onView={() => handleViewDetail(record)} onEdit={() => handleEdit(record)} onToggleStatus={(id, status) => toggleStatusMutation.mutate({ id, status })} onDelete={(id) => deleteMutation.mutate(id)} /> },
  ];

  return (
    <div>
      <div className="page-header"><h2>法规与标准</h2></div>
      <div className="table-card">
        <FilterToolbar onClearFilters={handleClearFilters} hasActiveFilters={hasActiveFilters}>
          <Input.Search placeholder="搜索名称/摘要" allowClear value={queryParams.keyword} onChange={(e) => !e.target.value && setQueryParams({ ...queryParams, keyword: undefined, page: 1 })} onSearch={(v) => setQueryParams({ ...queryParams, keyword: v || undefined, page: 1 })} style={{ width: 200 }} />
          <Select placeholder="文种类别" allowClear value={queryParams.lawCategory} style={{ width: 140 }} options={lawCategoryOptions.map(c => ({ label: c, value: c }))} onChange={(v) => setQueryParams({ ...queryParams, lawCategory: v, page: 1 })} />
          <Select placeholder="法规状态" allowClear value={queryParams.lawStatus} style={{ width: 120 }} options={lawStatusOptions.map(s => ({ label: s, value: s }))} onChange={(v) => setQueryParams({ ...queryParams, lawStatus: v, page: 1 })} />
        </FilterToolbar>

        <BatchActions selectedRowKeys={selectedRowKeys} selectedRows={selectedRows} onBatchEnable={handleBatchEnable} onBatchDisable={handleBatchDisable} onBatchDelete={handleBatchDelete} onClearSelection={clearSelection} onBatchExport={handleBatchExport} entityName="法规" />

        <div className="action-buttons">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setDrawerOpen(true); }}>新增</Button>
          <Button icon={<DownloadOutlined />} onClick={() => lawDocumentApi.downloadTemplate()}>下载模板</Button>
          <Button icon={<UploadOutlined />} onClick={() => setImportModalOpen(true)}>批量导入</Button>
        </div>

        <Table columns={columns} dataSource={data?.list} rowKey="id" loading={isLoading} rowSelection={rowSelection} scroll={{ x: 1100 }} pagination={{ current: queryParams.page, pageSize: queryParams.pageSize, total: data?.total, showSizeChanger: true, showTotal: (total) => `共 ${total} 条`, onChange: (page, pageSize) => setQueryParams({ ...queryParams, page, pageSize }) }} />
      </div>

      <Drawer title={editingId ? '编辑法规与标准' : '新增法规与标准'} open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditingId(null); form.resetFields(); }} width={700} extra={<Space><Button onClick={() => setDrawerOpen(false)}>取消</Button><Button type="primary" onClick={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>保存</Button></Space>}>
        <Form form={form} layout="vertical">
          <Form.Item name="lawCode" label="法规编号" rules={[{ required: true, message: '请输入编号' }]}><Input placeholder="如：GB50500-2013" /></Form.Item>
          <Form.Item name="lawName" label="法规名称" rules={[{ required: true, message: '请输入名称' }]}><Input placeholder="如：建设工程工程量清单计价规范" /></Form.Item>
          <Form.Item name="lawCategory" label="文种类别"><Select placeholder="选择类别" options={lawCategoryOptions.map(c => ({ label: c, value: c }))} /></Form.Item>
          <Form.Item name="issueOrg" label="发布单位"><Input placeholder="如：住房和城乡建设部" /></Form.Item>
          <Form.Item name="issueDate" label="发布日期"><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="effectiveDate" label="实施日期"><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="expiryDate" label="失效日期"><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="regionScope" label="适用地区范围"><Input /></Form.Item>
          <Form.Item name="industryScope" label="适用行业范围"><Input /></Form.Item>
          <Form.Item name="lawStatus" label="当前状态"><Select placeholder="选择状态" options={lawStatusOptions.map(s => ({ label: s, value: s }))} /></Form.Item>
          <Form.Item name="summary" label="摘要/要点说明"><Input.TextArea rows={4} /></Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Drawer>

      <Modal title="批量导入" open={importModalOpen} onCancel={() => setImportModalOpen(false)} footer={null}>
        <Upload.Dragger accept=".xlsx,.xls" showUploadList={false} beforeUpload={handleImport}>
          <p className="ant-upload-drag-icon"><UploadOutlined style={{ fontSize: 48, color: '#1677ff' }} /></p>
          <p className="ant-upload-text">点击或拖拽Excel文件到此处上传</p>
        </Upload.Dragger>
      </Modal>

      <DetailModal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="法规与标准详情" record={detailRecord} fields={detailFields} />
    </div>
  );
}
