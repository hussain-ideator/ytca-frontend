import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Avatar, Typography, Tooltip, Form, Input, message, Radio, Table, Select, InputNumber, Space, Spin, Button } from 'antd';
import { YoutubeOutlined, UserOutlined, VideoCameraOutlined, EyeOutlined, CopyOutlined, ArrowUpOutlined, LikeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import styles from './HomePage.module.scss';
import type { FormInstance } from 'antd/es/form';
import { API_BASE_URL, YOUTUBE_BASE_URL } from '../config/api';

const { Title, Text } = Typography;

interface FormValues {
  channelInput: string;
  inputType: 'url' | 'id' | 'title';
}

interface VideoData {
  id: string;
  title: string;
  views: number;
  likes: number;
  publishedAt: string;
  thumbnailUrl: string;
}

interface VideoFilters {
  sortBy: 'views' | 'likes' | 'recency';
  maxVideos: number;
  minViews?: number;
  minLikes?: number;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [channelData, setChannelData] = useState<any>(null);
  const [showChannelId, setShowChannelId] = useState(false);
  const [dataKey, setDataKey] = useState(0);
  const [formLoading, setFormLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // Always start true, useEffect will manage it
  const [videoLoading, setVideoLoading] = useState(false);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [channelForm] = Form.useForm<FormValues>();
  const [videoForm] = Form.useForm<VideoFilters>();

  const handleChannelIdClick = () => {
    setShowChannelId(!showChannelId);
  };

  const copyChannelId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (channelData?.id) {
      navigator.clipboard.writeText(channelData.id);
    }
  };

  const onFinish = async (values: FormValues) => {
    setFormLoading(true);
    try {
      let endpoint = '';
      let params = {};

      switch (values.inputType) {
        case 'url':
          endpoint = `${API_BASE_URL}/channel/url`;
          params = { url: values.channelInput };
          break;
        case 'id':
          endpoint = `${API_BASE_URL}/channel/${values.channelInput}`;
          break;
        case 'title':
          endpoint = `${API_BASE_URL}/channel/title/${encodeURIComponent(values.channelInput)}`;
          break;
      }

      console.log('onFinish: Making API call to:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('onFinish: API Response:', data);

      if (!data || !data.id) {
        throw new Error('Invalid channel data received');
      }

      // Clear existing data in localStorage before saving new
      localStorage.clear();
      
      // Store the channel ID and data in localStorage
      localStorage.setItem('channelId', data.id);
      localStorage.setItem('channelData', JSON.stringify({ ...data, timestamp: new Date().getTime() }));
      
      // Navigate to home page, passing data via state for immediate use in useEffect
      navigate('/home', { state: { channelId: data.id, channelData: data } });
    } catch (error) {
      console.error('onFinish: Error during API call or navigation:', error);
      message.error('Failed to fetch channel information. Please try again.');
      localStorage.clear(); // Clear any partial data on error
      setChannelData(null); // Ensure state is clean for potential retry
      navigate('/'); // Redirect to landing on error
    } finally {
      setFormLoading(false);
    }
  };

  // Primary data loading effect for HomePage
  useEffect(() => {
    const loadAllChannelData = async () => {
      setPageLoading(true); // Start loading state for the page
      let channelIdToUse: string | null = null;
      let channelDataToSet: any = null;

      try {
        // 1. Prioritize data from navigation state (after successful search on LandingPage)
        if (location.state && location.state.channelId && location.state.channelData) {
          console.log('HomePage useEffect: Loading from location.state.');
          channelIdToUse = location.state.channelId;
          channelDataToSet = location.state.channelData;
          // Persist to localStorage for direct access later (e.g., refresh)
          localStorage.setItem('channelId', channelIdToUse as string); // Safe: checked above
          localStorage.setItem('channelData', JSON.stringify(channelDataToSet)); // Safe: checked above
          // Clear location state to prevent re-triggering this branch on subsequent renders
          navigate(location.pathname, { replace: true });
        } else {
          // 2. Fallback to localStorage (for direct access or refresh)
          console.log('HomePage useEffect: Falling back to localStorage.');
          channelIdToUse = localStorage.getItem('channelId');
          const storedDataString = localStorage.getItem('channelData');

          if (storedDataString && channelIdToUse) {
            try {
              const parsedData = JSON.parse(storedDataString);
              const now = new Date().getTime();
              const CACHE_DURATION = 3600000; // 1 hour

              if (parsedData && parsedData.id === channelIdToUse && (now - (parsedData.timestamp || 0) < CACHE_DURATION)) {
                console.log('HomePage useEffect: Found valid data in localStorage.');
                channelDataToSet = parsedData;
              } else {
                console.warn('HomePage useEffect: Stale/invalid data in localStorage. Clearing and redirecting.');
                localStorage.clear();
                navigate('/');
                return; 
              }
            } catch (e) {
              console.error('HomePage useEffect: Error parsing localStorage data:', e);
              localStorage.clear();
              navigate('/');
              return;
            }
          }
        }

        // If we have valid channel data from either source
        if (channelDataToSet && channelIdToUse) {
          console.log('HomePage useEffect: Valid channel data found. Setting state and fetching dependent data.');
          setChannelData(channelDataToSet); // Set the main channel data

          // Fetch videos (await for immediate display)
          await fetchVideos(channelIdToUse); 
        } else {
          console.log('HomePage useEffect: No valid channel data found. Redirecting to landing.');
          localStorage.clear(); // Ensure localStorage is clean if nothing valid was found
          setChannelData(null); // Ensure state is null
          navigate('/');
        }
      } catch (error) {
        console.error('HomePage useEffect: Error during initial data load process:', error);
        localStorage.clear();
        setChannelData(null); // Ensure state is null on critical error
        navigate('/');
      } finally {
        setPageLoading(false); // Always turn off loading when the process completes
      }
    };

    // Only trigger full data load if channelData is currently null OR if location.state has new data.
    // The condition `location.state.channelId !== channelData?.id` ensures that if we navigate from landing
    // with the *same* channelId as already displayed (e.g., hitting back/forward), we don't re-fetch everything.
    if (channelData === null || (location.state && location.state.channelData && location.state.channelId !== channelData?.id)) {
      loadAllChannelData();
    }
  }, [navigate, location.state, channelData]); // channelData dependency ensures re-run if it's nullified elsewhere

  const fetchVideos = async (channelId: string, filters?: VideoFilters) => {
    setVideoLoading(true);
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

      console.log('fetchVideos: Fetching videos from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('fetchVideos: Received video data:', data);
      
      if (Array.isArray(data)) {
        setVideos(data);
      } else {
        console.error('fetchVideos: Invalid video data format:', data);
        setVideos([]);
      }
    } catch (error) {
      console.error('fetchVideos: Error fetching videos:', error);
      setVideos([]);
    } finally {
      setVideoLoading(false);
    }
  };

  const handleFilterSubmit = (values: VideoFilters) => {
    if (channelData?.id) {
      console.log('Applying filters:', values);
      fetchVideos(channelData.id, values);
    }
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
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  // Debug effect to monitor channelData changes
  useEffect(() => {
    console.log('Channel data updated:', channelData);
  }, [channelData]);

  // Debug effect to monitor videos changes
  useEffect(() => {
    console.log('Videos updated:', videos.length);
  }, [videos]);

  if (pageLoading) {
    return (
      <MainLayout>
        <div className={styles.loading}><Spin size="large" /></div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={styles.homePage}>
        {/* Channel Overview Section */}
        <div className={styles.quickOverview}>
          <div className={styles.channelInfo}>
            <Avatar 
              src={channelData?.thumbnailUrl} 
              size={80}
              className={styles.channelAvatar}
              icon={<UserOutlined />}
            />
            <div className={styles.channelDetails}>
              <Title level={3} className={styles.channelName}>
                {channelData?.title || 'No Channel Selected'}
              </Title>
              {channelData?.id && (
                <a 
                  href={`${YOUTUBE_BASE_URL}/channel/${channelData.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.channelLink}
                >
                  View on YouTube
                </a>
              )}
              <div className={styles.channelIdContainer} onClick={handleChannelIdClick}>
                <Text type="secondary" className={styles.channelId}>
                  {showChannelId ? channelData?.id : 'Show Channel ID'}
                </Text>
                {showChannelId && channelData?.id && (
                  <Tooltip title="Copy Channel ID">
                    <CopyOutlined 
                      className={styles.copyIcon} 
                      onClick={copyChannelId}
                    />
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          <h2>Channel Overview</h2>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card className={styles.statCard}>
                <Statistic
                  title="Subscribers"
                  value={channelData?.subscriberCount || 0}
                  prefix={<ArrowUpOutlined />}
                  valueStyle={{ color: '#ff0000' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className={styles.statCard}>
                <Statistic
                  title="Total Videos"
                  value={channelData?.videoCount || 0}
                  prefix={<LikeOutlined />}
                  valueStyle={{ color: '#ff0000' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className={styles.statCard}>
                <Statistic
                  title="Total Views"
                  value={channelData?.viewCount || 0}
                  prefix={<EyeOutlined />}
                  valueStyle={{ color: '#ff0000' }}
                />
              </Card>
            </Col>
          </Row>
        </div>

        <div className={styles.descriptionSection}>
          <h2>Description</h2>
          <p className={styles.welcomeText}>
            {channelData?.description || 'No channel description available.'}
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage; 