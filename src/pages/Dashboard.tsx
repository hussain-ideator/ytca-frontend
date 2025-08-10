import React from 'react';
import { Layout } from 'antd';
import styles from './HomePage.module.scss';

const Dashboard: React.FC = () => {
  return (
    <Layout className={styles.layout}>
      <div className={styles.pageContent}>
        <h1>Dashboard</h1>
        <p>Dashboard content coming soon...</p>
      </div>
    </Layout>
  );
};

export default Dashboard; 