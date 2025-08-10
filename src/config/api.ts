// API Configuration
// Environment variables configuration for API endpoints

interface ApiConfig {
  baseUrl: string;
  aiBaseUrl: string;
  youtubeBaseUrl: string;
}

const getApiConfig = (): ApiConfig => {
  return {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    aiBaseUrl: import.meta.env.VITE_AI_API_BASE_URL || 'http://localhost:8000',
    youtubeBaseUrl: import.meta.env.VITE_YOUTUBE_BASE_URL || 'https://www.youtube.com'
  };
};

export const API_CONFIG = getApiConfig();

// Export individual URLs for convenience
export const API_BASE_URL = API_CONFIG.baseUrl;
export const AI_API_BASE_URL = API_CONFIG.aiBaseUrl;
export const YOUTUBE_BASE_URL = API_CONFIG.youtubeBaseUrl;
