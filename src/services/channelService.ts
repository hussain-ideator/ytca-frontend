import { API_BASE_URL } from '../config/api';

export interface ChannelResponse {
  // Add the response type based on your API response structure
  id: string;
  title: string;
  // ... other fields
}

export const channelService = {
  getChannelById: async (id: string): Promise<ChannelResponse> => {
    const response = await fetch(`${API_BASE_URL}/channel/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch channel by ID');
    }
    return response.json();
  },

  getChannelByTitle: async (title: string): Promise<ChannelResponse> => {
    const response = await fetch(`${API_BASE_URL}/channel/title/${encodeURIComponent(title)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch channel by title');
    }
    return response.json();
  },

  getChannelByUrl: async (url: string): Promise<ChannelResponse> => {
    const response = await fetch(`${API_BASE_URL}/channel/url?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch channel by URL');
    }
    return response.json();
  }
}; 