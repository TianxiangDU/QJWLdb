import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Input, Select, Form, Drawer, message, Tag, Upload, Modal } from 'antd';
import { PlusOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType, TableRowSelection } from 'antd/es/table';
import { auditRuleApi, AuditRule, QueryParams } from '../../services/api';
import ActionButtons from '../../components/ActionButtons';
import FilterToolbar from '../../components/FilterToolbar';
import BatchActions from '../../components/BatchActions';
import DetailModal, { renderStatus } from '../../components/DetailModal';
import { exportToExcel, auditRuleExportColumns } from '../../utils/exportExcel';

const ruleCategoryOptions = ['招采', '合同', '计价', '变更', '进度', '质量', '安全', '结算'];
const riskLevelOptions = ['低', '中', '高', '重大风险'];
const defaultQueryParams: QueryParams = { page: 1, pageSize: 10 };

const getRiskLevelColor = (level: string) => {
  switch (level) { case '低': return 'green'; case '中': return 'orange'; case '高': return 'red'; case '重大风险': return 'magenta'; default: return 'default'; }
};

const detailFields = [
  { key: 'ruleCode', label: '规则编码' },
  { key: 'ruleName', label: '规则名称' },
  { key: 'ruleCategory', label: '规则分类' },
  { key: 'riskLevel', label: '风险等级', render: (v: string) => v ? <Tag color={getRiskLevelColor(v)}>{v}</Tag> : '-' },
  { key: 'projectPhase', label: '适用阶段' },
  { key: 'projectType', label: '适用项目类型' },
  { key: 'region', label: '适用地区' },
  { key: 'ownerOrg', label: '适用业主' },
  { key: 'version', label: '版本' },
  { key: 'status', label: '状态', render: renderStatus },
  { key: 'bizDescription', label: '业务说明', span: 2 },
  { key: 'compareMethod', label: '比对方法', span: 2 },
  { key: 'remark', label: '备注', span: 2 },
];

export default function AuditRulePage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [queryParams, setQueryParams] = useState<QueryParams>(defaultQueryParams);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<AuditRule[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<AuditRule | null>(null);
  const queryClient = useQueryClient();

  const hasActiveFilters = !!(queryParams.keyword || queryParams.ruleCategory || queryParams.riskLevel);

  const { data, isLoading } = useQuery({ queryKey: ['auditRules', queryParams], queryFn: () => auditRuleApi.list(queryParams) });

  const createMutation = useMutation({
    mutationFn: (data: Partial<AuditRule>) => auditRuleApi.create(data),
    onSuccess: () => { message.success('创建成功'); setDrawerOpen(false); form.resetFields(); queryClient.invalidateQueries({ queryKey: ['auditRules'] }); },
    onError: (err: any) => message.error(err.response?.data?.message || '创建失败'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AuditRule> }) => auditRuleApi.update(id, data),
    onSuccess: () => { message.success('更新成功'); setDrawerOpen(false); setEditingId(null); form.resetFields(); queryClient.invalidateQueries({ queryKey: ['auditRules'] }); },
    onError: (err: any) => message.error(err.response?.data?.message || '更新失败'),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) => auditRuleApi.update(id, { status }),
    onSuccess: (_, variables) => { message.success(variables.status === 1 ? '启用成功' : '停用成功'); queryClient.invalidateQueries({ queryKey: ['auditRules'] }); },
    onError: () => message.error('操作失败'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => auditRuleApi.delete(id),
    onSuccess: () => { message.success('删除成功'); queryClient.invalidateQueries({ queryKey: ['auditRules'] }); },
    onError: () => message.error('删除失败'),
  });

  const handleEdit = (record: AuditRule) => { setEditingId(record.id); form.setFieldsValue(record); setDrawerOpen(true); };
  const handleSubmit = async () => { try { const values = await form.validateFields(); if (editingId) { updateMutation.mutate({ id: editingId, data: values }); } else { createMutation.mutate(values); } } catch (error) { console.error('Validation failed:', error); } };
  const handleImport = async (file: File) => { try { const result: any = await auditRuleApi.import(file); message.success(`导入完成：成功 ${result.success} 条，失败 ${result.failed} 条`); queryClient.invalidateQueries({ queryKey: ['auditRules'] }); setImportModalOpen(false); } catch (error) { message.error('导入失败'); } return false; };

  const handleClearFilters = () => setQueryParams(defaultQueryParams);
  const clearSelection = () => { setSelectedRowKeys([]); setSelectedRows([]); };
  const handleBatchEnable = async (ids: number[]) => { await auditRuleApi.batchEnable(ids); clearSelection(); queryClient.invalidateQueries({ queryKey: ['auditRules'] }); };
  const handleBatchDisable = async (ids: number[]) => { await auditRuleApi.batchDisable(ids); clearSelection(); queryClient.invalidateQueries({ queryKey: ['auditRules'] }); };
  const handleBatchDelete = async (ids: number[]) => { await auditRuleApi.batchDelete(ids); clearSelection(); queryClient.invalidateQueries({ queryKey: ['auditRules'] }); };
  const handleBatchExport = (rows: AuditRule[]) => { exportToExcel(rows, auditRuleExportColumns, '审计规则'); };
  const handleViewDetail = (record: AuditRule) => { setDetailRecord(record); setDetailModalOpen(true); };

  const rowSelection: TableRowSelection<AuditRule> = { selectedRowKeys, onChange: (keys, rows) => { setSelectedRowKeys(keys); setSelectedRows(rows); } };

  const columns: ColumnsType<AuditRule> = [
    { title: '规则编码', dataIndex: 'ruleCode', key: 'ruleCode', width: 120 },
    { title: '规则名称', dataIndex: 'ruleName', key: 'ruleName', width: 200, render: (text, record) => <a onClick={() => handleViewDetail(record)} style={{ color: '#1677ff' }}>{text}</a> },
    { title: '规则分类', dataIndex: 'ruleCategory', key: 'ruleCategory', width: 100 },
    { title: '风险等级', dataIndex: 'riskLevel', key: 'riskLevel', width: 100, render: (v) => v ? <Tag color={getRiskLevelColor(v)}>{v}</Tag> : '-' },
    { title: '适用阶段', dataIndex: 'projectPhase', key: 'projectPhase', width: 120 },
    { title: '版本', dataIndex: 'version', key: 'version', width: 70 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="default">停用</Tag> },
    { title: '业务说明', dataIndex: 'bizDescription', key: 'bizDescription', ellipsis: true },
    { title: '操作', key: 'action', width: 150, fixed: 'right', render: (_, record) => (
      <ActionButtons record={record} recordName={record.ruleName} showView onView={() => navigate(`/audit-rules/${record.id}`)} onEdit={() => handleEdit(record)} onToggleStatus={(id, status) => toggleStatusMutation.mutate({ id, status })} onDelete={(id) => deleteMutation.mutate(id)} />
    )},
  ];

  return (
    <div>
      <div className="page-header"><h2>审计规则</h2></div>
      <div className="table-card">
        <FilterToolbar onClearFilters={handleClearFilters} hasActiveFilters={hasActiveFilters}>
          <Input.Search placeholder="搜索名称/说明" allowClear value={queryParams.keyword} onChange={(e) => !e.target.value && setQueryParams({ ...queryParams, keyword: undefined, page: 1 })} onSearch={(v) => setQueryParams({ ...queryParams, keyword: v || undefined, page: 1 })} style={{ width: 200 }} />
          <Select placeholder="规则分类" allowClear value={queryParams.ruleCategory} style={{ width: 120 }} options={ruleCategoryOptions.map(c => ({ label: c, value: c }))} onChange={(v) => setQueryParams({ ...queryParams, ruleCategory: v, page: 1 })} />
          <Select placeholder="风险等级" allowClear value={queryParams.riskLevel} style={{ width: 120 }} options={riskLevelOptions.map(r => ({ label: r, value: r }))} onChange={(v) => setQueryParams({ ...queryParams, riskLevel: v, page: 1 })} />
        </FilterToolbar>

        <BatchActions selectedRowKeys={selectedRowKeys} selectedRows={selectedRows} onBatchEnable={handleBatchEnable} onBatchDisable={handleBatchDisable} onBatchDelete={handleBatchDelete} onClearSelection={clearSelection} onBatchExport={handleBatchExport} entityName="规则" />

        <div className="action-buttons">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setDrawerOpen(true); }}>新增</Button>
          <Button icon={<DownloadOutlined />} onClick={() => auditRuleApi.downloadTemplate()}>下载模板</Button>
          <Button icon={<UploadOutlined />} onClick={() => setImportModalOpen(true)}>批量导入</Button>
        </div>

        <Table columns={columns} dataSource={data?.list} rowKey="id" loading={isLoading} rowSelection={rowSelection} scroll={{ x: 1200 }} pagination={{ current: queryParams.page, pageSize: queryParams.pageSize, total: data?.total, showSizeChanger: true, showTotal: (total) => `共 ${total} 条`, onChange: (page, pageSize) => setQueryParams({ ...queryParams, page, pageSize }) }} />
      </div>

      <Drawer title={editingId ? '编辑审计规则' : '新增审计规则'} open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditingId(null); form.resetFields(); }} width={700} extra={<Space><Button onClick={() => setDrawerOpen(false)}>取消</Button><Button type="primary" onClick={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>保存</Button></Space>}>
        <Form form={form} layout="vertical">
          <Form.Item name="ruleCode" label="规则编码" rules={[{ required: true, message: '请输入编码' }]}><Input placeholder="如：AR-HT-001" /></Form.Item>
          <Form.Item name="ruleName" label="规则名称" rules={[{ required: true, message: '请输入名称' }]}><Input placeholder="如：合同金额不得超过控制价" /></Form.Item>
          <Form.Item name="ruleCategory" label="规则分类"><Select placeholder="选择分类" options={ruleCategoryOptions.map(c => ({ label: c, value: c }))} /></Form.Item>
          <Form.Item name="bizDescription" label="业务说明"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="compareMethod" label="比对方法"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="riskLevel" label="风险等级"><Select placeholder="选择等级" options={riskLevelOptions.map(r => ({ label: r, value: r }))} /></Form.Item>
          <Form.Item name="projectPhase" label="适用项目阶段"><Input placeholder="如：施工阶段,结算阶段" /></Form.Item>
          <Form.Item name="projectType" label="适用项目类型"><Input placeholder="如：房建,市政,公路" /></Form.Item>
          <Form.Item name="region" label="适用地区"><Input /></Form.Item>
          <Form.Item name="ownerOrg" label="适用业主"><Input /></Form.Item>
          <Form.Item name="version" label="版本号"><Input type="number" defaultValue={1} /></Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Drawer>

      <Modal title="批量导入" open={importModalOpen} onCancel={() => setImportModalOpen(false)} footer={null}>
        <Upload.Dragger accept=".xlsx,.xls" showUploadList={false} beforeUpload={handleImport}>
          <p className="ant-upload-drag-icon"><UploadOutlined style={{ fontSize: 48, color: '#1677ff' }} /></p>
          <p className="ant-upload-text">点击或拖拽Excel文件到此处上传</p>
        </Upload.Dragger>
      </Modal>

      <DetailModal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="审计规则详情" record={detailRecord} fields={detailFields} />
    </div>
  );
}
