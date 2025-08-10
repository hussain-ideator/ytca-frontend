import React from 'react';
import { Layout } from 'antd';
import styles from './HomePage.module.scss';

const Export: React.FC = () => {
  return (
    <Layout className={styles.layout}>
      <div className={styles.pageContent}>
        <h1>Export</h1>
        <p>Export data and reports coming soon...</p>
      </div>
    </Layout>
  );
};

export default Export; 