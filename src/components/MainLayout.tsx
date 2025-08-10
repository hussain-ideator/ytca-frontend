import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  YoutubeOutlined,
  HomeOutlined,
  DashboardOutlined,
  VideoCameraOutlined,
  BarChartOutlined,
  BulbOutlined,
  FolderOpenOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './MainLayout.module.scss';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: 'search',
      icon: <HomeOutlined />,
      label: 'Home / Search',
    },
    {
      key: 'home',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'video-insights',
      icon: <VideoCameraOutlined />,
      label: 'Video Insights',
    },
    {
      key: 'engagement',
      icon: <BarChartOutlined />,
      label: 'Engagement',
    },
    {
      key: 'keywords',
      icon: <BulbOutlined />,
      label: 'KIA by AI',
    },
    {
      key: 'export',
      icon: <FolderOpenOutlined />,
      label: 'Export / Reports',
    },
  ];

  const handleMenuClick = (key: string) => {
    if (key === 'search') {
      navigate('/');
    } else {
      navigate(`/${key}`);
    }
  };

  return (
    <Layout className={styles.layout}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className={styles.sider}
        width={256}
        theme="dark"
      >
        <div className={styles.logo}>
          <YoutubeOutlined style={{ fontSize: 32, color: '#ff0000', marginRight: 12 }} />
          {!collapsed && <span>YT Channel Analyzer</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname.replace('/', '')]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
          className={styles.menu}
        />
      </Sider>
      <Layout>
        <Header className={styles.header}>
          <div className={styles.headerLeft}>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: styles.trigger,
              onClick: () => setCollapsed(!collapsed),
            })}
          </div>
        </Header>
        <Content className={styles.content}>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 