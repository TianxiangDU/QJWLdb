import { Button, Tooltip, Modal, Space } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  StopOutlined,
  EyeOutlined,
} from '@ant-design/icons';

interface ActionButtonsProps {
  record: {
    id: number;
    status: number;
    [key: string]: any;
  };
  /** 记录名称，用于删除确认提示 */
  recordName?: string;
  /** 编辑回调 */
  onEdit?: () => void;
  /** 查看详情回调 */
  onView?: () => void;
  /** 切换状态回调 */
  onToggleStatus?: (id: number, newStatus: number) => void;
  /** 删除回调 */
  onDelete?: (id: number) => void;
  /** 是否显示查看按钮 */
  showView?: boolean;
  /** 是否显示编辑按钮 */
  showEdit?: boolean;
  /** 是否显示启用/停用按钮 */
  showToggle?: boolean;
  /** 是否显示删除按钮 */
  showDelete?: boolean;
}

export default function ActionButtons({
  record,
  recordName,
  onEdit,
  onView,
  onToggleStatus,
  onDelete,
  showView = false,
  showEdit = true,
  showToggle = true,
  showDelete = true,
}: ActionButtonsProps) {
  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除「${recordName || '该记录'}」吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => onDelete?.(record.id),
    });
  };

  const handleToggleStatus = () => {
    const newStatus = record.status === 1 ? 0 : 1;
    onToggleStatus?.(record.id, newStatus);
  };

  return (
    <Space size={4}>
      {showView && onView && (
        <Tooltip title="查看详情">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={onView}
          />
        </Tooltip>
      )}
      {showEdit && onEdit && (
        <Tooltip title="编辑">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={onEdit}
          />
        </Tooltip>
      )}
      {showToggle && onToggleStatus && (
        <Tooltip title={record.status === 1 ? '停用' : '启用'}>
          <Button
            type="text"
            size="small"
            icon={record.status === 1 ? <StopOutlined /> : <CheckCircleOutlined />}
            onClick={handleToggleStatus}
            style={{ color: record.status === 1 ? '#faad14' : '#52c41a' }}
          />
        </Tooltip>
      )}
      {showDelete && onDelete && (
        <Tooltip title="删除">
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
          />
        </Tooltip>
      )}
    </Space>
  );
}


