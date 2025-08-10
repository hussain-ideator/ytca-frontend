import React from 'react';
import { Layout } from 'antd';
import styles from './HomePage.module.scss';

const CompetitorAnalysis: React.FC = () => {
  return (
    <Layout className={styles.layout}>
      <div className={styles.pageContent}>
        <h1>Competitor Analysis</h1>
        <p>Competitor analysis content coming soon...</p>
      </div>
    </Layout>
  );
};

export default CompetitorAnalysis; 