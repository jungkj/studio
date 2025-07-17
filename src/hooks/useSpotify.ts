import { useState, useEffect, useCallback, useRef } from 'react';
import { spotifyService, SpotifyCurrentlyPlaying, SpotifyRecentlyPlayed, SpotifyTrack } from '@/utils/spotifyService';
import { audioAnalyzer, AudioAnalysisData } from '@/utils/audioAnalyzer';

interface UseSpotifyState {
  currentTrack: SpotifyCurrentlyPlaying | null;
  lastPlayedTrack: SpotifyCurrentlyPlaying | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  audioData: AudioAnalysisData | null;
  isAudioAnalysisActive: boolean;
  // Browser audio playback state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
}

interface UseSpotifyActions {
  login: () => void;
  logout: () => void;
  refresh: () => Promise<void>;
  authenticate: () => Promise<void>;
  refreshCurrentTrack: () => Promise<void>;
  startAudioAnalysis: () => Promise<boolean>;
  stopAudioAnalysis: () => void;
  // Browser audio controls
  playPreview: (track: SpotifyTrack) => Promise<boolean>;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

interface UseSpotifyReturn extends UseSpotifyState, UseSpotifyActions {}

// Cache management functions
const saveCachedTrack = (track: SpotifyCurrentlyPlaying, key: string = 'spotify_cached_track') => {
  try {
    localStorage.setItem(key, JSON.stringify(track));
  } catch (error) {
    console.warn('Failed to cache track:', error);
  }
};

const loadCachedTrack = (key: string = 'spotify_cached_track'): SpotifyCurrentlyPlaying | null => {
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('Failed to load cached track:', error);
    return null;
  }
};

export const useSpotify = (): UseSpotifyReturn => {
  const [state, setState] = useState<UseSpotifyState>({
    currentTrack: null,
    lastPlayedTrack: loadCachedTrack('spotify_last_played'),
    isLoading: false,
    isAuthenticated: false,
    error: null,
    audioData: null,
    isAudioAnalysisActive: false,
    // Browser audio state
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
  });

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioAnalysisRef = useRef<NodeJS.Timeout | null>(null);
  const progressUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.volume = state.volume;
    
    // Audio event listeners
    audio.addEventListener('loadedmetadata', () => {
      setState(prev => ({ ...prev, duration: audio.duration }));
    });
    
    audio.addEventListener('timeupdate', () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    });
    
    audio.addEventListener('play', () => {
      setState(prev => ({ ...prev, isPlaying: true }));
    });
    
    audio.addEventListener('pause', () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    });
    
    audio.addEventListener('ended', () => {
      setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    });
    
    audio.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      setState(prev => ({ ...prev, error: 'Audio playback failed' }));
    });
    
    audioRef.current = audio;
    
    return () => {
      audio.pause();
      audio.src = '';
      audio.remove();
    };
  }, []);

  // Update audio volume when state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.isMuted ? 0 : state.volume;
    }
  }, [state.volume, state.isMuted]);

  const updateCurrentTrack = useCallback(async () => {
    if (isPollingRef.current) return; // Prevent concurrent requests
    
    isPollingRef.current = true;
    
    try {
      console.log('🎵 updateCurrentTrack called - isAuthenticated:', spotifyService.instance.isAuthenticated());

      if (spotifyService.instance.isAuthenticated()) {
        // Set loading state
        setState(prev => ({
          ...prev,
          isLoading: true,
          error: null,
        }));

        const trackData = await spotifyService.instance.getCurrentlyPlaying();
        console.log('🎵 Received track data:', trackData?.item?.name || 'No track playing');
        
        if (trackData && trackData.item) {
          // Cache current track
          saveCachedTrack(trackData);
          
          // If it's playing, also save as last played
          if (trackData.is_playing) {
            saveCachedTrack(trackData, 'spotify_last_played');
            
            setState(prev => ({
              ...prev,
              currentTrack: trackData,
              lastPlayedTrack: trackData,
              isLoading: false,
              error: null,
            }));
          } else {
            setState(prev => ({
              ...prev,
              currentTrack: trackData,
              isLoading: false,
              error: null,
            }));
          }
        } else {
          // No current track, try to get recently played
          const recentlyPlayed = await spotifyService.instance.getRecentlyPlayed(1);
          let lastPlayed = null;
          
          if (recentlyPlayed && recentlyPlayed.items.length > 0) {
            const recentTrack = recentlyPlayed.items[0];
            lastPlayed = {
              is_playing: false,
              item: recentTrack.track,
              progress_ms: 0,
              timestamp: Date.now(),
            };
            saveCachedTrack(lastPlayed, 'spotify_last_played');
          }
          
          setState(prev => ({
            ...prev,
            currentTrack: null,
            lastPlayedTrack: lastPlayed || prev.lastPlayedTrack,
            isLoading: false,
            error: null,
          }));
        }
      } else {
        // Not authenticated
        console.log('🎵 Not authenticated, clearing track data');
        setState(prev => ({
          ...prev,
          currentTrack: null,
          isLoading: false,
          error: null,
        }));
      }
    } catch (error) {
      console.error('🎵 Error updating current track:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to fetch current track',
        isLoading: false,
      }));
    } finally {
      isPollingRef.current = false;
    }
  }, []);

  const startPolling = useCallback((skipInitialFetch = false) => {
    console.log('🎵 Starting Spotify polling...');
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Initial fetch (unless we just did one)
    if (!skipInitialFetch) {
      updateCurrentTrack();
    }

    // Poll every 30 seconds (reduced frequency to prevent flashing)
    pollingIntervalRef.current = setInterval(() => {
      console.log('🎵 Polling Spotify for current track...');
      updateCurrentTrack();
    }, 30000);
  }, [updateCurrentTrack]);

  const stopPolling = useCallback(() => {
    console.log('🎵 Stopping Spotify polling...');
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Browser audio controls
  const playPreview = useCallback(async (track: SpotifyTrack): Promise<boolean> => {
    if (!track.preview_url) {
      setState(prev => ({ ...prev, error: 'No preview available for this track' }));
      return false;
    }

    try {
      if (audioRef.current) {
        audioRef.current.src = track.preview_url;
        await audioRef.current.play();
        setState(prev => ({ ...prev, error: null }));
        return true;
      }
    } catch (error) {
      console.error('Failed to play preview:', error);
      setState(prev => ({ ...prev, error: 'Failed to play preview' }));
    }
    return false;
  }, []);

  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const resumeAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  const toggleMute = useCallback(() => {
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  // Audio analysis for visualizer
  const startAudioAnalysis = useCallback(async (): Promise<boolean> => {
    if (!audioRef.current || state.isAudioAnalysisActive) return false;

    try {
      const initSuccess = await audioAnalyzer.initialize();
      if (initSuccess) {
        const connectSuccess = await audioAnalyzer.connectToAudioElement(audioRef.current);
        if (connectSuccess) {
          setState(prev => ({ ...prev, isAudioAnalysisActive: true }));
          
          const updateAudioData = () => {
            const data = audioAnalyzer.getFrequencyData();
            setState(prev => ({ ...prev, audioData: data }));
            
            if (state.isAudioAnalysisActive) {
              audioAnalysisRef.current = setTimeout(updateAudioData, 50); // 20fps
            }
          };
          
          updateAudioData();
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to start audio analysis:', error);
    }
    return false;
  }, [state.isAudioAnalysisActive]);

  const stopAudioAnalysis = useCallback(() => {
    if (audioAnalysisRef.current) {
      clearTimeout(audioAnalysisRef.current);
      audioAnalysisRef.current = null;
    }
    
    audioAnalyzer.disconnect();
    setState(prev => ({ 
      ...prev, 
      isAudioAnalysisActive: false,
      audioData: null 
    }));
  }, []);

  // Authentication handlers
  const login = useCallback(() => {
    try {
      const authUrl = spotifyService.instance.getAuthUrl();
      console.log('🎵 Opening Spotify auth URL:', authUrl);
      
      const popup = window.open(authUrl, 'spotify-auth', 'width=600,height=700');
      
      if (!popup) {
        setState(prev => ({ ...prev, error: 'Popup blocked. Please allow popups for this site.' }));
        return;
      }

      // Listen for the callback
      const handleMessage = (event: MessageEvent) => {
        console.log('🎵 Received message:', event.data, 'from origin:', event.origin);
        
        const allowedOrigins = [
          window.location.origin,
          'http://localhost:5173',
          'http://localhost:3000',
          'http://localhost:8080',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:8080'
        ];
        
        if (!allowedOrigins.includes(event.origin)) {
          console.warn('🎵 Message from unauthorized origin:', event.origin);
          return;
        }

        if (event.data.type === 'SPOTIFY_AUTH_SUCCESS') {
          console.log('🎵 Auth success received');
          window.removeEventListener('message', handleMessage);
          popup.close();
          
          // Reload tokens from localStorage and update auth state
          spotifyService.instance.reloadTokens();
          const isAuth = spotifyService.instance.isAuthenticated();
          
          if (isAuth) {
            setState(prev => ({ ...prev, isAuthenticated: true, error: null }));
            console.log('🎵 Authentication successful');
            startPolling();
          } else {
            setState(prev => ({ ...prev, error: 'Failed to authenticate - tokens not valid' }));
          }
        } else if (event.data.type === 'SPOTIFY_AUTH_ERROR') {
          console.error('🎵 Auth error received:', event.data.error);
          window.removeEventListener('message', handleMessage);
          popup.close();
          setState(prev => ({ ...prev, error: event.data.error || 'Authentication failed' }));
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          console.log('🎵 Popup was closed manually');
        }
      }, 1000);

    } catch (error) {
      console.error('🎵 Login error:', error);
      setState(prev => ({ ...prev, error: 'Login failed' }));
    }
  }, [startPolling]);

  const logout = useCallback(() => {
    spotifyService.instance.logout();
    stopPolling();
    stopAudioAnalysis();
    stopAudio();
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      currentTrack: null,
      error: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    }));
    console.log('🎵 Logged out from Spotify');
  }, [stopPolling, stopAudioAnalysis, stopAudio]);

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    await updateCurrentTrack();
  }, [updateCurrentTrack]);

  const authenticate = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Check if already authenticated
      const isAuth = spotifyService.instance.isAuthenticated();
      if (isAuth) {
        setState(prev => ({ ...prev, isAuthenticated: true }));
        startPolling(true);
      } else {
        setState(prev => ({ ...prev, error: 'Not authenticated' }));
      }
    } catch (error) {
      console.error('🎵 Authentication error:', error);
      setState(prev => ({ ...prev, error: 'Authentication failed' }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [startPolling]);

  const refreshCurrentTrack = useCallback(async () => {
    await updateCurrentTrack();
  }, [updateCurrentTrack]);

  const handleAuthCallback = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      
      console.log('🎵 Auth callback - code:', !!code, 'error:', error);
      
      if (error) {
        setState(prev => ({ ...prev, error: `Authentication error: ${error}`, isLoading: false }));
        return;
      }

      if (code) {
        const success = await spotifyService.instance.handleAuthCallback(code);
        
        if (success) {
          setState(prev => ({ ...prev, isAuthenticated: true, error: null }));
          console.log('🎵 Authentication successful');
          
          // Clear URL parameters
          const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
          
          // Start polling for track data
          startPolling();
        } else {
          setState(prev => ({ ...prev, error: 'Failed to complete authentication' }));
        }
      }
    } catch (error) {
      console.error('🎵 Auth callback error:', error);
      setState(prev => ({ ...prev, error: 'Authentication failed' }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [startPolling]);

  // Initialize on mount
  useEffect(() => {
    console.log('🎵 useSpotify initializing...');
    
    // Check if we're returning from auth callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code')) {
      handleAuthCallback();
      return;
    }
    
         // Try to authenticate with existing tokens
     const initializeSpotify = async () => {
       const isAuth = spotifyService.instance.isAuthenticated();
       
       setState(prev => ({ ...prev, isAuthenticated: isAuth }));
       
       if (isAuth) {
         console.log('🎵 Already authenticated, starting polling');
         startPolling();
       }
     };
    
    initializeSpotify();
    
    return () => {
      stopPolling();
      stopAudioAnalysis();
    };
  }, [handleAuthCallback, startPolling, stopPolling, stopAudioAnalysis]);

  return {
    ...state,
    login,
    logout,
    refresh,
    authenticate,
    refreshCurrentTrack,
    startAudioAnalysis,
    stopAudioAnalysis,
    // Browser audio controls
    playPreview,
    pauseAudio,
    resumeAudio,
    stopAudio,
    setVolume,
    toggleMute,
  };
}; 