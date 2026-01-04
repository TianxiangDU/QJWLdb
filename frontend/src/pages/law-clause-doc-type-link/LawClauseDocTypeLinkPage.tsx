import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Select, Form, Drawer, message, Tag, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType, TableRowSelection } from 'antd/es/table';
import { lawClauseDocTypeLinkApi, lawDocumentApi, lawClauseApi, docTypeApi, LawClauseDocTypeLink, QueryParams } from '../../services/api';
import ActionButtons from '../../components/ActionButtons';
import FilterToolbar from '../../components/FilterToolbar';
import BatchActions from '../../components/BatchActions';
import DetailModal, { renderStatus } from '../../components/DetailModal';
import { exportToExcel } from '../../utils/exportExcel';

const applicabilityLevelOptions = ['必须遵守', '建议遵守', '参考'];
const defaultQueryParams: QueryParams = { page: 1, pageSize: 10 };

const exportColumns = [
  { key: 'lawCode', title: '法规编号' },
  { key: 'lawName', title: '法规名称' },
  { key: 'lawClause.clauseNo', title: '条款编号' },
  { key: 'docTypeName', title: '文件类型' },
  { key: 'applicabilityLevel', title: '适用程度' },
  { key: 'applicabilityDescription', title: '适用说明' },
];

const detailFields = [
  { key: 'lawCode', label: '法规编号' },
  { key: 'lawName', label: '法规名称' },
  { key: 'lawClause.clauseNo', label: '条款编号', render: (_: any, r: any) => r.lawClause?.clauseNo || '-' },
  { key: 'docTypeName', label: '文件类型' },
  { key: 'applicabilityLevel', label: '适用程度', render: (v: string) => { const c = v === '必须遵守' ? 'red' : v === '建议遵守' ? 'orange' : 'default'; return v ? <Tag color={c}>{v}</Tag> : '-'; } },
  { key: 'status', label: '状态', render: renderStatus },
  { key: 'applicabilityDescription', label: '适用说明', span: 2 },
  { key: 'remark', label: '备注', span: 2 },
];

export default function LawClauseDocTypeLinkPage() {
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [queryParams, setQueryParams] = useState<QueryParams>(defaultQueryParams);
  const [selectedLawDocumentId, setSelectedLawDocumentId] = useState<number | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<LawClauseDocTypeLink[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<LawClauseDocTypeLink | null>(null);
  const queryClient = useQueryClient();

  const hasActiveFilters = !!(queryParams.lawDocumentId || queryParams.docTypeId);

  const { data, isLoading } = useQuery({ queryKey: ['lawClauseDocTypeLinks', queryParams], queryFn: () => lawClauseDocTypeLinkApi.list(queryParams) });
  const { data: lawDocuments } = useQuery({ queryKey: ['lawDocumentsAll'], queryFn: () => lawDocumentApi.all() });
  const { data: lawClauses } = useQuery({ queryKey: ['lawClauses', selectedLawDocumentId], queryFn: () => selectedLawDocumentId ? lawClauseApi.byLaw(selectedLawDocumentId) : Promise.resolve([]), enabled: !!selectedLawDocumentId });
  const { data: docTypes } = useQuery({ queryKey: ['docTypesAll'], queryFn: () => docTypeApi.all() });

  const createMutation = useMutation({
    mutationFn: (data: Partial<LawClauseDocTypeLink>) => lawClauseDocTypeLinkApi.create(data),
    onSuccess: () => { message.success('创建成功'); setDrawerOpen(false); form.resetFields(); setSelectedLawDocumentId(null); queryClient.invalidateQueries({ queryKey: ['lawClauseDocTypeLinks'] }); },
    onError: (err: any) => message.error(err.response?.data?.message || '创建失败'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LawClauseDocTypeLink> }) => lawClauseDocTypeLinkApi.update(id, data),
    onSuccess: () => { message.success('更新成功'); setDrawerOpen(false); setEditingId(null); form.resetFields(); setSelectedLawDocumentId(null); queryClient.invalidateQueries({ queryKey: ['lawClauseDocTypeLinks'] }); },
    onError: (err: any) => message.error(err.response?.data?.message || '更新失败'),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) => lawClauseDocTypeLinkApi.update(id, { status }),
    onSuccess: (_, variables) => { message.success(variables.status === 1 ? '启用成功' : '停用成功'); queryClient.invalidateQueries({ queryKey: ['lawClauseDocTypeLinks'] }); },
    onError: () => message.error('操作失败'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => lawClauseDocTypeLinkApi.delete(id),
    onSuccess: () => { message.success('删除成功'); queryClient.invalidateQueries({ queryKey: ['lawClauseDocTypeLinks'] }); },
    onError: () => message.error('删除失败'),
  });

  const handleEdit = (record: LawClauseDocTypeLink) => { setEditingId(record.id); setSelectedLawDocumentId(record.lawDocumentId || null); form.setFieldsValue(record); setDrawerOpen(true); };
  const handleSubmit = async () => { try { const values = await form.validateFields(); const lawDoc = lawDocuments?.find(d => d.id === values.lawDocumentId); const docType = docTypes?.find(d => d.id === values.docTypeId); const data = { ...values, lawCode: lawDoc?.lawCode, lawName: lawDoc?.lawName, docTypeName: docType?.name }; if (editingId) { updateMutation.mutate({ id: editingId, data }); } else { createMutation.mutate(data); } } catch (error) { console.error('Validation failed:', error); } };

  const handleClearFilters = () => setQueryParams(defaultQueryParams);
  const clearSelection = () => { setSelectedRowKeys([]); setSelectedRows([]); };
  const handleBatchEnable = async (ids: number[]) => { await lawClauseDocTypeLinkApi.batchEnable(ids); clearSelection(); queryClient.invalidateQueries({ queryKey: ['lawClauseDocTypeLinks'] }); };
  const handleBatchDisable = async (ids: number[]) => { await lawClauseDocTypeLinkApi.batchDisable(ids); clearSelection(); queryClient.invalidateQueries({ queryKey: ['lawClauseDocTypeLinks'] }); };
  const handleBatchDelete = async (ids: number[]) => { await lawClauseDocTypeLinkApi.batchDelete(ids); clearSelection(); queryClient.invalidateQueries({ queryKey: ['lawClauseDocTypeLinks'] }); };
  const handleBatchExport = (rows: LawClauseDocTypeLink[]) => { exportToExcel(rows, exportColumns, '条款与文件类型适用关系'); };
  const handleViewDetail = (record: LawClauseDocTypeLink) => { setDetailRecord(record); setDetailModalOpen(true); };

  const rowSelection: TableRowSelection<LawClauseDocTypeLink> = { selectedRowKeys, onChange: (keys, rows) => { setSelectedRowKeys(keys); setSelectedRows(rows); } };

  const columns: ColumnsType<LawClauseDocTypeLink> = [
    { title: '法规编号', dataIndex: 'lawCode', key: 'lawCode', width: 130 },
    { title: '法规名称', dataIndex: 'lawName', key: 'lawName', width: 200, ellipsis: true, render: (text, record) => <a onClick={() => handleViewDetail(record)} style={{ color: '#1677ff' }}>{text}</a> },
    { title: '条款编号', dataIndex: ['lawClause', 'clauseNo'], key: 'clauseNo', width: 100 },
    { title: '文件类型', dataIndex: 'docTypeName', key: 'docTypeName', width: 150 },
    { title: '适用程度', dataIndex: 'applicabilityLevel', key: 'applicabilityLevel', width: 100, render: (v) => { const c = v === '必须遵守' ? 'red' : v === '建议遵守' ? 'orange' : 'default'; return v ? <Tag color={c}>{v}</Tag> : '-'; } },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="default">停用</Tag> },
    { title: '适用说明', dataIndex: 'applicabilityDescription', key: 'applicabilityDescription', ellipsis: true },
    { title: '操作', key: 'action', width: 150, fixed: 'right', render: (_, record) => <ActionButtons record={record} recordName="该关联关系" showView onView={() => handleViewDetail(record)} onEdit={() => handleEdit(record)} onToggleStatus={(id, status) => toggleStatusMutation.mutate({ id, status })} onDelete={(id) => deleteMutation.mutate(id)} /> },
  ];

  return (
    <div>
      <div className="page-header"><h2>条款与文件类型适用关系</h2></div>
      <div className="table-card">
        <FilterToolbar onClearFilters={handleClearFilters} hasActiveFilters={hasActiveFilters}>
          <Select placeholder="法规" allowClear showSearch optionFilterProp="label" value={queryParams.lawDocumentId} style={{ width: 250 }} options={lawDocuments?.map(d => ({ label: `${d.lawCode} - ${d.lawName}`, value: d.id }))} onChange={(v) => setQueryParams({ ...queryParams, lawDocumentId: v, page: 1 })} />
          <Select placeholder="文件类型" allowClear showSearch optionFilterProp="label" value={queryParams.docTypeId} style={{ width: 180 }} options={docTypes?.map(d => ({ label: d.name, value: d.id }))} onChange={(v) => setQueryParams({ ...queryParams, docTypeId: v, page: 1 })} />
        </FilterToolbar>

        <BatchActions selectedRowKeys={selectedRowKeys} selectedRows={selectedRows} onBatchEnable={handleBatchEnable} onBatchDisable={handleBatchDisable} onBatchDelete={handleBatchDelete} onClearSelection={clearSelection} onBatchExport={handleBatchExport} entityName="关联" />

        <div className="action-buttons">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setSelectedLawDocumentId(null); setDrawerOpen(true); }}>新增</Button>
        </div>

        <Table columns={columns} dataSource={data?.list} rowKey="id" loading={isLoading} rowSelection={rowSelection} scroll={{ x: 1100 }} pagination={{ current: queryParams.page, pageSize: queryParams.pageSize, total: data?.total, showSizeChanger: true, showTotal: (total) => `共 ${total} 条`, onChange: (page, pageSize) => setQueryParams({ ...queryParams, page, pageSize }) }} />
      </div>

      <Drawer title={editingId ? '编辑关联' : '新增关联'} open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditingId(null); form.resetFields(); setSelectedLawDocumentId(null); }} width={600} extra={<Space><Button onClick={() => setDrawerOpen(false)}>取消</Button><Button type="primary" onClick={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>保存</Button></Space>}>
        <Form form={form} layout="vertical">
          <Form.Item name="lawDocumentId" label="法规" rules={[{ required: true }]}><Select showSearch optionFilterProp="label" placeholder="选择法规" options={lawDocuments?.map(d => ({ label: `${d.lawCode} - ${d.lawName}`, value: d.id }))} onChange={(v) => setSelectedLawDocumentId(v)} /></Form.Item>
          <Form.Item name="lawClauseId" label="条款" rules={[{ required: true }]}><Select showSearch optionFilterProp="label" placeholder="选择条款" options={lawClauses?.map(c => ({ label: `${c.clauseNo} - ${c.clauseTitle || ''}`, value: c.id }))} disabled={!selectedLawDocumentId} /></Form.Item>
          <Form.Item name="docTypeId" label="文件类型" rules={[{ required: true }]}><Select showSearch optionFilterProp="label" placeholder="选择文件类型" options={docTypes?.map(d => ({ label: `${d.code} - ${d.name}`, value: d.id }))} /></Form.Item>
          <Form.Item name="applicabilityLevel" label="适用程度"><Select placeholder="选择程度" options={applicabilityLevelOptions.map(l => ({ label: l, value: l }))} /></Form.Item>
          <Form.Item name="applicabilityDescription" label="适用说明"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Drawer>

      <DetailModal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="适用关系详情" record={detailRecord} fields={detailFields} />
    </div>
  );
}
