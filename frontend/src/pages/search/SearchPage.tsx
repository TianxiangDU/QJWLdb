import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Input,
  Card,
  List,
  Tag,
  Empty,
  Spin,
  Descriptions,
  Table,
  Tabs,
  Space,
  Button,
} from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  FormOutlined,
  FolderOpenOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { docTypeApi, DocType } from '../../services/api';

// 动态获取API地址
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : `http://${window.location.hostname}:3000`;

export default function SearchPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);

  // 搜索文件类型列表
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['docTypeSearch', searchKeyword],
    queryFn: () => docTypeApi.list({ keyword: searchKeyword, pageSize: 20 }),
    enabled: searchKeyword.length > 0,
  });

  // 获取选中文件类型的完整信息
  const { data: fullInfo, isLoading: isLoadingFullInfo } = useQuery({
    queryKey: ['docTypeFullInfo', selectedDocType],
    queryFn: () => docTypeApi.getFullInfo(selectedDocType!),
    enabled: !!selectedDocType,
  });

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setSelectedDocType(null);
  };

  const handleSelectDocType = (docType: DocType) => {
    setSelectedDocType(String(docType.id));
  };

  // 关键信息字段表格列
  const fieldColumns: ColumnsType<any> = [
    { title: '字段名称', dataIndex: 'fieldName', key: 'fieldName', width: 120 },
    { title: '字段编码', dataIndex: 'fieldCode', key: 'fieldCode', width: 120 },
    { title: '字段类别', dataIndex: 'fieldCategory', key: 'fieldCategory', width: 100 },
    {
      title: '是否必填',
      dataIndex: 'requiredFlag',
      key: 'requiredFlag',
      width: 80,
      render: (v) => v === 1 ? <Tag color="red">是</Tag> : <Tag>否</Tag>,
    },
    { title: '取值方式', dataIndex: 'valueSource', key: 'valueSource', width: 150, ellipsis: true },
    { title: '枚举值', dataIndex: 'enumOptions', key: 'enumOptions', width: 120, ellipsis: true },
    { title: '示例数据', dataIndex: 'exampleValue', key: 'exampleValue', width: 120, ellipsis: true },
    { title: '字段说明', dataIndex: 'fieldDescription', key: 'fieldDescription', ellipsis: true },
  ];

  // 文件模板表格列
  const templateColumns: ColumnsType<any> = [
    { title: '文件名称', dataIndex: 'fileName', key: 'fileName', width: 200 },
    { title: '说明', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => record.filePath ? (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          href={`${API_BASE}/static/${record.filePath}`}
          target="_blank"
        >
          预览
        </Button>
      ) : null,
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 28, marginBottom: 24, color: '#1677ff' }}>
          <SearchOutlined style={{ marginRight: 12 }} />
          文件类型搜索
        </h1>
        <Input.Search
          placeholder="输入文件类型名称或编码进行搜索..."
          allowClear
          enterButton="搜索"
          size="large"
          style={{ maxWidth: 600 }}
          onSearch={handleSearch}
          loading={isSearching}
        />
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* 左侧：搜索结果列表 */}
        <Card
          title={
            <Space>
              <FileTextOutlined />
              搜索结果
              {searchResults && <Tag color="blue">{searchResults.total} 条</Tag>}
            </Space>
          }
          style={{ width: 360, flexShrink: 0 }}
          bodyStyle={{ padding: 0, maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}
        >
          {!searchKeyword ? (
            <Empty description="请输入关键词搜索" style={{ padding: 48 }} />
          ) : isSearching ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <Spin tip="搜索中..." />
            </div>
          ) : searchResults?.list.length === 0 ? (
            <Empty description="未找到匹配的文件类型" style={{ padding: 48 }} />
          ) : (
            <List
              dataSource={searchResults?.list}
              renderItem={(item: DocType) => (
                <List.Item
                  onClick={() => handleSelectDocType(item)}
                  style={{
                    cursor: 'pointer',
                    padding: '12px 16px',
                    backgroundColor: selectedDocType === String(item.id) ? '#e6f4ff' : 'transparent',
                    borderLeft: selectedDocType === String(item.id) ? '3px solid #1677ff' : '3px solid transparent',
                  }}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <span style={{ fontWeight: 500 }}>{item.name}</span>
                        <Tag color="blue">{item.code}</Tag>
                        {item.status === 0 && <Tag color="default">已停用</Tag>}
                      </Space>
                    }
                    description={
                      <Space size={[0, 4]} wrap style={{ fontSize: 12, color: '#999' }}>
                        {item.projectPhase && <Tag size="small">{item.projectPhase}</Tag>}
                        {item.majorCategory && <Tag size="small">{item.majorCategory}</Tag>}
                        {item.minorCategory && <Tag size="small">{item.minorCategory}</Tag>}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>

        {/* 右侧：详情展示 */}
        <Card
          title={
            <Space>
              <FolderOpenOutlined />
              {fullInfo?.docType ? `${fullInfo.docType.name} 详情` : '文件类型详情'}
            </Space>
          }
          style={{ flex: 1 }}
          bodyStyle={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}
        >
          {!selectedDocType ? (
            <Empty description="请从左侧选择一个文件类型查看详情" style={{ padding: 48 }} />
          ) : isLoadingFullInfo ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <Spin tip="加载中..." />
            </div>
          ) : fullInfo ? (
            <Tabs
              defaultActiveKey="info"
              items={[
                {
                  key: 'info',
                  label: (
                    <span>
                      <FileTextOutlined />
                      基本信息
                    </span>
                  ),
                  children: (
                    <Descriptions column={2} bordered size="small">
                      <Descriptions.Item label="文件类型名称">{fullInfo.docType.name}</Descriptions.Item>
                      <Descriptions.Item label="文件类型编码">{fullInfo.docType.code}</Descriptions.Item>
                      <Descriptions.Item label="所属项目阶段">{fullInfo.docType.projectPhase || '-'}</Descriptions.Item>
                      <Descriptions.Item label="所属大类">{fullInfo.docType.majorCategory || '-'}</Descriptions.Item>
                      <Descriptions.Item label="所属小类">{fullInfo.docType.minorCategory || '-'}</Descriptions.Item>
                      <Descriptions.Item label="适用项目类型">{fullInfo.docType.projectType || '-'}</Descriptions.Item>
                      <Descriptions.Item label="适用地区">{fullInfo.docType.region || '-'}</Descriptions.Item>
                      <Descriptions.Item label="适用业主">{fullInfo.docType.ownerOrg || '-'}</Descriptions.Item>
                      <Descriptions.Item label="状态">
                        {fullInfo.docType.status === 1 ? <Tag color="green">启用</Tag> : <Tag>停用</Tag>}
                      </Descriptions.Item>
                      <Descriptions.Item label="业务说明" span={2}>
                        {fullInfo.docType.bizDescription || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="文件特征信息（LLM识别）" span={2}>
                        {fullInfo.docType.fileFeature || '-'}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: 'fields',
                  label: (
                    <span>
                      <FormOutlined />
                      关键信息字段
                      <Tag color="blue" style={{ marginLeft: 8 }}>{fullInfo.fields.length}</Tag>
                    </span>
                  ),
                  children: (
                    <Table
                      columns={fieldColumns}
                      dataSource={fullInfo.fields}
                      rowKey="id"
                      size="small"
                      pagination={false}
                      scroll={{ x: 900 }}
                      locale={{ emptyText: '暂无关键信息字段' }}
                    />
                  ),
                },
                {
                  key: 'templates',
                  label: (
                    <span>
                      <FolderOpenOutlined />
                      文件模板/示例
                      <Tag color="blue" style={{ marginLeft: 8 }}>{fullInfo.templates.length}</Tag>
                    </span>
                  ),
                  children: (
                    <Table
                      columns={templateColumns}
                      dataSource={fullInfo.templates}
                      rowKey="id"
                      size="small"
                      pagination={false}
                      locale={{ emptyText: '暂无文件模板/示例' }}
                    />
                  ),
                },
              ]}
            />
          ) : null}
        </Card>
      </div>
    </div>
  );
}


