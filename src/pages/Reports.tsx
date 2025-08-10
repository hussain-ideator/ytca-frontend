import React from 'react';
import { Layout } from 'antd';
import styles from './HomePage.module.scss';

const Reports: React.FC = () => {
  return (
    <Layout className={styles.layout}>
      <div className={styles.pageContent}>
        <h1>Reports</h1>
        <p>Custom reports and analytics coming soon...</p>
      </div>
    </Layout>
  );
};

export default Reports; 