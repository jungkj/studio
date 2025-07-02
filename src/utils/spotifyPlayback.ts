// Spotify Web Playback SDK utilities
// This allows playing Spotify music directly in the browser

interface SpotifyApi {
  Player: new (options: SpotifyPlayerOptions) => SpotifyPlayer;
}

interface SpotifyPlayerOptions {
  name: string;
  getOAuthToken: (callback: (token: string) => void) => void;
  volume?: number;
}

interface SpotifyPlayerState {
  paused: boolean;
  position: number;
  duration: number;
  track_window: {
    current_track: SpotifyTrack;
    previous_tracks: SpotifyTrack[];
    next_tracks: SpotifyTrack[];
  };
}

interface SpotifyTrack {
  id: string;
  uri: string;
  name: string;
  artists: Array<{ name: string; uri: string }>;
  album: {
    name: string;
    uri: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
}

interface SpotifyError {
  message: string;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: SpotifyApi;
  }
}

interface SpotifyPlayer {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  getCurrentState: () => Promise<SpotifyPlayerState | null>;
  getVolume: () => Promise<number>;
  nextTrack: () => Promise<void>;
  pause: () => Promise<void>;
  previousTrack: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (position_ms: number) => Promise<void>;
  setName: (name: string) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  togglePlay: () => Promise<void>;
  addListener: (event: string, callback: (data: SpotifyError | { device_id: string } | SpotifyPlayerState) => void) => boolean;
  removeListener: (event: string, callback?: (data: SpotifyError | { device_id: string } | SpotifyPlayerState) => void) => boolean;
}

type PlaybackEventData = SpotifyError | { device_id: string } | SpotifyPlayerState;

class SpotifyWebPlayback {
  private player: SpotifyPlayer | null = null;
  private deviceId: string | null = null;
  private isReady = false;
  private callbacks: { [key: string]: ((data: PlaybackEventData) => void)[] } = {};

  constructor() {
    this.initializeSDK();
  }

  private async initializeSDK() {
    // Check if SDK is already loaded
    if (window.Spotify) {
      this.createPlayer();
      return;
    }

    // Load Spotify Web Playback SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    // Set up global callback
    window.onSpotifyWebPlaybackSDKReady = () => {
      this.createPlayer();
    };
  }

  private createPlayer() {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) {
      console.error('No Spotify access token available for playback');
      return;
    }

    this.player = new window.Spotify.Player({
      name: 'Azure Mongoose Wiggle Desktop',
      getOAuthToken: (callback: (token: string) => void) => {
        callback(token);
      },
      volume: 0.5
    });

    // Error handling
    this.player.addListener('initialization_error', (error: SpotifyError) => {
      console.error('Failed to initialize:', error.message);
    });

    this.player.addListener('authentication_error', (error: SpotifyError) => {
      console.error('Failed to authenticate:', error.message);
    });

    this.player.addListener('account_error', (error: SpotifyError) => {
      console.error('Failed to validate Spotify account:', error.message);
    });

    this.player.addListener('playback_error', (error: SpotifyError) => {
      console.error('Failed to perform playback:', error.message);
    });

    // Playback status updates
    this.player.addListener('player_state_changed', (state: SpotifyPlayerState) => {
      console.log('Player state changed:', state);
      this.emit('player_state_changed', state);
    });

    // Ready
    this.player.addListener('ready', (readyData: { device_id: string }) => {
      console.log('Ready with Device ID', readyData.device_id);
      this.deviceId = readyData.device_id;
      this.isReady = true;
      this.emit('ready', readyData);
    });

    // Not Ready
    this.player.addListener('not_ready', (notReadyData: { device_id: string }) => {
      console.log('Device ID has gone offline', notReadyData.device_id);
      this.isReady = false;
      this.emit('not_ready', notReadyData);
    });

    // Connect to the player
    this.player.connect();
  }

  // Event system
  on(event: string, callback: (data: PlaybackEventData) => void) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  off(event: string, callback?: (data: PlaybackEventData) => void) {
    if (!this.callbacks[event]) return;
    if (callback) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    } else {
      this.callbacks[event] = [];
    }
  }

  private emit(event: string, data: PlaybackEventData) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  // Public methods
  async playTrack(trackUri: string) {
    if (!this.isReady || !this.deviceId) {
      console.error('Player not ready');
      return false;
    }

    const token = localStorage.getItem('spotify_access_token');
    if (!token) {
      console.error('No access token available');
      return false;
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({ uris: [trackUri] }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.status === 204) {
        console.log('Playback started successfully');
        return true;
      } else {
        console.error('Failed to start playback:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error starting playback:', error);
      return false;
    }
  }

  async pause() {
    if (this.player) {
      await this.player.pause();
    }
  }

  async resume() {
    if (this.player) {
      await this.player.resume();
    }
  }

  async togglePlay() {
    if (this.player) {
      await this.player.togglePlay();
    }
  }

  async setVolume(volume: number) {
    if (this.player) {
      await this.player.setVolume(volume);
    }
  }

  async getCurrentState(): Promise<SpotifyPlayerState | null> {
    if (this.player) {
      return await this.player.getCurrentState();
    }
    return null;
  }

  isPlayerReady() {
    return this.isReady;
  }

  getDeviceId() {
    return this.deviceId;
  }

  disconnect() {
    if (this.player) {
      this.player.disconnect();
      this.isReady = false;
      this.deviceId = null;
    }
  }
}

// Singleton instance
let spotifyWebPlayback: SpotifyWebPlayback | null = null;

export const getSpotifyWebPlayback = (): SpotifyWebPlayback => {
  if (!spotifyWebPlayback) {
    spotifyWebPlayback = new SpotifyWebPlayback();
  }
  return spotifyWebPlayback;
};

export type { SpotifyPlayer, SpotifyPlayerState, SpotifyTrack };
export { SpotifyWebPlayback }; 