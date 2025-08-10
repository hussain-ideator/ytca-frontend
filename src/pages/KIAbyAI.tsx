import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Typography,
  List,
  Tag,
  Spin,
  Alert,
  Divider,
  Space,
  Collapse,
  Statistic
} from 'antd';
import {
  SearchOutlined,
  BulbOutlined,
  QuestionCircleOutlined,
  GlobalOutlined,
  RiseOutlined,
  KeyOutlined,
  FileTextOutlined,
  EyeOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import styles from './KIAbyAI.module.scss';
import MainLayout from '../components/MainLayout';
import { AI_API_BASE_URL } from '../config/api';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

interface StrategicInsights {
  trending_topics: string[];
  keyword_gaps: string[];
  title_suggestions: string[];
  keyword_clusters: Record<string, any>;
  viewer_questions: string[];
  regional_keywords: string[];
}

interface AnalysisResponse {
  channel_id: string;
  analysis_timestamp: string;
  region: string;
  language: string;
  strategic_insights: StrategicInsights;
}

const KIAbyAI: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get channel_id from localStorage on component mount
  React.useEffect(() => {
    const channelId = localStorage.getItem('channelId');
    if (channelId) {
      form.setFieldsValue({ channel_id: channelId });
    }
  }, [form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const requestBody = {
        channel_id: values.channel_id || "UCKWaEZ-_VweaEz1j62do_vQ",
        keywords: values.keywords ? values.keywords.split(',').map((k: string) => k.trim()) : [],
        region: values.region || "global",
        language: values.language || "en"
      };

      const response = await fetch(`${AI_API_BASE_URL}/analyze-keywords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderTrendingTopics = (topics: string[]) => (
    <List
      dataSource={topics}
      renderItem={(topic, index) => (
        <List.Item>
          <Space>
            <Tag color="blue">{index + 1}</Tag>
            <Text>{topic}</Text>
          </Space>
        </List.Item>
      )}
    />
  );

  const renderKeywordGaps = (gaps: string[]) => (
    <div className={styles.keywordGaps}>
      {gaps.map((gap, index) => (
        <Tag key={index} color="orange" className={styles.keywordTag}>
          {gap.replace(/_/g, ' ')}
        </Tag>
      ))}
    </div>
  );

  const renderViewerQuestions = (questions: string[]) => (
    <List
      dataSource={questions}
      renderItem={(question, index) => (
        <List.Item>
          <Space>
            <QuestionCircleOutlined style={{ color: '#1890ff' }} />
            <Text>{question}</Text>
          </Space>
        </List.Item>
      )}
    />
  );

  const renderRegionalKeywords = (keywords: string[]) => (
    <div className={styles.regionalKeywords}>
      {keywords.map((keyword, index) => (
        <Tag key={index} color="green" className={styles.keywordTag}>
          {keyword}
        </Tag>
      ))}
    </div>
  );

  const exportReport = () => {
    if (!analysisData) return;

    const reportContent = `
KIA by AI - Keyword Intelligence Analysis Report
===============================================

Analysis Details:
----------------
Channel ID: ${analysisData.channel_id}
Region: ${analysisData.region}
Language: ${analysisData.language}
Analysis Timestamp: ${analysisData.analysis_timestamp}

Strategic Insights:
==================

1. TRENDING TOPICS:
${analysisData.strategic_insights.trending_topics.map((topic, index) => `${index + 1}. ${topic}`).join('\n')}

2. KEYWORD GAPS:
${analysisData.strategic_insights.keyword_gaps.map(gap => `• ${gap.replace(/_/g, ' ')}`).join('\n')}

3. VIEWER QUESTIONS:
${analysisData.strategic_insights.viewer_questions.map((question, index) => `${index + 1}. ${question}`).join('\n')}

4. REGIONAL KEYWORDS:
${analysisData.strategic_insights.regional_keywords.map(keyword => `• ${keyword}`).join('\n')}

5. TITLE SUGGESTIONS:
${analysisData.strategic_insights.title_suggestions.filter(s => s.trim()).map((suggestion, index) => `${index + 1}. ${suggestion}`).join('\n')}

Report generated on: ${new Date().toLocaleString()}
    `;

    // Create a blob with the report content
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `KIA_Report_${analysisData.channel_id}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <div className={styles.kiaContainer}>
        <Title level={2} className={styles.pageTitle}>
          <BulbOutlined /> KIA by AI - Keyword Intelligence Analysis
        </Title>
      
      <Card className={styles.inputCard}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            region: 'global',
            language: 'en'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Channel ID"
                name="channel_id"
                rules={[{ required: true, message: 'Please enter channel ID!' }]}
              >
                <Input 
                  placeholder="Enter YouTube Channel ID"
                  prefix={<SearchOutlined />}
                  readOnly
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Keywords"
                name="keywords"
                rules={[{ required: true, message: 'Please enter keywords!' }]}
                extra="Enter keywords separated by commas"
              >
                <Input.TextArea 
                  placeholder="e.g., Blockchain, AI, Machine Learning"
                  rows={3}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Region" name="region">
                <Select>
                  <Option value="global">Global</Option>
                  <Option value="us">United States</Option>
                  <Option value="uk">United Kingdom</Option>
                  <Option value="ca">Canada</Option>
                  <Option value="au">Australia</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Language" name="language">
                <Select>
                  <Option value="en">English</Option>
                  <Option value="es">Spanish</Option>
                  <Option value="fr">French</Option>
                  <Option value="de">German</Option>
                  <Option value="pt">Portuguese</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SearchOutlined />}
              size="large"
            >
              Analyze Keywords
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className={styles.errorAlert}
        />
      )}

      {loading && (
        <div className={styles.loadingContainer}>
          <Spin size="large" />
          <Text>Analyzing keywords...</Text>
        </div>
      )}

      {analysisData && (
        <div className={styles.resultsContainer}>
          <div className={styles.exportSection}>
            <Button 
              type="primary" 
              icon={<PrinterOutlined />}
              onClick={exportReport}
              size="large"
              className={styles.exportButton}
            >
              Export / Print Report
            </Button>
          </div>
          
          <Card className={styles.summaryCard}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Channel ID"
                  value={analysisData.channel_id}
                  prefix={<SearchOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Region"
                  value={analysisData.region}
                  prefix={<GlobalOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Language"
                  value={analysisData.language}
                  prefix={<FileTextOutlined />}
                />
              </Col>
            </Row>
          </Card>

          <Row gutter={16} className={styles.insightsRow}>
            <Col span={12}>
              <Card 
                title={<><RiseOutlined /> Trending Topics</>}
                className={styles.insightCard}
              >
                {renderTrendingTopics(analysisData.strategic_insights.trending_topics)}
              </Card>
            </Col>
            
            <Col span={12}>
              <Card 
                title={<><KeyOutlined /> Keyword Gaps</>}
                className={styles.insightCard}
              >
                {renderKeywordGaps(analysisData.strategic_insights.keyword_gaps)}
              </Card>
            </Col>
          </Row>

          <Row gutter={16} className={styles.insightsRow}>
            <Col span={12}>
              <Card 
                title={<><QuestionCircleOutlined /> Viewer Questions</>}
                className={styles.insightCard}
              >
                {renderViewerQuestions(analysisData.strategic_insights.viewer_questions)}
              </Card>
            </Col>
            
            <Col span={12}>
              <Card 
                title={<><EyeOutlined /> Regional Keywords</>}
                className={styles.insightCard}
              >
                {renderRegionalKeywords(analysisData.strategic_insights.regional_keywords)}
              </Card>
            </Col>
          </Row>

          {analysisData.strategic_insights.title_suggestions.length > 0 && (
            <Card 
              title="Title Suggestions" 
              className={styles.insightCard}
            >
              <List
                dataSource={analysisData.strategic_insights.title_suggestions.filter(s => s.trim())}
                renderItem={(suggestion, index) => (
                  <List.Item>
                    <Space>
                      <Tag color="purple">{index + 1}</Tag>
                      <Text>{suggestion}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </div>
      )}
      </div>
    </MainLayout>
  );
};

export default KIAbyAI; 