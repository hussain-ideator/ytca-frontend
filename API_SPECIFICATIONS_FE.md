# YouTube Channel Analyzer - API Specifications

## Overview

This document outlines the complete API specifications for the YouTube Channel Analyzer application. The API consists of two main services:

1. **Main API** (`VITE_API_BASE_URL`) - Channel and video data operations
2. **AI Analysis API** (`VITE_AI_API_BASE_URL`) - Keyword intelligence analysis

## Base URLs

- **Main API**: `http://localhost:8080` (configurable via `VITE_API_BASE_URL`)
- **AI Analysis API**: `http://localhost:8000` (configurable via `VITE_AI_API_BASE_URL`)

---

## Main API Endpoints

### 1. Channel Operations

#### 1.1 Get Channel by ID
```http
GET /channel/{id}
```

**Description**: Retrieve channel information by YouTube Channel ID.

**Parameters**:
- `id` (path, required): YouTube Channel ID (e.g., `UCAuUUnT6oDeKwE6v1NGQxug`)

**Example Request**:
```http
GET /channel/UCAuUUnT6oDeKwE6v1NGQxug
Content-Type: application/json
```

**Response**:
```json
{
  "id": "UCAuUUnT6oDeKwE6v1NGQxug",
  "title": "Channel Name",
  "description": "Channel description",
  "subscriberCount": 1000000,
  "videoCount": 500,
  "viewCount": 50000000,
  "thumbnailUrl": "https://...",
  "customUrl": "@channelname",
  "publishedAt": "2020-01-01T00:00:00Z"
}
```

#### 1.2 Get Channel by Title
```http
GET /channel/title/{title}
```

**Description**: Retrieve channel information by channel title.

**Parameters**:
- `title` (path, required): Channel title (URL encoded)

**Example Request**:
```http
GET /channel/title/My%20Channel%20Name
Content-Type: application/json
```

**Response**: Same as Get Channel by ID

#### 1.3 Get Channel by URL
```http
GET /channel/url?url={url}
```

**Description**: Retrieve channel information by YouTube channel URL.

**Parameters**:
- `url` (query, required): Full YouTube channel URL (URL encoded)

**Example Request**:
```http
GET /channel/url?url=https%3A//www.youtube.com/@channelname
Content-Type: application/json
```

**Response**: Same as Get Channel by ID

### 2. Video Operations

#### 2.1 Get Channel Videos
```http
GET /channel/{id}/videos
```

**Description**: Retrieve videos from a specific channel with optional filtering.

**Parameters**:
- `id` (path, required): YouTube Channel ID
- `sortBy` (query, optional): Sort order - `views` | `likes` | `recency`
- `maxVideos` (query, optional): Maximum number of videos to return
- `minViews` (query, optional): Minimum view count filter
- `minLikes` (query, optional): Minimum like count filter

**Example Request**:
```http
GET /channel/UCAuUUnT6oDeKwE6v1NGQxug/videos?sortBy=views&maxVideos=20&minViews=1000
```

**Response**:
```json
[
  {
    "id": "video_id_1",
    "title": "Video Title",
    "views": 100000,
    "likes": 5000,
    "publishedAt": "2024-01-01T00:00:00Z",
    "thumbnailUrl": "https://i.ytimg.com/vi/video_id_1/default.jpg"
  },
  {
    "id": "video_id_2",
    "title": "Another Video Title",
    "views": 75000,
    "likes": 3500,
    "publishedAt": "2024-01-02T00:00:00Z",
    "thumbnailUrl": "https://i.ytimg.com/vi/video_id_2/default.jpg"
  }
]
```

### 3. Analytics Operations

#### 3.1 Get Channel Analytics
```http
GET /channel/{id}/analytics
```

**Description**: Retrieve detailed analytics data for a channel.

**Parameters**:
- `id` (path, required): YouTube Channel ID

**Example Request**:
```http
GET /channel/UCAuUUnT6oDeKwE6v1NGQxug/analytics
Content-Type: application/json
```

**Response**:
```json
{
  "channelId": "UCAuUUnT6oDeKwE6v1NGQxug",
  "channelTitle": "Channel Name",
  "totalVideos": 500,
  "averageViews": 50000,
  "likeToViewRatio": 0.05,
  "commentToViewRatio": 0.02,
  "trends": {
    "labels": ["2024-01", "2024-02", "2024-03"],
    "views": [1000000, 1200000, 1100000],
    "likes": [50000, 60000, 55000],
    "comments": [10000, 12000, 11000]
  }
}
```

#### 3.2 Get Channel Trends
```http
GET /channel/{id}/trends
```

**Description**: Retrieve trending data and performance metrics over time.

**Parameters**:
- `id` (path, required): YouTube Channel ID

**Example Request**:
```http
GET /channel/UCAuUUnT6oDeKwE6v1NGQxug/trends
Content-Type: application/json
```

**Response**:
```json
{
  "channelId": "UCAuUUnT6oDeKwE6v1NGQxug",
  "channelTitle": "Channel Name",
  "performanceOverTime": [
    {
      "period": "2024-01",
      "views": 1000000,
      "likes": 50000,
      "comments": 10000,
      "subscribers": 900000
    },
    {
      "period": "2024-02",
      "views": 1200000,
      "likes": 60000,
      "comments": 12000,
      "subscribers": 950000
    }
  ],
  "weeklyData": [
    {
      "week": "2024-W01",
      "count": 250000
    },
    {
      "week": "2024-W02",
      "count": 300000
    }
  ]
}
```

---

## AI Analysis API Endpoints

### 1. Keyword Intelligence Analysis

#### 1.1 Analyze Keywords
```http
POST /analyze-keywords
```

**Description**: Perform AI-powered keyword intelligence analysis for a YouTube channel.

**Request Body**:
```json
{
  "channel_id": "UCAuUUnT6oDeKwE6v1NGQxug",
  "keywords": ["blockchain", "AI", "machine learning"],
  "region": "global",
  "language": "en"
}
```

**Request Schema**:
- `channel_id` (string, required): YouTube Channel ID
- `keywords` (array of strings, required): Keywords to analyze
- `region` (string, optional): Target region (`global`, `us`, `uk`, `ca`, `au`)
- `language` (string, optional): Language code (`en`, `es`, `fr`, `de`, `pt`)

**Example Request**:
```http
POST /analyze-keywords
Content-Type: application/json

{
  "channel_id": "UCAuUUnT6oDeKwE6v1NGQxug",
  "keywords": ["technology", "innovation", "startup"],
  "region": "global",
  "language": "en"
}
```

**Response**:
```json
{
  "channel_id": "UCAuUUnT6oDeKwE6v1NGQxug",
  "analysis_timestamp": "2024-01-01T12:00:00Z",
  "region": "global",
  "language": "en",
  "strategic_insights": {
    "trending_topics": [
      "AI technology trends",
      "Startup funding news",
      "Innovation in healthcare",
      "Tech industry analysis"
    ],
    "keyword_gaps": [
      "artificial_intelligence",
      "machine_learning",
      "data_science",
      "cloud_computing"
    ],
    "title_suggestions": [
      "The Future of AI: What You Need to Know",
      "Top 10 Tech Trends Shaping 2024",
      "How Startups Are Disrupting Traditional Industries"
    ],
    "keyword_clusters": {
      "technology": ["AI", "ML", "automation", "innovation"],
      "business": ["startup", "funding", "growth", "strategy"]
    },
    "viewer_questions": [
      "What are the latest AI trends?",
      "How to start a tech company?",
      "Which programming languages are most in demand?"
    ],
    "regional_keywords": [
      "Silicon Valley startups",
      "European tech scene",
      "Asian innovation hubs"
    ]
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid parameters provided",
  "code": 400
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Channel not found",
  "code": 404
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "code": 500
}
```

---

## Data Types and Schemas

### Channel Object
```typescript
interface Channel {
  id: string;                    // YouTube Channel ID
  title: string;                 // Channel name
  description?: string;          // Channel description
  subscriberCount?: number;      // Number of subscribers
  videoCount?: number;          // Total number of videos
  viewCount?: number;           // Total view count
  thumbnailUrl?: string;        // Channel thumbnail URL
  customUrl?: string;           // Custom channel URL (@username)
  publishedAt?: string;         // Channel creation date (ISO 8601)
}
```

### Video Object
```typescript
interface Video {
  id: string;                   // YouTube Video ID
  title: string;                // Video title
  views: number;                // View count
  likes: number;                // Like count
  publishedAt: string;          // Publication date (ISO 8601)
  thumbnailUrl: string;         // Video thumbnail URL
}
```

### Analytics Object
```typescript
interface Analytics {
  channelId: string;            // YouTube Channel ID
  channelTitle: string;         // Channel name
  totalVideos: number;          // Total number of videos
  averageViews: number;         // Average views per video
  likeToViewRatio: number;      // Like-to-view ratio
  commentToViewRatio: number;   // Comment-to-view ratio
  trends?: {
    labels: string[];           // Time period labels
    views: number[];            // View counts per period
    likes: number[];            // Like counts per period
    comments: number[];         // Comment counts per period
  };
}
```

### Keyword Analysis Request
```typescript
interface KeywordAnalysisRequest {
  channel_id: string;           // YouTube Channel ID
  keywords: string[];           // Keywords to analyze
  region?: string;              // Target region (default: "global")
  language?: string;            // Language code (default: "en")
}
```

### Keyword Analysis Response
```typescript
interface KeywordAnalysisResponse {
  channel_id: string;           // YouTube Channel ID
  analysis_timestamp: string;   // Analysis timestamp (ISO 8601)
  region: string;               // Analysis region
  language: string;             // Analysis language
  strategic_insights: {
    trending_topics: string[];          // Current trending topics
    keyword_gaps: string[];             // Keyword opportunities
    title_suggestions: string[];        // Video title suggestions
    keyword_clusters: Record<string, any>; // Keyword groupings
    viewer_questions: string[];         // Common viewer questions
    regional_keywords: string[];        // Region-specific keywords
  };
}
```

---

## Rate Limiting

- **Main API**: No specific rate limits documented
- **AI Analysis API**: May have rate limits for keyword analysis requests

## Authentication

Currently, no authentication is required for any endpoints. All endpoints are publicly accessible.

## CORS

Both APIs should support CORS for frontend integration.

---

## Environment Configuration

### Frontend Environment Variables
```bash
# Main API Configuration
VITE_API_BASE_URL=http://localhost:8080

# AI Analysis API Configuration  
VITE_AI_API_BASE_URL=http://localhost:8000

# External URLs
VITE_YOUTUBE_BASE_URL=https://www.youtube.com
```

### Production Setup
For production deployment, update the environment variables:
```bash
VITE_API_BASE_URL=https://your-api-domain.com
VITE_AI_API_BASE_URL=https://your-ai-api-domain.com
VITE_YOUTUBE_BASE_URL=https://www.youtube.com
```

---

## API Usage Examples

### Complete Channel Analysis Workflow

1. **Get Channel Information**:
   ```http
   GET /channel/UCAuUUnT6oDeKwE6v1NGQxug
   ```

2. **Fetch Channel Videos**:
   ```http
   GET /channel/UCAuUUnT6oDeKwE6v1NGQxug/videos?sortBy=views&maxVideos=50
   ```

3. **Get Analytics Data**:
   ```http
   GET /channel/UCAuUUnT6oDeKwE6v1NGQxug/analytics
   ```

4. **Analyze Keywords**:
   ```http
   POST /analyze-keywords
   {
     "channel_id": "UCAuUUnT6oDeKwE6v1NGQxug",
     "keywords": ["technology", "programming", "tutorial"],
     "region": "global",
     "language": "en"
   }
   ```

This comprehensive API specification covers all endpoints used by the YouTube Channel Analyzer application and provides complete documentation for integration and development purposes.
