// Spotify service for showing what andyjung2001 is currently playing
// This shows your music to all visitors without requiring them to authenticate

import { spotifyTokenService } from './spotifyTokenService';

export interface NowPlayingTrack {
  name: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  isPlaying: boolean;
  songUrl: string;
  previewUrl?: string;
  duration_ms: number;
  progress_ms?: number;
}

class SpotifyNowPlayingService {
  private static instance: SpotifyNowPlayingService;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private refreshToken: string | null = null;
  
  private constructor() {}

  public static getInstance(): SpotifyNowPlayingService {
    if (!SpotifyNowPlayingService.instance) {
      SpotifyNowPlayingService.instance = new SpotifyNowPlayingService();
    }
    return SpotifyNowPlayingService.instance;
  }

  private async getRefreshToken(): Promise<string | null> {
    // Try to get from Supabase first
    if (!this.refreshToken) {
      this.refreshToken = await spotifyTokenService.getAdminRefreshToken();
    }
    
    // Fallback to localStorage if available
    if (!this.refreshToken && typeof window !== 'undefined') {
      this.refreshToken = localStorage.getItem('spotify_refresh_token');
    }
    
    // Fallback to environment variable
    if (!this.refreshToken) {
      this.refreshToken = process.env.NEXT_PUBLIC_ANDY_SPOTIFY_REFRESH_TOKEN || null;
    }
    
    return this.refreshToken;
  }

  private async refreshAccessToken(): Promise<string> {
    // If we have a valid token, return it
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Try to get access token from localStorage first (temporary solution)
    if (typeof window !== 'undefined') {
      const storedAccessToken = localStorage.getItem('spotify_access_token');
      const storedExpiry = localStorage.getItem('spotify_token_expiry');
      
      if (storedAccessToken && storedExpiry && Date.now() < parseInt(storedExpiry)) {
        this.accessToken = storedAccessToken;
        this.tokenExpiry = parseInt(storedExpiry);
        return storedAccessToken;
      }
    }

    // Get refresh token
    const refreshToken = await this.getRefreshToken();
    
    if (!refreshToken) {
      console.log('🎵 No refresh token available');
      return '';
    }

    try {
      const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '76f5efc0956c4fa4867ddd8f89fc1c59';
      const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET || '9a585cef5d3943c8909416e28a9bb88e';
      
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret),
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        console.error('Failed to refresh token:', response.status);
        return '';
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute early
      
      return this.accessToken;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return '';
    }
  }

  public async getNowPlaying(): Promise<NowPlayingTrack | null> {
    try {
      const token = await this.refreshAccessToken();
      if (!token) {
        console.log('No Spotify token available');
        return null;
      }

      // Try current playing first
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 204 || response.status === 404) {
        // No track playing, get last played
        return this.getLastPlayed(token);
      }

      if (!response.ok) {
        console.error('Failed to fetch now playing:', response.status);
        return this.getLastPlayed(token);
      }

      const data = await response.json();
      if (!data.item) {
        return this.getLastPlayed(token);
      }

      return {
        name: data.item.name,
        artist: data.item.artists.map((a: any) => a.name).join(', '),
        album: data.item.album.name,
        albumImageUrl: data.item.album.images[0]?.url || '',
        isPlaying: data.is_playing,
        songUrl: data.item.external_urls.spotify,
        previewUrl: data.item.preview_url,
        duration_ms: data.item.duration_ms,
        progress_ms: data.progress_ms,
      };
    } catch (error) {
      console.error('Error fetching now playing:', error);
      return null;
    }
  }

  private async getLastPlayed(token: string): Promise<NowPlayingTrack | null> {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch recently played:', response.status);
        return null;
      }

      const data = await response.json();
      if (!data.items || data.items.length === 0) return null;

      const track = data.items[0].track;
      return {
        name: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        album: track.album.name,
        albumImageUrl: track.album.images[0]?.url || '',
        isPlaying: false,
        songUrl: track.external_urls.spotify,
        previewUrl: track.preview_url,
        duration_ms: track.duration_ms,
      };
    } catch (error) {
      console.error('Error fetching last played:', error);
      return null;
    }
  }
}

export const spotifyNowPlaying = SpotifyNowPlayingService.getInstance();