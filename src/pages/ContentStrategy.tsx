import React from 'react';
import { Layout } from 'antd';
import styles from './HomePage.module.scss';

const ContentStrategy: React.FC = () => {
  return (
    <Layout className={styles.layout}>
      <div className={styles.pageContent}>
        <h1>Content Strategy</h1>
        <p>Content strategy recommendations coming soon...</p>
      </div>
    </Layout>
  );
};

export default ContentStrategy; 