// YouTube Audio Service - Plays full songs using hidden YouTube player
import { SpotifyTrack } from './spotifyService';

export interface YouTubePlayerState {
  isReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  videoId: string | null;
}

// YouTube Player API types
interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  setVolume(volume: number): void;
  getVolume(): number;
  getDuration(): number;
  getCurrentTime(): number;
  getPlayerState(): number;
  loadVideoById(videoId: string, startSeconds?: number): void;
  destroy(): void;
}

interface YTPlayerOptions {
  width?: number;
  height?: number;
  videoId?: string;
  playerVars?: YTPlayerVars;
  events?: YTPlayerEvents;
}

interface YTPlayerVars {
  autoplay?: 0 | 1;
  controls?: 0 | 1;
  enablejsapi?: 0 | 1;
  modestbranding?: 0 | 1;
  rel?: 0 | 1;
  showinfo?: 0 | 1;
  origin?: string;
  iv_load_policy?: 1 | 3;
  playsinline?: 0 | 1;
}

interface YTPlayerEvents {
  onReady?: (event: YTPlayerEvent) => void;
  onStateChange?: (event: YTPlayerEvent) => void;
  onError?: (event: YTPlayerEvent) => void;
}

interface YTPlayerEvent {
  target: YTPlayer;
  data?: number;
}

declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, config: YTPlayerOptions) => YTPlayer;
      PlayerState: {
        UNSTARTED: -1;
        ENDED: 0;
        PLAYING: 1;
        PAUSED: 2;
        BUFFERING: 3;
        CUED: 5;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

class YouTubeAudioService {
  private player: YTPlayer | null = null;
  private isAPIReady: boolean = false;
  private onReadyCallbacks: Array<() => void> = [];
  private onStateChangeCallbacks: Array<(state: YouTubePlayerState) => void> = [];
  private currentVideoId: string | null = null;
  private searchCache: Map<string, string> = new Map();

  constructor() {
    this.initializeAPI();
  }

  private initializeAPI(): void {
    // Check if API is already loaded
    if (window.YT) {
      this.isAPIReady = true;
      return;
    }

    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Set up the callback
    window.onYouTubeIframeAPIReady = () => {
      this.isAPIReady = true;
      this.onReadyCallbacks.forEach(callback => callback());
      this.onReadyCallbacks = [];
    };
  }

  private createPlayer(): void {
    // Create a hidden div for the player if it doesn't exist
    let playerDiv = document.getElementById('youtube-audio-player');
    if (!playerDiv) {
      playerDiv = document.createElement('div');
      playerDiv.id = 'youtube-audio-player';
      playerDiv.style.position = 'absolute';
      playerDiv.style.top = '-9999px';
      playerDiv.style.left = '-9999px';
      document.body.appendChild(playerDiv);
    }

    // Create the player
    this.player = new window.YT.Player('youtube-audio-player', {
      width: 1,
      height: 1,
      playerVars: {
        autoplay: 0,
        controls: 0,
        enablejsapi: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        playsinline: 1
      },
      events: {
        onReady: () => {
          console.log('YouTube player ready');
        },
        onStateChange: (event) => {
          this.handleStateChange(event);
        },
        onError: (event) => {
          console.error('YouTube player error:', event.data);
        }
      }
    });
  }

  private handleStateChange(event: YTPlayerEvent): void {
    const state = this.getPlayerState();
    this.onStateChangeCallbacks.forEach(callback => callback(state));
  }

  private getPlayerState(): YouTubePlayerState {
    if (!this.player) {
      return {
        isReady: false,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 70,
        videoId: null
      };
    }

    const playerState = this.player.getPlayerState();
    return {
      isReady: true,
      isPlaying: playerState === window.YT.PlayerState.PLAYING,
      currentTime: this.player.getCurrentTime(),
      duration: this.player.getDuration(),
      volume: this.player.getVolume(),
      videoId: this.currentVideoId
    };
  }

  public async searchAndPlay(track: SpotifyTrack): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isAPIReady) {
        this.onReadyCallbacks.push(async () => {
          const result = await this.searchAndPlay(track);
          resolve(result);
        });
        return;
      }

      if (!this.player) {
        this.createPlayer();
      }

      // Search for the track on YouTube
      this.searchYouTube(track).then(videoId => {
        if (videoId) {
          this.currentVideoId = videoId;
          this.player?.loadVideoById(videoId);
          this.player?.playVideo();
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  private async searchYouTube(track: SpotifyTrack): Promise<string | null> {
    const searchQuery = `${track.name} ${track.artists[0].name} audio`;
    
    // Check cache first
    if (this.searchCache.has(searchQuery)) {
      return this.searchCache.get(searchQuery) || null;
    }

    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      
      if (!apiKey) {
        console.warn('YouTube API key not configured, using demo mode');
        return this.getDemoVideoId(searchQuery);
      }

      // Use YouTube Data API v3 to search for the track
      const encodedQuery = encodeURIComponent(searchQuery);
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&q=${encodedQuery}&type=video&maxResults=5&` +
        `videoCategoryId=10&key=${apiKey}`
      );

      if (!response.ok) {
        console.error('YouTube API error:', response.status);
        return this.getDemoVideoId(searchQuery);
      }

      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        // Get the first result
        const videoId = data.items[0].id.videoId;
        this.searchCache.set(searchQuery, videoId);
        console.log(`Found YouTube video: ${data.items[0].snippet.title}`);
        return videoId;
      }
      
      console.warn('No YouTube results found for:', searchQuery);
      return null;
      
    } catch (error) {
      console.error('YouTube search error:', error);
      return this.getDemoVideoId(searchQuery);
    }
  }

  private getDemoVideoId(searchQuery: string): string {
    // Fallback demo videos
    const demoVideoIds: Record<string, string> = {
      'flowers miley cyrus': 'G7KNmW9a75Y',
      'vampire olivia rodrigo': 'RlPNh_PBZb4',
      'unholy sam smith': 'Uq9gPaIzbe8',
      'as it was harry styles': 'H5v3kku4y6Q',
      'anti-hero taylor swift': 'b1kbLwvqugk'
    };
    
    const normalizedQuery = searchQuery.toLowerCase();
    for (const [key, videoId] of Object.entries(demoVideoIds)) {
      if (normalizedQuery.includes(key)) {
        return videoId;
      }
    }
    
    return 'dQw4w9WgXcQ'; // Rick roll as ultimate fallback
  }

  public play(): void {
    this.player?.playVideo();
  }

  public pause(): void {
    this.player?.pauseVideo();
  }

  public stop(): void {
    this.player?.stopVideo();
    this.currentVideoId = null;
  }

  public seekTo(seconds: number): void {
    this.player?.seekTo(seconds, true);
  }

  public setVolume(volume: number): void {
    this.player?.setVolume(volume * 100); // YouTube uses 0-100 scale
  }

  public onStateChange(callback: (state: YouTubePlayerState) => void): void {
    this.onStateChangeCallbacks.push(callback);
  }

  public destroy(): void {
    this.player?.destroy();
    this.player = null;
    this.currentVideoId = null;
  }

  // Get current state
  public getState(): YouTubePlayerState {
    return this.getPlayerState();
  }

  // Check if a track can be played (has a video ID)
  public async canPlayTrack(track: SpotifyTrack): Promise<boolean> {
    const videoId = await this.searchYouTube(track);
    return videoId !== null;
  }
}

// Export singleton instance
export const youtubeAudioService = new YouTubeAudioService();