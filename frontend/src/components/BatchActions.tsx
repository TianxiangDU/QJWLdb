import { Button, Space, Modal, message, Alert } from 'antd';
import {
  DeleteOutlined,
  StopOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DownloadOutlined,
} from '@ant-design/icons';

interface BatchActionsProps {
  selectedRowKeys: React.Key[];
  selectedRows?: any[]; // 选中的行数据，用于导出
  onBatchEnable: (ids: number[]) => Promise<void>;
  onBatchDisable: (ids: number[]) => Promise<void>;
  onBatchDelete: (ids: number[]) => Promise<void>;
  onClearSelection: () => void;
  onBatchExport?: (rows: any[]) => void; // 可选的导出功能
  loading?: boolean;
  entityName?: string;
}

export default function BatchActions({
  selectedRowKeys,
  selectedRows = [],
  onBatchEnable,
  onBatchDisable,
  onBatchDelete,
  onClearSelection,
  onBatchExport,
  loading = false,
  entityName = '记录',
}: BatchActionsProps) {
  const selectedCount = selectedRowKeys.length;
  const ids = selectedRowKeys.map((key) => Number(key));

  const handleBatchExport = () => {
    if (onBatchExport && selectedRows.length > 0) {
      onBatchExport(selectedRows);
      message.success(`正在导出 ${selectedCount} 条${entityName}`);
    }
  };

  const handleBatchEnable = () => {
    Modal.confirm({
      title: '批量启用',
      content: `确定要启用选中的 ${selectedCount} 条${entityName}吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await onBatchEnable(ids);
        message.success(`已启用 ${selectedCount} 条${entityName}`);
      },
    });
  };

  const handleBatchDisable = () => {
    Modal.confirm({
      title: '批量停用',
      content: `确定要停用选中的 ${selectedCount} 条${entityName}吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await onBatchDisable(ids);
        message.success(`已停用 ${selectedCount} 条${entityName}`);
      },
    });
  };

  const handleBatchDelete = () => {
    Modal.confirm({
      title: '批量删除',
      content: `确定要删除选中的 ${selectedCount} 条${entityName}吗？此操作不可恢复！`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        await onBatchDelete(ids);
        message.success(`已删除 ${selectedCount} 条${entityName}`);
      },
    });
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <Alert
      type="info"
      showIcon={false}
      style={{ marginBottom: 16, padding: '8px 16px' }}
      message={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <span style={{ fontWeight: 500 }}>已选择 <span style={{ color: '#1677ff' }}>{selectedCount}</span> 项</span>
            <Button
              type="link"
              size="small"
              icon={<CloseOutlined />}
              onClick={onClearSelection}
              style={{ padding: 0 }}
            >
              取消选择
            </Button>
          </Space>
          <Space>
            {onBatchExport && (
              <Button
                icon={<DownloadOutlined />}
                onClick={handleBatchExport}
                size="small"
                style={{ color: '#52c41a', borderColor: '#52c41a' }}
              >
                批量导出
              </Button>
            )}
            <Button
              type="primary"
              ghost
              icon={<CheckCircleOutlined />}
              onClick={handleBatchEnable}
              loading={loading}
              size="small"
            >
              批量启用
            </Button>
            <Button
              icon={<StopOutlined />}
              onClick={handleBatchDisable}
              loading={loading}
              size="small"
              style={{ color: '#faad14', borderColor: '#faad14' }}
            >
              批量停用
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
              loading={loading}
              size="small"
            >
              批量删除
            </Button>
          </Space>
        </div>
      }
    />
  );
}

