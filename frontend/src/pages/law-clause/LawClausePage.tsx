import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Input, Select, Form, Drawer, message, Tag, Upload, Modal } from 'antd';
import { PlusOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType, TableRowSelection } from 'antd/es/table';
import { lawClauseApi, lawDocumentApi, LawClause, QueryParams } from '../../services/api';
import ActionButtons from '../../components/ActionButtons';
import FilterToolbar from '../../components/FilterToolbar';
import BatchActions from '../../components/BatchActions';
import DetailModal, { renderStatus } from '../../components/DetailModal';
import { exportToExcel, lawClauseExportColumns } from '../../utils/exportExcel';

const importanceLevelOptions = ['一般', '重要', '关键'];
const defaultQueryParams: QueryParams = { page: 1, pageSize: 10 };

const detailFields = [
  { key: 'lawCode', label: '法规编号' },
  { key: 'lawName', label: '法规名称' },
  { key: 'clauseNo', label: '条款编号' },
  { key: 'clauseTitle', label: '条款标题' },
  { key: 'levelLabel', label: '层级' },
  { key: 'parentClauseNo', label: '上级条款编号' },
  { key: 'importanceLevel', label: '重要程度', render: (v: string) => { const c = v === '关键' ? 'red' : v === '重要' ? 'orange' : 'default'; return v ? <Tag color={c}>{v}</Tag> : '-'; } },
  { key: 'status', label: '状态', render: renderStatus },
  { key: 'keywords', label: '关键词' },
  { key: 'topicTags', label: '主题标签' },
  { key: 'clauseText', label: '条款内容', span: 2 },
  { key: 'clauseSummary', label: '条款要点', span: 2 },
  { key: 'remark', label: '备注', span: 2 },
];

export default function LawClausePage() {
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [queryParams, setQueryParams] = useState<QueryParams>(defaultQueryParams);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<LawClause[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<LawClause | null>(null);
  const queryClient = useQueryClient();

  const hasActiveFilters = !!(queryParams.keyword || queryParams.lawDocumentId || queryParams.importanceLevel);

  const { data, isLoading } = useQuery({ queryKey: ['lawClauses', queryParams], queryFn: () => lawClauseApi.list(queryParams) });
  const { data: lawDocuments } = useQuery({ queryKey: ['lawDocumentsAll'], queryFn: () => lawDocumentApi.all() });

  const createMutation = useMutation({
    mutationFn: (data: Partial<LawClause>) => lawClauseApi.create(data),
    onSuccess: () => { message.success('创建成功'); setDrawerOpen(false); form.resetFields(); queryClient.invalidateQueries({ queryKey: ['lawClauses'] }); },
    onError: (err: any) => message.error(err.response?.data?.message || '创建失败'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LawClause> }) => lawClauseApi.update(id, data),
    onSuccess: () => { message.success('更新成功'); setDrawerOpen(false); setEditingId(null); form.resetFields(); queryClient.invalidateQueries({ queryKey: ['lawClauses'] }); },
    onError: (err: any) => message.error(err.response?.data?.message || '更新失败'),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) => lawClauseApi.update(id, { status }),
    onSuccess: (_, variables) => { message.success(variables.status === 1 ? '启用成功' : '停用成功'); queryClient.invalidateQueries({ queryKey: ['lawClauses'] }); },
    onError: () => message.error('操作失败'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => lawClauseApi.delete(id),
    onSuccess: () => { message.success('删除成功'); queryClient.invalidateQueries({ queryKey: ['lawClauses'] }); },
    onError: () => message.error('删除失败'),
  });

  const handleEdit = (record: LawClause) => { setEditingId(record.id); form.setFieldsValue(record); setDrawerOpen(true); };
  const handleSubmit = async () => { try { const values = await form.validateFields(); const selectedLaw = lawDocuments?.find(d => d.id === values.lawDocumentId); if (selectedLaw) { values.lawCode = selectedLaw.lawCode; values.lawName = selectedLaw.lawName; } if (editingId) { updateMutation.mutate({ id: editingId, data: values }); } else { createMutation.mutate(values); } } catch (error) { console.error('Validation failed:', error); } };
  const handleImport = async (file: File) => { try { const result: any = await lawClauseApi.import(file); message.success(`导入完成：成功 ${result.success} 条`); queryClient.invalidateQueries({ queryKey: ['lawClauses'] }); setImportModalOpen(false); } catch (error) { message.error('导入失败'); } return false; };

  const handleClearFilters = () => setQueryParams(defaultQueryParams);
  const clearSelection = () => { setSelectedRowKeys([]); setSelectedRows([]); };
  const handleBatchEnable = async (ids: number[]) => { await lawClauseApi.batchEnable(ids); clearSelection(); queryClient.invalidateQueries({ queryKey: ['lawClauses'] }); };
  const handleBatchDisable = async (ids: number[]) => { await lawClauseApi.batchDisable(ids); clearSelection(); queryClient.invalidateQueries({ queryKey: ['lawClauses'] }); };
  const handleBatchDelete = async (ids: number[]) => { await lawClauseApi.batchDelete(ids); clearSelection(); queryClient.invalidateQueries({ queryKey: ['lawClauses'] }); };
  const handleBatchExport = (rows: LawClause[]) => { exportToExcel(rows, lawClauseExportColumns, '法规条款'); };
  const handleViewDetail = (record: LawClause) => { setDetailRecord(record); setDetailModalOpen(true); };

  const rowSelection: TableRowSelection<LawClause> = { selectedRowKeys, onChange: (keys, rows) => { setSelectedRowKeys(keys); setSelectedRows(rows); } };

  const columns: ColumnsType<LawClause> = [
    { title: '法规编号', dataIndex: 'lawCode', key: 'lawCode', width: 130 },
    { title: '法规名称', dataIndex: 'lawName', key: 'lawName', width: 200, ellipsis: true },
    { title: '条款编号', dataIndex: 'clauseNo', key: 'clauseNo', width: 100 },
    { title: '条款标题', dataIndex: 'clauseTitle', key: 'clauseTitle', width: 150, ellipsis: true, render: (text, record) => <a onClick={() => handleViewDetail(record)} style={{ color: '#1677ff' }}>{text || record.clauseNo}</a> },
    { title: '层级', dataIndex: 'levelLabel', key: 'levelLabel', width: 80 },
    { title: '重要程度', dataIndex: 'importanceLevel', key: 'importanceLevel', width: 100, render: (v) => { const c = v === '关键' ? 'red' : v === '重要' ? 'orange' : 'default'; return v ? <Tag color={c}>{v}</Tag> : '-'; } },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="default">停用</Tag> },
    { title: '条款要点', dataIndex: 'clauseSummary', key: 'clauseSummary', ellipsis: true },
    { title: '操作', key: 'action', width: 150, fixed: 'right', render: (_, record) => <ActionButtons record={record} recordName={`${record.clauseNo} ${record.clauseTitle || ''}`} showView onView={() => handleViewDetail(record)} onEdit={() => handleEdit(record)} onToggleStatus={(id, status) => toggleStatusMutation.mutate({ id, status })} onDelete={(id) => deleteMutation.mutate(id)} /> },
  ];

  return (
    <div>
      <div className="page-header"><h2>法规条款</h2></div>
      <div className="table-card">
        <FilterToolbar onClearFilters={handleClearFilters} hasActiveFilters={hasActiveFilters}>
          <Input.Search placeholder="搜索标题/内容" allowClear value={queryParams.keyword} onChange={(e) => !e.target.value && setQueryParams({ ...queryParams, keyword: undefined, page: 1 })} onSearch={(v) => setQueryParams({ ...queryParams, keyword: v || undefined, page: 1 })} style={{ width: 200 }} />
          <Select placeholder="法规" allowClear showSearch optionFilterProp="label" value={queryParams.lawDocumentId} style={{ width: 250 }} options={lawDocuments?.map(d => ({ label: `${d.lawCode} - ${d.lawName}`, value: d.id }))} onChange={(v) => setQueryParams({ ...queryParams, lawDocumentId: v, page: 1 })} />
          <Select placeholder="重要程度" allowClear value={queryParams.importanceLevel} style={{ width: 120 }} options={importanceLevelOptions.map(l => ({ label: l, value: l }))} onChange={(v) => setQueryParams({ ...queryParams, importanceLevel: v, page: 1 })} />
        </FilterToolbar>

        <BatchActions selectedRowKeys={selectedRowKeys} selectedRows={selectedRows} onBatchEnable={handleBatchEnable} onBatchDisable={handleBatchDisable} onBatchDelete={handleBatchDelete} onClearSelection={clearSelection} onBatchExport={handleBatchExport} entityName="条款" />

        <div className="action-buttons">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setDrawerOpen(true); }}>新增</Button>
          <Button icon={<DownloadOutlined />} onClick={() => lawClauseApi.downloadTemplate()}>下载模板</Button>
          <Button icon={<UploadOutlined />} onClick={() => setImportModalOpen(true)}>批量导入</Button>
        </div>

        <Table columns={columns} dataSource={data?.list} rowKey="id" loading={isLoading} rowSelection={rowSelection} scroll={{ x: 1200 }} pagination={{ current: queryParams.page, pageSize: queryParams.pageSize, total: data?.total, showSizeChanger: true, showTotal: (total) => `共 ${total} 条`, onChange: (page, pageSize) => setQueryParams({ ...queryParams, page, pageSize }) }} />
      </div>

      <Drawer title={editingId ? '编辑法规条款' : '新增法规条款'} open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditingId(null); form.resetFields(); }} width={700} extra={<Space><Button onClick={() => setDrawerOpen(false)}>取消</Button><Button type="primary" onClick={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>保存</Button></Space>}>
        <Form form={form} layout="vertical">
          <Form.Item name="lawDocumentId" label="所属法规" rules={[{ required: true, message: '请选择法规' }]}><Select showSearch optionFilterProp="label" placeholder="选择法规" options={lawDocuments?.map(d => ({ label: `${d.lawCode} - ${d.lawName}`, value: d.id }))} /></Form.Item>
          <Form.Item name="clauseNo" label="条款编号" rules={[{ required: true, message: '请输入编号' }]}><Input placeholder="如：3.1.2" /></Form.Item>
          <Form.Item name="clauseTitle" label="条款标题"><Input /></Form.Item>
          <Form.Item name="clauseText" label="条款内容"><Input.TextArea rows={6} /></Form.Item>
          <Form.Item name="clauseSummary" label="条款要点"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="levelLabel" label="层级"><Select placeholder="选择层级" options={['章', '节', '条', '款'].map(l => ({ label: l, value: l }))} /></Form.Item>
          <Form.Item name="parentClauseNo" label="上级条款编号"><Input /></Form.Item>
          <Form.Item name="keywords" label="关键词"><Input placeholder="多个关键词用逗号分隔" /></Form.Item>
          <Form.Item name="topicTags" label="主题标签"><Input placeholder="如：计价,控制价,工程量清单" /></Form.Item>
          <Form.Item name="importanceLevel" label="重要程度"><Select placeholder="选择程度" options={importanceLevelOptions.map(l => ({ label: l, value: l }))} /></Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Drawer>

      <Modal title="批量导入" open={importModalOpen} onCancel={() => setImportModalOpen(false)} footer={null}>
        <Upload.Dragger accept=".xlsx,.xls" showUploadList={false} beforeUpload={handleImport}>
          <p className="ant-upload-drag-icon"><UploadOutlined style={{ fontSize: 48, color: '#1677ff' }} /></p>
          <p className="ant-upload-text">点击或拖拽Excel文件到此处上传</p>
        </Upload.Dragger>
      </Modal>

      <DetailModal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="法规条款详情" record={detailRecord} fields={detailFields} />
    </div>
  );
}
