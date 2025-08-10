import React from 'react';
import { Layout } from 'antd';
import styles from './HomePage.module.scss';

const Keywords: React.FC = () => {
  return (
    <Layout className={styles.layout}>
      <div className={styles.pageContent}>
        <h1>Keywords</h1>
        <p>Keyword analysis and insights coming soon...</p>
      </div>
    </Layout>
  );
};

export default Keywords; 