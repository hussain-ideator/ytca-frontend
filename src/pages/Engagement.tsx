import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert, Typography, Radio, Tabs, Select } from 'antd';
import MainLayout from '../components/MainLayout';
import { useNavigate } from 'react-router-dom';
import styles from './Engagement.module.scss';
import { API_BASE_URL } from '../config/api';
// For charting
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend as ChartLegend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, ChartTitle, ChartTooltip, ChartLegend);

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;



interface AnalyticsData {
  channelId: string;
  channelTitle: string;
  totalVideos: number;
  averageViews: number;
  likeToViewRatio: number;
  commentToViewRatio: number;
  trends?: {
    labels: string[];
    views: number[];
    likes: number[];
    comments: number[];
  };
}

interface TrendsData {
  channelId: string;
  channelTitle: string;
  performanceOverTime: Array<{
    uploadDate: string;
    views: number;
    likes: number;
    comments: number;
    likesToViews?: number;
  }>;
  rollingAverages: Array<{
    uploadIndex: number;
    averageViews: number;
  }>;
  uploadFrequencyWeekly: Array<{
    week: string;
    count: number;
  }>;
}

const Engagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendsError, setTrendsError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [chartType, setChartType] = useState('line');
  const [rollingAveragesChartType, setRollingAveragesChartType] = useState('line');
  const [activeTabKey, setActiveTabKey] = useState('analytics');
  const [videoLimit, setVideoLimit] = useState<number>(20);
  const navigate = useNavigate();

  // Get channel ID from localStorage
  const channelId = localStorage.getItem('channelId');
  console.log('Engagement component - Retrieved channel ID from localStorage:', channelId);
  console.log('Engagement component - All localStorage items:', Object.keys(localStorage).map(key => ({ key, value: localStorage.getItem(key) })));

  useEffect(() => {
    const fetchData = async () => {
      console.log('Engagement useEffect triggered:', { channelId, activeTabKey });

      if (!channelId) {
        console.log('No channelId found in localStorage, redirecting to home.');
        setAnalytics(null);
        setTrends(null);
        navigate('/home'); // Redirect to home page if no channel ID is found
        return;
      }

      // Always fetch fresh analytics data
      await fetchAnalytics(channelId);

      // Fetch trends data if trends tab is active
      if (activeTabKey === 'trends') {
        await fetchTrends(channelId);
      }
    };

    fetchData();
  }, [channelId, activeTabKey, navigate]);

  const fetchAnalytics = async (channelId: string) => {
    console.log('Starting analytics fetch for channel:', channelId);
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/channel/${channelId}/analytics`;
      console.log('Fetching analytics from:', url);
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: AnalyticsData = await response.json();
      console.log('Analytics data received:', data);
      setAnalytics(data);
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async (channelId: string) => {
    console.log('Starting trends fetch for channel:', channelId);
    setTrendsLoading(true);
    setTrendsError(null);
    try {
      const url = `${API_BASE_URL}/channel/${channelId}/trends`;
      console.log('Fetching trends from:', url);
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: TrendsData = await response.json();

      console.log('Raw trends API response:', data);

      // Ensure performanceOverTime is an array and validate its contents
      data.performanceOverTime = (data.performanceOverTime && Array.isArray(data.performanceOverTime))
        ? data.performanceOverTime.map(item => {
            const date = new Date(item.uploadDate);
            if (isNaN(date.getTime()) || item.views === undefined || item.likes === undefined || item.comments === undefined) {
              console.warn('Invalid or incomplete performance item found (skipping):', item);
              return null;
            }
            return item;
          }).filter(item => item !== null) as Array<{
            uploadDate: string;
            views: number;
            likes: number;
            comments: number;
            likesToViews?: number;
          }>
        : [];

      data.performanceOverTime.sort((a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime());
      console.log('Valid performance data items:', data.performanceOverTime.length);
      console.log('First performance item:', data.performanceOverTime[0]);
      console.log('Last performance item:', data.performanceOverTime[data.performanceOverTime.length - 1]);

      // Ensure rollingAverages is an array and validate its contents
      data.rollingAverages = (data.rollingAverages && Array.isArray(data.rollingAverages))
        ? data.rollingAverages.map(item => {
            if (item.uploadIndex === undefined || item.averageViews === undefined) {
              console.warn('Invalid or incomplete rolling average item found (skipping):', item);
              return null;
            }
            return item;
          }).filter(item => item !== null) as Array<{
            uploadIndex: number;
            averageViews: number;
          }>
        : [];
      console.log('Valid rolling averages data items:', data.rollingAverages.length);
      console.log('First rolling average item:', data.rollingAverages[0]);
      console.log('Last rolling average item:', data.rollingAverages[data.rollingAverages.length - 1]);

      // Ensure uploadFrequencyWeekly is an array and validate its contents
      data.uploadFrequencyWeekly = (data.uploadFrequencyWeekly && Array.isArray(data.uploadFrequencyWeekly))
        ? data.uploadFrequencyWeekly.map(item => {
            if (item.week === undefined || item.count === undefined) {
              console.warn('Invalid or incomplete upload frequency item found (skipping):', item);
              return null;
            }
            return item;
          }).filter(item => item !== null) as Array<{
            week: string;
            count: number;
          }>
        : [];
      console.log('Valid upload frequency data items:', data.uploadFrequencyWeekly.length);

      setTrends(data);

    } catch (error: any) {
      console.error("Error fetching trends:", error);
      setTrendsError(error.message);
    } finally {
      setTrendsLoading(false);
    }
  };

  const calculateGrowthRate = (data: Array<{ uploadDate: string; views: number; likes: number; comments: number }>) => {
    const SUBSET_SIZE = 5; // Use the average of the first 5 and last 5 videos

    if (!data || data.length < SUBSET_SIZE * 2) {
      console.log(`Insufficient data for growth calculation. Need at least ${SUBSET_SIZE * 2} entries. Received:`, data.length);
      return { views: 0, likes: 0, comments: 0 };
    }

    const sumMetrics = (arr: Array<{
      uploadDate: string;
      views: number;
      likes: number;
      comments: number;
    }>) => {
      return arr.reduce((acc, item) => ({
        views: acc.views + item.views,
        likes: acc.likes + item.likes,
        comments: acc.comments + item.comments,
      }), { views: 0, likes: 0, comments: 0 });
    };

    const firstSubset = data.slice(0, SUBSET_SIZE);
    const lastSubset = data.slice(-SUBSET_SIZE);

    const firstAvg = sumMetrics(firstSubset);
    const lastAvg = sumMetrics(lastSubset);

    // Convert sums to averages
    firstAvg.views /= SUBSET_SIZE;
    firstAvg.likes /= SUBSET_SIZE;
    firstAvg.comments /= SUBSET_SIZE;

    lastAvg.views /= SUBSET_SIZE;
    lastAvg.likes /= SUBSET_SIZE;
    lastAvg.comments /= SUBSET_SIZE;

    console.log('Growth calculation details (Averages):', {
      firstAvg: firstAvg,
      lastAvg: lastAvg,
    });

    const calculateRate = (firstVal: number, lastVal: number, metric: string) => {
      // Define thresholds for meaningful growth calculation
      let threshold = 0;
      if (metric === 'Views') {
        threshold = 100;
      } else if (metric === 'Likes') {
        threshold = 10;
      } else if (metric === 'Comments') {
        threshold = 1;
      }

      if (firstVal === 0 || firstVal < threshold) {
        console.log(`${metric} growth calculation: First average (${firstVal}) is 0 or below threshold (${threshold}), returning 0.`);
        return 0;
      }
      let growth = ((lastVal - firstVal) / firstVal) * 100;
      console.log(`${metric} growth: Raw calculated value: ${growth.toFixed(2)}%`); // Log raw value
      const MAX_GROWTH_PERCENTAGE = 10000; // Cap at 10,000% for display purposes
      if (growth > MAX_GROWTH_PERCENTAGE) {
        console.warn(`${metric} growth (${growth.toFixed(2)}%) exceeded max display threshold, capping at ${MAX_GROWTH_PERCENTAGE}%.`);
        growth = MAX_GROWTH_PERCENTAGE;
      }

      console.log(`${metric} growth calculation:`, {
        first: firstVal,
        last: lastVal,
        growth,
        formula: `((${lastVal} - ${firstVal}) / ${firstVal}) * 100`
      });
      console.log(`${metric} growth calculation: Final value returned: ${growth.toFixed(2)}%`); // Log final returned value
      return growth;
    };

    const viewsGrowth = calculateRate(firstAvg.views, lastAvg.views, 'Views');
    const likesGrowth = calculateRate(firstAvg.likes, lastAvg.likes, 'Likes');
    const commentsGrowth = calculateRate(firstAvg.comments, lastAvg.comments, 'Comments');

    return {
      views: viewsGrowth,
      likes: likesGrowth,
      comments: commentsGrowth
    };
  };

  const analyticsChartData = analytics?.trends ? {
    labels: analytics.trends.labels,
    datasets: [
      {
        label: 'Views',
        data: analytics.trends.views,
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24,144,255,0.1)',
        tension: 0.4,
        fill: chartType !== 'bar',
      },
      {
        label: 'Likes',
        data: analytics.trends.likes,
        borderColor: '#52c41a',
        backgroundColor: 'rgba(82,196,26,0.1)',
        tension: 0.4,
        fill: chartType !== 'bar',
      },
      {
        label: 'Comments',
        data: analytics.trends.comments,
        borderColor: '#faad14',
        backgroundColor: 'rgba(250,173,20,0.1)',
        tension: 0.4,
        fill: chartType !== 'bar',
      },
    ],
  } : undefined;

  const pieData = analytics?.trends ? {
    labels: ['Views', 'Likes', 'Comments'],
    datasets: [
      {
        data: [
          analytics.trends.views.reduce((a, b) => a + b, 0),
          analytics.trends.likes.reduce((a, b) => a + b, 0),
          analytics.trends.comments.reduce((a, b) => a + b, 0),
        ],
        backgroundColor: ['#1890ff', '#52c41a', '#faad14'],
      },
    ],
  } : undefined;

  const renderAnalyticsContent = () => {
    if (loading) {
      return <div className={styles.loading}><Spin size="large" /></div>;
    }
    if (error) {
      return <Alert type="error" message={error} />;
    }
    if (!analytics) {
      return <Alert type="info" message="No analytics data available for this channel." />;
    }

    return (
      <>
        {analytics.trends && (
          <Card className={styles.chartCard}>
            <div className={styles.chartControls}>
              <span className={styles.chartLabel}>Chart Type:</span>
              <Radio.Group value={chartType} onChange={e => setChartType(e.target.value as 'line' | 'bar' | 'pie')} buttonStyle="solid">
                <Radio.Button value="line">Line</Radio.Button>
                <Radio.Button value="bar">Bar</Radio.Button>
                <Radio.Button value="pie">Pie</Radio.Button>
              </Radio.Group>
            </div>
            {chartType === 'line' && analyticsChartData && (
              <Line data={analyticsChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            )}
            {chartType === 'bar' && analyticsChartData && (
              <Bar data={analyticsChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            )}
            {chartType === 'pie' && pieData && (
              <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            )}
          </Card>
        )}
        <Card className={styles.chartCard}>
          <Title level={4} style={{ marginBottom: 0 }}>{analytics.channelTitle}</Title>
          <Paragraph type="secondary" style={{ marginBottom: 0, fontSize: '0.95rem' }}>Channel ID: {analytics.channelId}</Paragraph>
        </Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Avg. Views" value={analytics.averageViews} precision={0} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Like-to-View Ratio" value={analytics.likeToViewRatio * 100} suffix="%" precision={2} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Comment-to-View Ratio" value={analytics.commentToViewRatio * 100} suffix="%" precision={2} valueStyle={{ color: '#faad14' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Total Videos" value={analytics.totalVideos} valueStyle={{ color: '#722ed1' }} />
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  const renderTrendsContent = () => {
    if (trendsLoading) {
      return <div className={styles.loading}><Spin size="large" /></div>;
    }
    if (trendsError) {
      return <Alert type="error" message={trendsError} />;
    }
    if (!trends) {
      console.log('No trends data available');
      return <Alert type="info" message="No trends data available for this channel." />;
    }
    console.log('Full trends data received:', trends);

    if (!trends.performanceOverTime) {
      console.log('No performance data available');
      return <Alert type="info" message="No performance data available for this channel." />;
    }
    if (trends.performanceOverTime.length === 0) {
      console.log('Empty performance data array');
      return <Alert type="info" message="No performance data available for this channel." />;
    }

    const recentData = trends.performanceOverTime.slice(-videoLimit);
    console.log('Recent data for charts:', {
      totalEntries: trends.performanceOverTime.length,
      recentEntries: recentData.length,
      dateRange: {
        start: recentData[0].uploadDate,
        end: recentData[recentData.length - 1].uploadDate
      }
    });

    const growthRates = calculateGrowthRate(recentData);
    console.log('Final growth rates:', growthRates);

    return (
      <>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title={`Views Growth (Avg. of First 5 vs. Last 5 Videos in Last ${videoLimit} Videos)`}
                value={growthRates.views}
                precision={2}
                suffix="%"
                valueStyle={{ color: growthRates.views >= 0 ? '#52c41a' : '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title={`Likes Growth (Avg. of First 5 vs. Last 5 Videos in Last ${videoLimit} Videos)`}
                value={growthRates.likes}
                precision={2}
                suffix="%"
                valueStyle={{ color: growthRates.likes >= 0 ? '#52c41a' : '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title={`Comments Growth (Avg. of First 5 vs. Last 5 Videos in Last ${videoLimit} Videos)`}
                value={growthRates.comments}
                precision={2}
                suffix="%"
                valueStyle={{ color: growthRates.comments >= 0 ? '#52c41a' : '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        <Card className={styles.chartCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={4} style={{ marginBottom: 0 }}>Performance Over Time (Last {videoLimit} Videos)</Title>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Select 
                value={videoLimit} 
                onChange={(value) => setVideoLimit(value)} 
                style={{ width: 120 }}
              >
                <Option value={10}>Last 10</Option>
                <Option value={20}>Last 20</Option>
                <Option value={50}>Last 50</Option>
                <Option value={100}>Last 100</Option>
                <Option value={trends.performanceOverTime.length}>All</Option>
              </Select>
              <Radio.Group onChange={(e) => setChartType(e.target.value)} value={chartType} buttonStyle="solid">
                <Radio.Button value="line">Line</Radio.Button>
                <Radio.Button value="bar">Bar</Radio.Button>
              </Radio.Group>
            </div>
          </div>
          {chartType === 'line' && (
            <Line
              data={{
                labels: recentData.map(item => new Date(item.uploadDate).toLocaleDateString()),
                datasets: [
                  {
                    label: 'Views',
                    data: recentData.map(item => item.views),
                    borderColor: '#1890ff',
                    backgroundColor: 'rgba(24,144,255,0.1)',
                    tension: 0.4,
                  },
                  {
                    label: 'Likes',
                    data: recentData.map(item => item.likes),
                    borderColor: '#52c41a',
                    backgroundColor: 'rgba(82,196,26,0.1)',
                    tension: 0.4,
                  },
                  {
                    label: 'Comments',
                    data: recentData.map(item => item.comments),
                    borderColor: '#faad14',
                    backgroundColor: 'rgba(250,173,20,0.1)',
                    tension: 0.4,
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                      label: function(context) {
                        const value = context.parsed.y;
                        return `${context.dataset.label}: ${value.toLocaleString()}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Count'
                    },
                    ticks: {
                      callback: function(value) {
                        return value.toLocaleString();
                      }
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Date'
                    }
                  }
                }
              }}
            />
          )}
          {chartType === 'bar' && (
            <Bar
              data={{
                labels: recentData.map(item => new Date(item.uploadDate).toLocaleDateString()),
                datasets: [
                  {
                    label: 'Views',
                    data: recentData.map(item => item.views),
                    backgroundColor: 'rgba(24,144,255,0.8)',
                  },
                  {
                    label: 'Likes',
                    data: recentData.map(item => item.likes),
                    backgroundColor: 'rgba(82,196,26,0.8)',
                  },
                  {
                    label: 'Comments',
                    data: recentData.map(item => item.comments),
                    backgroundColor: 'rgba(250,173,20,0.8)',
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                      label: function(context) {
                        const value = context.parsed.y;
                        return `${context.dataset.label}: ${value.toLocaleString()}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Count'
                    },
                    ticks: {
                      callback: function(value) {
                        return value.toLocaleString();
                      }
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Date'
                    }
                  }
                }
              }}
            />
          )}
        </Card>

        {trends.rollingAverages && trends.rollingAverages.length > 0 && (
          <Card className={styles.chartCard} style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ marginBottom: 0 }}>Rolling Averages (Last {videoLimit} Videos)</Title>
              <Radio.Group onChange={(e) => setRollingAveragesChartType(e.target.value)} value={rollingAveragesChartType} buttonStyle="solid">
                <Radio.Button value="line">Line</Radio.Button>
                <Radio.Button value="bar">Bar</Radio.Button>
              </Radio.Group>
            </div>
            {rollingAveragesChartType === 'line' && (
              <Line
                data={{
                  labels: trends.rollingAverages.slice(-videoLimit).map(item => `Day ${item.uploadIndex}`),
                  datasets: [
                    {
                      label: 'Views (Rolling Avg)',
                      data: trends.rollingAverages.slice(-videoLimit).map(item => item.averageViews),
                      borderColor: '#1890ff',
                      backgroundColor: 'rgba(24,144,255,0.1)',
                      tension: 0.4,
                    },
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                      callbacks: {
                        label: function(context) {
                          const value = context.parsed.y;
                          return `${context.dataset.label}: ${value.toLocaleString()}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Average Count'
                      },
                      ticks: {
                        callback: function(value) {
                          return value.toLocaleString();
                        }
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Day'
                      }
                    }
                  }
                }}
              />
            )}
            {rollingAveragesChartType === 'bar' && (
              <Bar
                data={{
                  labels: trends.rollingAverages.slice(-videoLimit).map(item => `Day ${item.uploadIndex}`),
                  datasets: [
                    {
                      label: 'Views (Rolling Avg)',
                      data: trends.rollingAverages.slice(-videoLimit).map(item => item.averageViews),
                      backgroundColor: 'rgba(24,144,255,0.8)',
                    },
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                      callbacks: {
                        label: function(context) {
                          const value = context.parsed.y;
                          return `${context.dataset.label}: ${value.toLocaleString()}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Average Count'
                      },
                      ticks: {
                        callback: function(value) {
                          return value.toLocaleString();
                        }
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Day'
                      }
                    }
                  }
                }}
              />
            )}
          </Card>
        )}

        {trends.uploadFrequencyWeekly && trends.uploadFrequencyWeekly.length > 0 && (
          <Card className={styles.chartCard} style={{ marginTop: 24 }}>
            <Title level={4}>Weekly Upload Frequency (Last 12 Weeks)</Title>
            <Bar
              data={{
                labels: trends.uploadFrequencyWeekly.slice(-12).map(item => item.week),
                datasets: [
                  {
                    label: 'Videos Uploaded',
                    data: trends.uploadFrequencyWeekly.slice(-12).map(item => item.count),
                    backgroundColor: 'rgba(114,46,209,0.8)',
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Videos'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Week'
                    }
                  }
                }
              }}
            />
          </Card>
        )}
      </>
    );
  };

  return (
    <MainLayout>
      <div className={styles.engagementPage}>
        <Title level={2}>Engagement Analytics</Title>
        <Paragraph type="secondary" className={styles.subtitle}>
          Key engagement metrics and trends for your channel.
        </Paragraph>
        <Tabs defaultActiveKey="analytics" activeKey={activeTabKey} onChange={setActiveTabKey}>
          <TabPane tab="Analytics Overview" key="analytics">
            {renderAnalyticsContent()}
          </TabPane>
          <TabPane tab="Trends Analysis" key="trends">
            {renderTrendsContent()}
          </TabPane>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Engagement; 