import React from 'react';
import { Layout } from 'antd';
import styles from './HomePage.module.scss';

const Settings: React.FC = () => {
  return (
    <Layout className={styles.layout}>
      <div className={styles.pageContent}>
        <h1>Settings</h1>
        <p>Application settings and preferences coming soon...</p>
      </div>
    </Layout>
  );
};

export default Settings; 