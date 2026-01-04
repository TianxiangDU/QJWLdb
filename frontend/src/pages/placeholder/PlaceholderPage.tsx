import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Input, Form, Drawer, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType, TableRowSelection } from 'antd/es/table';
import { PlaceholderEntity, PaginationResult, QueryParams } from '../../services/api';
import ActionButtons from '../../components/ActionButtons';
import FilterToolbar from '../../components/FilterToolbar';
import BatchActions from '../../components/BatchActions';
import DetailModal, { renderStatus } from '../../components/DetailModal';
import { exportToExcel } from '../../utils/exportExcel';

interface PlaceholderPageProps {
  title: string;
  api: {
    list: (params: QueryParams) => Promise<PaginationResult<PlaceholderEntity>>;
    get: (id: number) => Promise<PlaceholderEntity>;
    create: (data: Partial<PlaceholderEntity>) => Promise<PlaceholderEntity>;
    update: (id: number, data: Partial<PlaceholderEntity>) => Promise<PlaceholderEntity>;
    delete: (id: number) => Promise<void>;
    batchEnable?: (ids: number[]) => Promise<void>;
    batchDisable?: (ids: number[]) => Promise<void>;
    batchDelete?: (ids: number[]) => Promise<void>;
  };
  queryKey: string;
}

const defaultQueryParams: QueryParams = { page: 1, pageSize: 10 };

const detailFields = [
  { key: 'code', label: '编码' },
  { key: 'name', label: '名称' },
  { key: 'tags', label: '标签' },
  { key: 'status', label: '状态', render: renderStatus },
  { key: 'description', label: '描述', span: 2 },
];

const exportColumns = [
  { key: 'code', title: '编码' },
  { key: 'name', title: '名称' },
  { key: 'tags', title: '标签' },
  { key: 'description', title: '描述' },
];

export default function PlaceholderPage({ title, api, queryKey }: PlaceholderPageProps) {
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [queryParams, setQueryParams] = useState<QueryParams>(defaultQueryParams);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<PlaceholderEntity[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<PlaceholderEntity | null>(null);
  const queryClient = useQueryClient();

  const hasActiveFilters = !!queryParams.keyword;

  const { data, isLoading } = useQuery({ queryKey: [queryKey, queryParams], queryFn: () => api.list(queryParams) });

  const createMutation = useMutation({
    mutationFn: (data: Partial<PlaceholderEntity>) => api.create(data),
    onSuccess: () => { message.success('创建成功'); setDrawerOpen(false); form.resetFields(); queryClient.invalidateQueries({ queryKey: [queryKey] }); },
    onError: (err: any) => message.error(err.response?.data?.message || '创建失败'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PlaceholderEntity> }) => api.update(id, data),
    onSuccess: () => { message.success('更新成功'); setDrawerOpen(false); setEditingId(null); form.resetFields(); queryClient.invalidateQueries({ queryKey: [queryKey] }); },
    onError: (err: any) => message.error(err.response?.data?.message || '更新失败'),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) => api.update(id, { status }),
    onSuccess: (_, variables) => { message.success(variables.status === 1 ? '启用成功' : '停用成功'); queryClient.invalidateQueries({ queryKey: [queryKey] }); },
    onError: () => message.error('操作失败'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(id),
    onSuccess: () => { message.success('删除成功'); queryClient.invalidateQueries({ queryKey: [queryKey] }); },
    onError: () => message.error('删除失败'),
  });

  const handleEdit = (record: PlaceholderEntity) => { setEditingId(record.id); form.setFieldsValue(record); setDrawerOpen(true); };
  const handleSubmit = async () => { try { const values = await form.validateFields(); if (editingId) { updateMutation.mutate({ id: editingId, data: values }); } else { createMutation.mutate(values); } } catch (error) { console.error('Validation failed:', error); } };

  const handleClearFilters = () => setQueryParams(defaultQueryParams);
  const clearSelection = () => { setSelectedRowKeys([]); setSelectedRows([]); };
  const handleBatchEnable = async (ids: number[]) => { if (api.batchEnable) { await api.batchEnable(ids); clearSelection(); queryClient.invalidateQueries({ queryKey: [queryKey] }); } };
  const handleBatchDisable = async (ids: number[]) => { if (api.batchDisable) { await api.batchDisable(ids); clearSelection(); queryClient.invalidateQueries({ queryKey: [queryKey] }); } };
  const handleBatchDelete = async (ids: number[]) => { if (api.batchDelete) { await api.batchDelete(ids); clearSelection(); queryClient.invalidateQueries({ queryKey: [queryKey] }); } };
  const handleBatchExport = (rows: PlaceholderEntity[]) => { exportToExcel(rows, exportColumns, title); };
  const handleViewDetail = (record: PlaceholderEntity) => { setDetailRecord(record); setDetailModalOpen(true); };

  const rowSelection: TableRowSelection<PlaceholderEntity> = { selectedRowKeys, onChange: (keys, rows) => { setSelectedRowKeys(keys); setSelectedRows(rows); } };

  const columns: ColumnsType<PlaceholderEntity> = [
    { title: '编码', dataIndex: 'code', key: 'code', width: 150 },
    { title: '名称', dataIndex: 'name', key: 'name', width: 200, render: (text, record) => <a onClick={() => handleViewDetail(record)} style={{ color: '#1677ff' }}>{text}</a> },
    { title: '标签', dataIndex: 'tags', key: 'tags', width: 150 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v) => v === 1 ? <Tag color="green">启用</Tag> : <Tag color="default">停用</Tag> },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '操作', key: 'action', width: 150, render: (_, record) => <ActionButtons record={record} recordName={record.name} showView onView={() => handleViewDetail(record)} onEdit={() => handleEdit(record)} onToggleStatus={(id, status) => toggleStatusMutation.mutate({ id, status })} onDelete={(id) => deleteMutation.mutate(id)} /> },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>{title}</h2>
        <p style={{ color: '#666', fontSize: 14, marginTop: 8 }}>此模块为占位模块，后续可扩展更多字段和功能</p>
      </div>

      <div className="table-card">
        <FilterToolbar onClearFilters={handleClearFilters} hasActiveFilters={hasActiveFilters}>
          <Input.Search placeholder="搜索名称/描述" allowClear value={queryParams.keyword} onChange={(e) => !e.target.value && setQueryParams({ ...queryParams, keyword: undefined, page: 1 })} onSearch={(v) => setQueryParams({ ...queryParams, keyword: v || undefined, page: 1 })} style={{ width: 200 }} />
        </FilterToolbar>

        {api.batchEnable && api.batchDisable && api.batchDelete && (
          <BatchActions selectedRowKeys={selectedRowKeys} selectedRows={selectedRows} onBatchEnable={handleBatchEnable} onBatchDisable={handleBatchDisable} onBatchDelete={handleBatchDelete} onClearSelection={clearSelection} onBatchExport={handleBatchExport} entityName="记录" />
        )}

        <div className="action-buttons">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setDrawerOpen(true); }}>新增</Button>
        </div>

        <Table columns={columns} dataSource={data?.list} rowKey="id" loading={isLoading} rowSelection={api.batchEnable ? rowSelection : undefined} pagination={{ current: queryParams.page, pageSize: queryParams.pageSize, total: data?.total, showSizeChanger: true, showTotal: (total) => `共 ${total} 条`, onChange: (page, pageSize) => setQueryParams({ ...queryParams, page, pageSize }) }} />
      </div>

      <Drawer title={editingId ? '编辑' : '新增'} open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditingId(null); form.resetFields(); }} width={500} extra={<Space><Button onClick={() => setDrawerOpen(false)}>取消</Button><Button type="primary" onClick={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>保存</Button></Space>}>
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="编码" rules={[{ required: true, message: '请输入编码' }]}><Input /></Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}><Input /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={4} /></Form.Item>
          <Form.Item name="tags" label="标签"><Input placeholder="多个标签用逗号分隔" /></Form.Item>
        </Form>
      </Drawer>

      <DetailModal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} title={`${title}详情`} record={detailRecord} fields={detailFields} />
    </div>
  );
}
