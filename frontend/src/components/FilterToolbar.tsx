import { Button, Space } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';

interface FilterToolbarProps {
  children: ReactNode;
  onClearFilters: () => void;
  hasActiveFilters?: boolean;
}

export default function FilterToolbar({
  children,
  onClearFilters,
  hasActiveFilters = false,
}: FilterToolbarProps) {
  return (
    <div className="filter-form">
      <Space wrap>
        {children}
        {hasActiveFilters && (
          <Button
            icon={<ClearOutlined />}
            onClick={onClearFilters}
            type="link"
            style={{ color: '#ff4d4f' }}
          >
            清除筛选
          </Button>
        )}
      </Space>
    </div>
  );
}


