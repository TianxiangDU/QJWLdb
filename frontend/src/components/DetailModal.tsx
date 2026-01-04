import { Modal, Descriptions, Tag } from 'antd';
import type { DescriptionsProps } from 'antd';

interface FieldConfig {
  key: string;
  label: string;
  render?: (value: any, record: any) => React.ReactNode;
  span?: number;
}

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  record: any;
  fields: FieldConfig[];
}

export default function DetailModal({
  open,
  onClose,
  title,
  record,
  fields,
}: DetailModalProps) {
  if (!record) return null;

  const items: DescriptionsProps['items'] = fields.map((field) => ({
    key: field.key,
    label: field.label,
    span: field.span || 1,
    children: field.render
      ? field.render(record[field.key], record)
      : record[field.key] ?? '-',
  }));

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Descriptions
        bordered
        column={2}
        size="small"
        items={items}
        style={{ marginTop: 16 }}
      />
    </Modal>
  );
}

// 通用的状态渲染函数
export const renderStatus = (status: number) =>
  status === 1 ? <Tag color="green">启用</Tag> : <Tag color="default">停用</Tag>;

// 通用的是/否渲染函数
export const renderYesNo = (value: number) =>
  value === 1 ? <Tag color="blue">是</Tag> : <Tag>否</Tag>;


