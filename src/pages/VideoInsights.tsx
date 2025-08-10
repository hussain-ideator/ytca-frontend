import React, { useState, useEffect } from 'react';
import { Card, Form, Select, InputNumber, Button, Table, Spin, Typography, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { YoutubeOutlined, ClearOutlined } from '@ant-design/icons';
import MainLayout from '../components/MainLayout';
import styles from './VideoInsights.module.scss';
import { API_BASE_URL, YOUTUBE_BASE_URL } from '../config/api';

const { Title } = Typography;

interface VideoData {
  id: string;
  title: string;
  views: number;
  likes: number;
  uploadDate: string;
  thumbnailUrl: string;
  videoUrl: string;
}

interface VideoFilters {
  sortBy: 'views' | 'likes' | 'recency';
  maxVideos: number;
  minViews?: number;
  minLikes?: number;
}

const VideoInsights: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [channelData, setChannelData] = useState<any>(null);
  const [form] = Form.useForm<VideoFilters>();
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const storedData = localStorage.getItem('channelData');
    if (!storedData) {
      navigate('/');
      return;
    }

    const data = JSON.parse(storedData);
    setChannelData(data);
    if (data.id) {
      fetchVideos(data.id);
    }
  }, [navigate]);

  const fetchVideos = async (channelId: string, filters?: VideoFilters) => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/channel/${channelId}/videos`;
      const params = new URLSearchParams();

      if (filters) {
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.maxVideos) params.append('maxVideos', filters.maxVideos.toString());
        if (filters.minViews) params.append('minViews', filters.minViews.toString());
        if (filters.minLikes) params.append('minLikes', filters.minLikes.toString());
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log('Fetching videos from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received video data:', data);
      
      if (Array.isArray(data)) {
        // Add video URLs to the data
        const videosWithUrls = data.map(video => ({
          ...video,
          videoUrl: `${YOUTUBE_BASE_URL}/watch?v=${video.id}`
        }));
        setVideos(videosWithUrls);
      } else {
        console.error('Invalid video data format:', data);
        setVideos([]);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (values: VideoFilters) => {
    if (channelData?.id) {
      console.log('Applying filters:', values);
      fetchVideos(channelData.id, values);
    }
  };

  const handleClearFilters = () => {
    form.resetFields();
    if (channelData?.id) {
      fetchVideos(channelData.id);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '-';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const videoColumns = [
    {
      title: 'Thumbnail',
      dataIndex: 'thumbnailUrl',
      key: 'thumbnailUrl',
      render: (url: string) => (
        <img src={url} alt="Video thumbnail" style={{ width: 120, height: 68, objectFit: 'cover' }} />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: VideoData) => (
        <a href={record.videoUrl} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: 'Views',
      dataIndex: 'views',
      key: 'views',
      sorter: (a: VideoData, b: VideoData) => a.views - b.views,
      render: (views: number) => views.toLocaleString(),
    },
    {
      title: 'Likes',
      dataIndex: 'likes',
      key: 'likes',
      sorter: (a: VideoData, b: VideoData) => a.likes - b.likes,
      render: (likes: number) => likes.toLocaleString(),
    },
    {
      title: 'Published',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Watch',
      key: 'watch',
      render: (_: unknown, record: VideoData) => (
        <a href={record.videoUrl} target="_blank" rel="noopener noreferrer">
          <YoutubeOutlined style={{ fontSize: '20px', color: '#ff0000' }} />
        </a>
      ),
    },
  ];

  if (!channelData) {
    return null;
  }

  return (
    <MainLayout>
      <div className={styles.videoInsightsPage}>
        <Title level={2}>Video Insights</Title>
        
        <Card className={styles.filterCard}>
          <Form
            form={form}
            layout="inline"
            onFinish={handleFilterSubmit}
            initialValues={{ sortBy: 'recency', maxVideos: 50 }}
            className={styles.filterForm}
          >
            <Form.Item name="sortBy" label="Sort By">
              <Select style={{ width: 120 }}>
                <Select.Option value="recency">Most Recent</Select.Option>
                <Select.Option value="views">Most Viewed</Select.Option>
                <Select.Option value="likes">Most Liked</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="maxVideos" label="Max Videos">
              <InputNumber min={1} max={100} style={{ width: 100 }} />
            </Form.Item>

            <Form.Item name="minViews" label="Min Views">
              <InputNumber min={0} style={{ width: 120 }} />
            </Form.Item>

            <Form.Item name="minLikes" label="Min Likes">
              <InputNumber min={0} style={{ width: 120 }} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Apply Filters
                </Button>
                <Button 
                  icon={<ClearOutlined />} 
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Card className={styles.videoCard}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <Spin size="large" />
            </div>
          ) : videos.length > 0 ? (
            <Table
              columns={videoColumns}
              dataSource={videos}
              rowKey="id"
              pagination={{
                pageSize,
                position: ['topRight', 'bottomRight'],
                pageSizeOptions: [10, 20, 50, 100],
                showSizeChanger: true,
                onShowSizeChange: (_current, size) => setPageSize(size),
              }}
              scroll={{ x: true }}
            />
          ) : (
            <div className={styles.noData}>
              <p>No videos found. Try adjusting your filters.</p>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default VideoInsights; 