import React from 'react';
import { Layout } from 'antd';
import styles from './HomePage.module.scss';

const ChannelGrowth: React.FC = () => {
  return (
    <Layout className={styles.layout}>
      <div className={styles.pageContent}>
        <h1>Channel Growth</h1>
        <p>Channel growth insights coming soon...</p>
      </div>
    </Layout>
  );
};

export default ChannelGrowth; 