// YouTube & Twitch API Manager
// Handles fetching channel statistics from YouTube and Twitch

class APIManager {
  constructor() {
    this.youtubeApiKey = null;
    this.twitchClientId = null;
    this.twitchAccessToken = null;
  }

  // Initialize with stored API keys
  async init() {
    try {
      const settings = await chrome.storage.sync.get([
        'youtubeApiKey',
        'twitchClientId',
        'twitchClientSecret'
      ]);
      
      this.youtubeApiKey = settings.youtubeApiKey || null;
      this.twitchClientId = settings.twitchClientId || null;
      
      // Get Twitch access token if credentials exist
      if (settings.twitchClientId && settings.twitchClientSecret) {
        await this.getTwitchAccessToken(settings.twitchClientId, settings.twitchClientSecret);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize API Manager:', error);
      return false;
    }
  }

  // Save API keys
  async saveApiKeys(keys) {
    try {
      await chrome.storage.sync.set(keys);
      
      if (keys.youtubeApiKey) {
        this.youtubeApiKey = keys.youtubeApiKey;
      }
      if (keys.twitchClientId) {
        this.twitchClientId = keys.twitchClientId;
      }
      if (keys.twitchClientId && keys.twitchClientSecret) {
        await this.getTwitchAccessToken(keys.twitchClientId, keys.twitchClientSecret);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save API keys:', error);
      return false;
    }
  }

  // Check if YouTube API is configured
  hasYouTubeApi() {
    return !!this.youtubeApiKey;
  }

  // Check if Twitch API is configured
  hasTwitchApi() {
    return !!this.twitchClientId && !!this.twitchAccessToken;
  }

  // ==================== YOUTUBE API ====================

  // Extract YouTube channel ID from various URL formats
  extractYouTubeChannelId(url) {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    const patterns = [
      /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/@([a-zA-Z0-9_-]+)/,
      /youtube\.com\/user\/([a-zA-Z0-9_-]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return { type: pattern.toString().includes('@') ? 'handle' : 
                       pattern.toString().includes('/c/') ? 'customUrl' :
                       pattern.toString().includes('/user/') ? 'username' : 'id',
                 value: match[1] };
      }
    }
    
    return null;
  }

  // Get YouTube channel statistics
  async getYouTubeChannelStats(channelUrl) {
    if (!this.youtubeApiKey) {
      throw new Error('YouTube API key not configured');
    }

    const channelInfo = this.extractYouTubeChannelId(channelUrl);
    if (!channelInfo) {
      throw new Error('Could not extract channel ID from URL');
    }

    try {
      let channelId = channelInfo.value;
      
      // If we have a handle or username, we need to search for the channel first
      if (channelInfo.type !== 'id') {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelInfo.value)}&key=${this.youtubeApiKey}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        
        if (searchData.error) {
          throw new Error(searchData.error.message);
        }
        
        if (searchData.items && searchData.items.length > 0) {
          channelId = searchData.items[0].snippet.channelId;
        } else {
          throw new Error('Channel not found');
        }
      }

      // Get channel statistics
      const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${this.youtubeApiKey}`;
      const statsResponse = await fetch(statsUrl);
      const statsData = await statsResponse.json();

      if (statsData.error) {
        throw new Error(statsData.error.message);
      }

      if (!statsData.items || statsData.items.length === 0) {
        throw new Error('Channel not found');
      }

      const channel = statsData.items[0];
      
      // Get recent videos
      const videosUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=5&type=video&key=${this.youtubeApiKey}`;
      const videosResponse = await fetch(videosUrl);
      const videosData = await videosResponse.json();

      let recentVideos = [];
      let lastUploadDate = null;

      if (videosData.items && videosData.items.length > 0) {
        recentVideos = videosData.items.map(video => ({
          id: video.id.videoId,
          title: video.snippet.title,
          publishedAt: video.snippet.publishedAt,
          thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url
        }));
        lastUploadDate = videosData.items[0].snippet.publishedAt;
      }

      return {
        platform: 'youtube',
        channelId: channelId,
        name: channel.snippet.title,
        description: channel.snippet.description,
        thumbnail: channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.default?.url,
        banner: channel.brandingSettings?.image?.bannerExternalUrl || null,
        subscribers: parseInt(channel.statistics.subscriberCount) || 0,
        totalViews: parseInt(channel.statistics.viewCount) || 0,
        videoCount: parseInt(channel.statistics.videoCount) || 0,
        lastUploadDate: lastUploadDate,
        recentVideos: recentVideos,
        customUrl: channel.snippet.customUrl || null,
        country: channel.snippet.country || null,
        createdAt: channel.snippet.publishedAt,
        fetchedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('YouTube API error:', error);
      throw error;
    }
  }

  // ==================== TWITCH API ====================

  // Get Twitch access token (client credentials flow)
  async getTwitchAccessToken(clientId, clientSecret) {
    try {
      const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
      });

      const data = await response.json();
      
      if (data.access_token) {
        this.twitchAccessToken = data.access_token;
        return true;
      }
      
      throw new Error(data.message || 'Failed to get access token');
    } catch (error) {
      console.error('Twitch auth error:', error);
      return false;
    }
  }

  // Extract Twitch username from URL
  extractTwitchUsername(url) {
    if (!url) return null;
    
    const match = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
    return match ? match[1] : null;
  }

  // Get Twitch channel statistics
  async getTwitchChannelStats(channelUrl) {
    if (!this.twitchClientId || !this.twitchAccessToken) {
      throw new Error('Twitch API not configured');
    }

    const username = this.extractTwitchUsername(channelUrl);
    if (!username) {
      throw new Error('Could not extract username from URL');
    }

    try {
      // Get user info
      const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
        headers: {
          'Client-ID': this.twitchClientId,
          'Authorization': `Bearer ${this.twitchAccessToken}`
        }
      });
      const userData = await userResponse.json();

      if (!userData.data || userData.data.length === 0) {
        throw new Error('Channel not found');
      }

      const user = userData.data[0];

      // Get follower count
      const followersResponse = await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${user.id}`, {
        headers: {
          'Client-ID': this.twitchClientId,
          'Authorization': `Bearer ${this.twitchAccessToken}`
        }
      });
      const followersData = await followersResponse.json();

      // Get channel info
      const channelResponse = await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${user.id}`, {
        headers: {
          'Client-ID': this.twitchClientId,
          'Authorization': `Bearer ${this.twitchAccessToken}`
        }
      });
      const channelData = await channelResponse.json();

      // Get recent streams/VODs
      const videosResponse = await fetch(`https://api.twitch.tv/helix/videos?user_id=${user.id}&first=5`, {
        headers: {
          'Client-ID': this.twitchClientId,
          'Authorization': `Bearer ${this.twitchAccessToken}`
        }
      });
      const videosData = await videosResponse.json();

      const channel = channelData.data?.[0] || {};
      
      return {
        platform: 'twitch',
        channelId: user.id,
        name: user.display_name,
        login: user.login,
        description: user.description,
        thumbnail: user.profile_image_url,
        banner: user.offline_image_url || null,
        followers: followersData.total || 0,
        totalViews: user.view_count || 0,
        broadcasterType: user.broadcaster_type,
        lastStreamDate: videosData.data?.[0]?.created_at || null,
        recentVideos: (videosData.data || []).map(video => ({
          id: video.id,
          title: video.title,
          publishedAt: video.created_at,
          thumbnail: video.thumbnail_url.replace('%{width}', '320').replace('%{height}', '180'),
          viewCount: video.view_count,
          duration: video.duration
        })),
        game: channel.game_name || null,
        language: channel.broadcaster_language || null,
        createdAt: user.created_at,
        fetchedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Twitch API error:', error);
      throw error;
    }
  }

  // ==================== UNIFIED METHODS ====================

  // Detect platform from URL
  detectPlatform(url) {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('twitch.tv')) return 'twitch';
    return null;
  }

  // Get channel stats (auto-detect platform)
  async getChannelStats(url) {
    const platform = this.detectPlatform(url);
    
    if (platform === 'youtube') {
      return this.getYouTubeChannelStats(url);
    } else if (platform === 'twitch') {
      return this.getTwitchChannelStats(url);
    }
    
    throw new Error('Unsupported platform');
  }

  // Calculate time since last upload/stream
  getTimeSinceLastUpload(dateString) {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  // Format large numbers
  formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
}

// Export singleton instance
const apiManager = new APIManager();

// Make available globally
if (typeof window !== 'undefined') {
  window.apiManager = apiManager;
}
