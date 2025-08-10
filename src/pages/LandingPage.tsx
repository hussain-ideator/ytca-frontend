import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Radio, message } from 'antd';
import { YoutubeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.scss';
import { API_BASE_URL, YOUTUBE_BASE_URL } from '../config/api';

const { Title } = Typography;

interface FormValues {
  channelInput: string;
  inputType: 'url' | 'id' | 'title';
}

const LandingPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [inputType, setInputType] = useState<'url' | 'id' | 'title'>('url');
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Update input type when radio selection changes
  const handleInputTypeChange = (e: any) => {
    setInputType(e.target.value);
    form.setFieldsValue({ channelInput: '' }); // Clear input when type changes
  };

  const onFinish = async (values: FormValues) => {
    setLoading(true);
    try {
      let endpoint = '';

      switch (values.inputType) {
        case 'url':
          endpoint = `${API_BASE_URL}/channel/url?url=${encodeURIComponent(values.channelInput)}`;
          break;
        case 'id':
          endpoint = `${API_BASE_URL}/channel/${values.channelInput}`;
          break;
        case 'title':
          endpoint = `${API_BASE_URL}/channel/title/${encodeURIComponent(values.channelInput)}`;
          break;
      }

      console.log('Making API call to:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (!data || !data.id) {
        throw new Error('Invalid channel data received');
      }

      // Clear existing channel data and ID
      localStorage.removeItem('channelData');
      localStorage.removeItem('channelId');
      
      // Store the channel ID
      localStorage.setItem('channelId', data.id);
      
      // Store the API response data
      const dataToStore = {
        ...data,
        timestamp: new Date().getTime()
      };
      
      localStorage.setItem('channelData', JSON.stringify(dataToStore));
      
      // Verify storage
      const storedId = localStorage.getItem('channelId');
      const storedData = localStorage.getItem('channelData');
      
      console.log('Storage verification:', {
        channelId: storedId,
        hasChannelData: !!storedData
      });
      
      if (!storedId || !storedData) {
        throw new Error('Failed to store channel data');
      }

      // Navigate to home page, passing data via state
      navigate('/home', { state: { channelId: data.id, channelData: dataToStore } });
    } catch (error) {
      console.error('Error in API call:', error);
      message.error('Failed to fetch channel information. Please try again.');
      // Clear any partial data on error
      localStorage.removeItem('channelData');
      localStorage.removeItem('channelId');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.landingPage}>
      <Card className={styles.card}>
        <div className={styles.logo}>
          <YoutubeOutlined style={{ fontSize: '48px', color: '#ff0000' }} />
          <Title level={2}>YouTube Channel Analyzer</Title>
        </div>
        
        <Form
          form={form}
          name="channel"
          onFinish={onFinish}
          layout="vertical"
          className={styles.form}
          initialValues={{ inputType: 'url' }}
        >
          <Form.Item
            name="inputType"
            label="Select Input Type"
            rules={[{ required: true, message: 'Please select an input type' }]}
          >
            <Radio.Group onChange={handleInputTypeChange}>
              <Radio.Button value="url">Channel URL</Radio.Button>
              <Radio.Button value="id">Channel ID</Radio.Button>
              <Radio.Button value="title">Channel Title</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="channelInput"
            label="Enter Channel Information"
            rules={[
              { required: true, message: 'Please enter channel information' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value) {
                    return Promise.resolve();
                  }
                  
                  const inputType = getFieldValue('inputType');
                  if (inputType === 'url') {
                    try {
                      const url = new URL(value);
                      if (!url.hostname.includes('youtube.com')) {
                        return Promise.reject(new Error('Please enter a valid YouTube URL'));
                      }
                    } catch (e) {
                      return Promise.reject(new Error('Please enter a valid URL'));
                    }
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input 
              placeholder={
                inputType === 'url' 
                  ? `${YOUTUBE_BASE_URL}/@channelname`
                  : inputType === 'id'
                  ? 'UC_x5XG1OV2P6uZZ5FSM9Ttw'
                  : 'Channel Title'
              }
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              block
            >
              Analyze Channel
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LandingPage; 