// Spotify Web API Service
import { getSpotifyConfig } from './environment';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; width: number; height: number }>;
  };
  duration_ms: number;
  uri: string;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyCurrentlyPlaying {
  is_playing: boolean;
  item: SpotifyTrack | null;
  progress_ms: number;
  timestamp: number;
  context?: {
    type: string;
    uri: string;
  };
}

export interface SpotifyAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: {
    total: number;
    items: Array<{
      track: SpotifyTrack;
    }>;
  };
}

export interface SpotifyRecentlyPlayed {
  items: Array<{
    track: SpotifyTrack;
    played_at: string;
    context?: {
      type: string;
      uri: string;
    };
  }>;
}

export interface SpotifyAudioFeatures {
  id: string;
  duration_ms: number;
  tempo: number;
  energy: number;
  danceability: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  loudness: number;
  key: number;
  mode: number;
  time_signature: number;
}

class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;
  private _lastAuthStatus: boolean | null = null;
  private defaultPlaylistId: string;
  private defaultPlaylistUri: string;
  private scopes: string;

  constructor() {
    // Use dynamic configuration that works with ngrok and localhost
    const config = getSpotifyConfig();
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
    this.defaultPlaylistId = config.defaultPlaylistId;
    this.defaultPlaylistUri = config.defaultPlaylistUri;
    this.scopes = config.scopes;
    
    // Try to load stored tokens
    this.loadStoredTokens();
  }

  private loadStoredTokens(): void {
    try {
      const storedAccessToken = localStorage.getItem('spotify_access_token');
      const storedRefreshToken = localStorage.getItem('spotify_refresh_token');
      const storedExpiry = localStorage.getItem('spotify_token_expiry');

      if (storedAccessToken && storedExpiry) {
        this.accessToken = storedAccessToken;
        this.refreshToken = storedRefreshToken;
        this.tokenExpiry = parseInt(storedExpiry, 10);
      }
    } catch (error) {
      console.warn('Failed to load stored Spotify tokens:', error);
    }
  }

  public reloadTokens(): void {
    console.log('🎵 Reloading tokens from localStorage...');
    this.loadStoredTokens();
    console.log('🎵 Tokens reloaded:', {
      hasAccessToken: !!this.accessToken,
      hasRefreshToken: !!this.refreshToken,
      hasTokenExpiry: !!this.tokenExpiry,
      expiresIn: this.tokenExpiry ? Math.round((this.tokenExpiry - Date.now()) / 1000) + 's' : 'no expiry'
    });
  }

  private storeTokens(authResponse: SpotifyAuthResponse): void {
    try {
      this.accessToken = authResponse.access_token;
      this.tokenExpiry = Date.now() + (authResponse.expires_in * 1000);
      
      if (authResponse.refresh_token) {
        this.refreshToken = authResponse.refresh_token;
      }

      localStorage.setItem('spotify_access_token', this.accessToken);
      localStorage.setItem('spotify_token_expiry', this.tokenExpiry.toString());
      
      if (this.refreshToken) {
        localStorage.setItem('spotify_refresh_token', this.refreshToken);
      }
    } catch (error) {
      console.warn('Failed to store Spotify tokens:', error);
    }
  }

  public getAuthUrl(): string {
    const state = Math.random().toString(36).substring(7);
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      scope: this.scopes,
      redirect_uri: this.redirectUri,
      state: state,
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  public async handleAuthCallback(code: string): Promise<boolean> {
    console.log('🎵 Starting token exchange...');
    console.log('🎵 Using redirect URI:', this.redirectUri);
    console.log('🎵 Code length:', code?.length || 0);
    
    try {
      const tokenRequestBody = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
      });
      
      console.log('🎵 Token request body:', tokenRequestBody.toString());
      
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
        },
        body: tokenRequestBody,
      });

      console.log('🎵 Token exchange response status:', response.status);

      if (response.ok) {
        const authData: SpotifyAuthResponse = await response.json();
        console.log('🎵 Token exchange successful!');
        console.log('🎵 Access token length:', authData.access_token?.length || 0);
        console.log('🎵 Refresh token available:', !!authData.refresh_token);
        console.log('🎵 Expires in:', authData.expires_in, 'seconds');
        
        this.storeTokens(authData);
        return true;
      } else {
        const errorText = await response.text();
        console.error('🎵 Token exchange failed!');
        console.error('🎵 Status:', response.status);
        console.error('🎵 Status text:', response.statusText);
        console.error('🎵 Error body:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          console.error('🎵 Parsed error:', errorJson);
        } catch {
          console.error('🎵 Raw error text:', errorText);
        }
        
        return false;
      }
    } catch (error) {
      console.error('🎵 Exception during token exchange:', error);
      return false;
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
        }),
      });

      if (response.ok) {
        const authData: SpotifyAuthResponse = await response.json();
        this.storeTokens(authData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error refreshing Spotify token:', error);
      return false;
    }
  }

  private async ensureValidToken(): Promise<boolean> {
    if (!this.accessToken || !this.tokenExpiry) {
      return false;
    }

    // Check if token expires in next 5 minutes
    if (this.tokenExpiry - Date.now() < 5 * 60 * 1000) {
      console.log('🎵 Token expiring soon, refreshing...');
      return await this.refreshAccessToken();
    }

    return true;
  }

  public async getCurrentlyPlaying(): Promise<SpotifyCurrentlyPlaying | null> {
    if (!(await this.ensureValidToken())) {
      console.warn('🎵 No valid token for getCurrentlyPlaying');
      return null;
    }

    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (response.status === 204) {
        // No track currently playing
        console.log('🎵 No track currently playing');
        return null;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('🎵 Current track:', data.item?.name || 'Unknown');
        return data;
      } else {
        console.error('🎵 Error fetching current track:', response.status, response.statusText);
        return null;
      }
    } catch (error) {
      console.error('🎵 Error fetching current track:', error);
      return null;
    }
  }

  public async getRecentlyPlayed(limit: number = 1): Promise<SpotifyRecentlyPlayed | null> {
    if (!(await this.ensureValidToken())) {
      console.warn('🎵 No valid token for getRecentlyPlayed');
      return null;
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🎵 Recently played tracks:', data.items?.length || 0);
        return data;
      } else {
        console.error('🎵 Error fetching recently played:', response.status, response.statusText);
        return null;
      }
    } catch (error) {
      console.error('🎵 Error fetching recently played:', error);
      return null;
    }
  }

  public async getAudioFeatures(trackId: string): Promise<SpotifyAudioFeatures | null> {
    if (!(await this.ensureValidToken())) {
      console.warn('🎵 No valid token for getAudioFeatures');
      return null;
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🎵 Audio features loaded for track:', trackId);
        return data;
      } else {
        console.error('🎵 Error fetching audio features:', response.status, response.statusText);
        return null;
      }
    } catch (error) {
      console.error('🎵 Error fetching audio features:', error);
      return null;
    }
  }

  public async getPlaylist(playlistId?: string): Promise<SpotifyPlaylist | null> {
    const id = playlistId || this.defaultPlaylistId;
    
    if (!(await this.ensureValidToken())) {
      console.warn('🎵 No valid token for getPlaylist');
      return null;
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🎵 Playlist loaded:', data.name, `(${data.tracks.total} tracks)`);
        return data;
      } else {
        console.error('🎵 Error fetching playlist:', response.status, response.statusText);
        return null;
      }
    } catch (error) {
      console.error('🎵 Error fetching playlist:', error);
      return null;
    }
  }

  public async startPlaylistPlayback(deviceId?: string): Promise<boolean> {
    if (!(await this.ensureValidToken())) {
      console.warn('🎵 No valid token for startPlaylistPlayback');
      return false;
    }

    try {
      const url = deviceId 
        ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
        : 'https://api.spotify.com/v1/me/player/play';

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          context_uri: this.defaultPlaylistUri,
          position_ms: 0
        }),
      });

      if (response.status === 204) {
        console.log('🎵 Playlist playback started successfully');
        return true;
      } else {
        console.error('🎵 Error starting playlist playback:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('🎵 Error starting playlist playback:', error);
      return false;
    }
  }

  public async pausePlayback(): Promise<boolean> {
    if (!(await this.ensureValidToken())) {
      return false;
    }

    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      return response.status === 204;
    } catch (error) {
      console.error('🎵 Error pausing playback:', error);
      return false;
    }
  }

  public async resumePlayback(): Promise<boolean> {
    if (!(await this.ensureValidToken())) {
      return false;
    }

    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      return response.status === 204;
    } catch (error) {
      console.error('🎵 Error resuming playback:', error);
      return false;
    }
  }

  public async skipToNext(): Promise<boolean> {
    if (!(await this.ensureValidToken())) {
      return false;
    }

    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      return response.status === 204;
    } catch (error) {
      console.error('🎵 Error skipping to next track:', error);
      return false;
    }
  }

  public async skipToPrevious(): Promise<boolean> {
    if (!(await this.ensureValidToken())) {
      return false;
    }

    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/previous', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      return response.status === 204;
    } catch (error) {
      console.error('🎵 Error skipping to previous track:', error);
      return false;
    }
  }

  public isAuthenticated(): boolean {
    const isAuth = !!(this.accessToken && this.tokenExpiry && this.tokenExpiry > Date.now());
    
    // Only log if auth status changed
    if (this._lastAuthStatus !== isAuth) {
      console.log('🎵 Auth status changed:', isAuth);
      this._lastAuthStatus = isAuth;
    }
    
    return isAuth;
  }

  public clearStoredTokens(): void {
    console.log('🎵 Clearing stored Spotify tokens...');
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this._lastAuthStatus = null;
    
    try {
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      localStorage.removeItem('spotify_token_expiry');
      localStorage.removeItem('spotify_cached_track');
      localStorage.removeItem('spotify_last_played');
    } catch (error) {
      console.warn('Failed to clear stored tokens:', error);
    }
  }

  public logout(): void {
    console.log('🎵 Logging out...');
    this.clearStoredTokens();
  }

  public getDefaultPlaylistId(): string {
    return this.defaultPlaylistId;
  }

  public getDefaultPlaylistUri(): string {
    return this.defaultPlaylistUri;
  }

  public getCurrentConfig() {
    return {
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      defaultPlaylistId: this.defaultPlaylistId,
      scopes: this.scopes,
      isAuthenticated: this.isAuthenticated(),
      hasAccessToken: !!this.accessToken,
      hasRefreshToken: !!this.refreshToken,
      tokenExpiry: this.tokenExpiry,
      tokenExpiresIn: this.tokenExpiry ? Math.round((this.tokenExpiry - Date.now()) / 1000) : null
    };
  }

  public refreshConfig() {
    console.log('🎵 Refreshing Spotify configuration...');
    const config = getSpotifyConfig();
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
    this.defaultPlaylistId = config.defaultPlaylistId;
    this.defaultPlaylistUri = config.defaultPlaylistUri;
    this.scopes = config.scopes;
    console.log('🎵 New redirect URI:', this.redirectUri);
    return this.getCurrentConfig();
  }

  public debugAuth() {
    console.log('🎵 === SPOTIFY AUTH DEBUG ===');
    console.log('🎵 Current config:', this.getCurrentConfig());
    console.log('🎵 Auth URL:', this.getAuthUrl());
    console.log('🎵 Browser info:', {
      userAgent: navigator.userAgent,
      cookieEnabled: navigator.cookieEnabled,
      popupBlocker: 'unknown - test by opening popup'
    });
    
    // Test popup
    console.log('🎵 Testing popup...');
    const testPopup = window.open('about:blank', 'test-popup', 'width=600,height=700');
    if (testPopup) {
      console.log('🎵 Popup opened successfully');
      testPopup.close();
    } else {
      console.error('🎵 Popup blocked! Enable popups for this site.');
    }
  }
}

// Export singleton instance
export const spotifyService = new SpotifyService();

// Make the service available globally for debugging
if (typeof window !== 'undefined') {
  (window as typeof window & { spotifyService: SpotifyService }).spotifyService = spotifyService;
  console.log('🎵 SpotifyService available globally as window.spotifyService');
  console.log('🎵 Try: spotifyService.testCurrentlyPlaying() to test the API');
} 