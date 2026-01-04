import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, theme, Button, Tooltip, Dropdown, Space, Avatar, message } from 'antd';
import {
  FileTextOutlined,
  AuditOutlined,
  BookOutlined,
  DollarOutlined,
  ApartmentOutlined,
  FolderOpenOutlined,
  BulbOutlined,
  LineChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ApiOutlined,
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import { getUser, logout } from '../utils/auth';

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: '/search',
    icon: <SearchOutlined />,
    label: '搜索主页',
  },
  {
    key: 'doc-system',
    icon: <FileTextOutlined />,
    label: '文件与资料库',
    children: [
      { key: '/doc-types', label: '文件类型' },
      { key: '/doc-field-defs', label: '关键信息字段' },
      { key: '/doc-template-samples', label: '文件模板/示例' },
    ],
  },
  {
    key: 'audit-system',
    icon: <AuditOutlined />,
    label: '审计逻辑库',
    children: [
      { key: '/audit-rules', label: '审计规则' },
    ],
  },
  {
    key: 'law-system',
    icon: <BookOutlined />,
    label: '法律法规与标准库',
    children: [
      { key: '/law-documents', label: '法规与标准' },
      { key: '/law-clauses', label: '法规条款' },
      { key: '/law-clause-doc-type-links', label: '条款与文件类型适用' },
    ],
  },
  {
    key: '/cost-rules',
    icon: <DollarOutlined />,
    label: '工程造价规则库',
  },
  {
    key: '/biz-processes',
    icon: <ApartmentOutlined />,
    label: '工程咨询业务流程库',
  },
  {
    key: '/case-libraries',
    icon: <FolderOpenOutlined />,
    label: '工程案例库',
  },
  {
    key: '/knowledge-snippets',
    icon: <BulbOutlined />,
    label: '工程碎片知识库',
  },
  {
    key: '/monitor-metrics',
    icon: <LineChartOutlined />,
    label: '工程数据监测',
  },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const user = getUser();

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key.startsWith('/')) {
      navigate(key);
    }
  };

  const getOpenKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/doc-')) return ['doc-system'];
    if (path.startsWith('/audit-')) return ['audit-system'];
    if (path.startsWith('/law-')) return ['law-system'];
    return [];
  };

  const openApiDocs = () => {
    const apiHost = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000' 
      : `http://${window.location.hostname}:3000`;
    window.open(`${apiHost}/api-docs`, '_blank');
  };

  const handleLogout = () => {
    message.success('已退出登录');
    logout();
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: `${user?.nickname || user?.username || '用户'}`,
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'change-password',
      icon: <KeyOutlined />,
      label: '修改密码',
      onClick: () => message.info('功能开发中'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={256}
        style={{
          background: '#001529',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div className={`logo ${collapsed ? 'logo-collapsed' : ''}`}>
          {collapsed ? '咨询库' : '工程咨询全业务数据库'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 256, transition: 'margin-left 0.2s' }}>
        <Header 
          style={{ 
            padding: 0, 
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {collapsed ? (
              <MenuUnfoldOutlined 
                style={{ fontSize: 18, padding: '0 24px', cursor: 'pointer' }}
                onClick={() => setCollapsed(false)}
              />
            ) : (
              <MenuFoldOutlined 
                style={{ fontSize: 18, padding: '0 24px', cursor: 'pointer' }}
                onClick={() => setCollapsed(true)}
              />
            )}
            <span className="header-title">工程咨询全业务数据库平台</span>
          </div>
          <div style={{ paddingRight: 24 }}>
            <Space size="middle">
              <Tooltip title="接口文档 (Swagger)">
                <Button 
                  type="text" 
                  icon={<ApiOutlined />} 
                  onClick={openApiDocs}
                >
                  接口文档
                </Button>
              </Tooltip>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar 
                    size="small" 
                    icon={<UserOutlined />} 
                    style={{ backgroundColor: '#1677ff' }}
                  />
                  <span>{user?.nickname || user?.username || '用户'}</span>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content className="site-layout-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
