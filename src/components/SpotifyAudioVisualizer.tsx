import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { SpotifyCurrentlyPlaying, spotifyService, SpotifyAudioFeatures } from '@/utils/spotifyService';
import { useSpotify } from '@/hooks/useSpotify';
import { youtubeAudioService, YouTubePlayerState } from '@/utils/youtubeAudioService';
import { Window } from './Window';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Music,
  RefreshCw,
  LogIn,
  LogOut,
  Square,
  Radio,
  Youtube,
  AlertCircle
} from 'lucide-react';
import { PixelButton } from './PixelButton';

interface SpotifyAudioVisualizerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SpotifyAudioVisualizer: React.FC<SpotifyAudioVisualizerProps> = ({ 
  isOpen, 
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<SpotifyCurrentlyPlaying | null>(null);
  const [audioFeatures, setAudioFeatures] = useState<SpotifyAudioFeatures | null>(null);
  const [isLivePlayback, setIsLivePlayback] = useState(false);
  const [youtubeState, setYoutubeState] = useState<YouTubePlayerState>({
    isReady: false,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    videoId: null
  });
  const [isSearchingYouTube, setIsSearchingYouTube] = useState(false);
  const youtubeProgressRef = useRef<NodeJS.Timeout | null>(null);

  // Use the enhanced Spotify hook with browser audio controls - moved up to fix reference error
  const {
    currentTrack,
    lastPlayedTrack,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
    refresh,
    // Browser audio controls
    playPreview,
    pauseAudio,
    resumeAudio,
    stopAudio,
    isPlaying: audioBrowserPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    setVolume,
    toggleMute,
    // Audio analysis
    startAudioAnalysis,
    stopAudioAnalysis,
    audioData,
    isAudioAnalysisActive,
  } = useSpotify();

  // Initialize YouTube player and listen for state changes
  useEffect(() => {
    youtubeAudioService.instance.onStateChange((state) => {
      setYoutubeState(state);
    });

    // Update progress regularly when playing
    const updateProgress = () => {
      if (youtubeState.isPlaying) {
        const state = youtubeAudioService.instance.getState();
        setYoutubeState(state);
      }
    };

    youtubeProgressRef.current = setInterval(updateProgress, 100);

    return () => {
      if (youtubeProgressRef.current) {
        clearInterval(youtubeProgressRef.current);
      }
    };
  }, [youtubeState.isPlaying]);

  // Play track on YouTube
  const playYouTubeTrack = useCallback(async (track: SpotifyCurrentlyPlaying) => {
    if (!track.item) return;
    
    setIsSearchingYouTube(true);
    try {
      const success = await youtubeAudioService.instance.searchAndPlay(track.item);
      if (!success) {
        console.error('Could not find track on YouTube');
      }
    } catch (error) {
      console.error('Error playing YouTube track:', error);
    } finally {
      setIsSearchingYouTube(false);
    }
  }, []);

  // Sync YouTube playback with Spotify
  useEffect(() => {
    if (isLivePlayback && currentTrack && !youtubeState.isPlaying && !isSearchingYouTube) {
      // Automatically play on YouTube when Spotify starts playing
      playYouTubeTrack(currentTrack);
    } else if (!isLivePlayback && youtubeState.isPlaying) {
      // Stop YouTube when Spotify stops
      youtubeAudioService.instance.pause();
    }
  }, [isLivePlayback, currentTrack, youtubeState.isPlaying, isSearchingYouTube, playYouTubeTrack]);

  // Get the track to display (current or last played)
  const displayTrack = currentTrack || lastPlayedTrack;
  
  // Check if we're showing live playback
  useEffect(() => {
    setIsLivePlayback(!!currentTrack?.is_playing);
  }, [currentTrack]);
  
  // Fetch audio features for the current track
  useEffect(() => {
    const fetchAudioFeatures = async () => {
      if (!displayTrack?.item?.id) {
        setAudioFeatures(null);
        return;
      }
      
      try {
        const features = await spotifyService.instance.getAudioFeatures(displayTrack.item.id);
        setAudioFeatures(features);
      } catch (error) {
        console.error('Failed to fetch audio features:', error);
        setAudioFeatures(null);
      }
    };
    
    fetchAudioFeatures();
  }, [displayTrack?.item?.id]);

  // Memoize canvas size calculation to prevent frequent updates
  const updateCanvasSize = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Calculate optimal canvas size based on container
    const containerWidth = rect.width - 32; // Account for padding
    const containerHeight = rect.height - 200; // Account for controls and track info
    
    // Ensure minimum size and maintain aspect ratio
    const minWidth = 400;
    const minHeight = 200;
    const maxHeight = containerHeight > 0 ? containerHeight : 400;
    
    const width = Math.max(minWidth, containerWidth);
    const height = Math.max(minHeight, Math.min(maxHeight, width * 0.5));
    
    setCanvasSize(prev => {
      // Only update if size actually changed to prevent unnecessary re-renders
      if (prev.width !== width || prev.height !== height) {
        return { width, height };
      }
      return prev;
    });
  }, []);

  // Handle window resize (debounced)
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateCanvasSize, 100); // Debounce to 100ms
    };

    window.addEventListener('resize', handleResize);
    
    // Also update on container changes (debounced)
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateCanvasSize, 100);
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [updateCanvasSize]);

  // Initial canvas size setup
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure container is properly rendered
      const timeout = setTimeout(updateCanvasSize, 150);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, updateCanvasSize]);

  // Play preview of a track
  const handlePlayTrack = useCallback(async (track: SpotifyCurrentlyPlaying) => {
    if (!track.item?.preview_url) {
      console.warn('No preview URL available for track');
      return;
    }

    try {
      const success = await playPreview(track.item);
      if (success) {
        setCurrentPlayingTrack(track);
        // Start audio analysis for visualizer
        startAudioAnalysis();
      }
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  }, [playPreview, startAudioAnalysis]);

  // Stop current playback
  const handleStopPlayback = useCallback(() => {
    stopAudio();
    stopAudioAnalysis();
    setCurrentPlayingTrack(null);
  }, [stopAudio, stopAudioAnalysis]);

  // Toggle playback
  const handleTogglePlayback = useCallback(() => {
    if (audioBrowserPlaying) {
      pauseAudio();
    } else if (currentPlayingTrack) {
      resumeAudio();
    } else if (displayTrack) {
      handlePlayTrack(displayTrack);
    }
  }, [audioBrowserPlaying, currentPlayingTrack, displayTrack, pauseAudio, resumeAudio, handlePlayTrack]);

  // Stable frequency generation based on audio data or simulated data
  const generateFrequencyData = useCallback((): number[] => {
    const bars = 128;
    
    // Use preview audio data if available
    if (audioData && audioData.frequencyData && audioData.isPlaying) {
      // Convert Uint8Array to normalized array
      const data = new Array(bars);
      const sourceData = audioData.frequencyData;
      
      for (let i = 0; i < bars; i++) {
        const sourceIndex = Math.floor((i / bars) * sourceData.length);
        data[i] = sourceData[sourceIndex] / 255; // Normalize to 0-1
      }
      
      return data;
    }
    
    // Fallback to simulated data
    const data = new Array(bars);
    const time = Date.now() * 0.001; // Slower time progression for stability
    
    // If no track is available, show gentle ambient visualization
    if (!displayTrack) {
      for (let i = 0; i < bars; i++) {
        const freq = i / bars;
        const ambientWave = Math.sin(time * 0.3 + freq * 2) * 0.08 + 0.04;
        data[i] = Math.max(0.02, ambientWave);
      }
      return data;
    }
    
    // If track is paused and not live, show low-energy pattern
    if (!audioBrowserPlaying && !isLivePlayback) {
      for (let i = 0; i < bars; i++) {
        const freq = i / bars;
        const pausedWave = Math.sin(time * 0.5 + freq * 4) * 0.15 + 0.1;
        data[i] = Math.max(0.05, pausedWave * 0.4);
      }
      return data;
    }

    // Enhanced visualization for playing track
    const trackProgress = isLivePlayback ? 
      (currentTrack?.progress_ms || 0) / (displayTrack.item?.duration_ms || 1) :
      currentTime / Math.max(duration, 30);
    
    // Create signature based on track name for consistent patterns
    const trackName = displayTrack.item?.name || '';
    const artistName = displayTrack.item?.artists?.[0]?.name || '';
    const trackHash = (trackName + artistName).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Use audio features if available for more accurate visualization
    const energy = audioFeatures?.energy || 0.5;
    const danceability = audioFeatures?.danceability || 0.5;
    const tempo = audioFeatures?.tempo || 120;
    const valence = audioFeatures?.valence || 0.5; // Positivity of the track
    
    const trackIntensity = audioFeatures ? energy : Math.abs(trackHash % 100) / 100;
    const progressPhase = trackProgress * Math.PI * 6;
    const trackPhase = (trackHash % 1000) / 1000 * Math.PI * 2;
    
    // Adjust visualization speed based on tempo
    const tempoFactor = tempo / 120; // Normalize to 120 BPM
    const adjustedTime = time * tempoFactor;
    
    for (let i = 0; i < bars; i++) {
      const freq = i / bars;
      
      // Enhanced frequency response curve based on audio features
      const bassBoost = i < bars * 0.2 ? 1.8 + energy * 0.5 : 1.0;
      const midBoost = i > bars * 0.2 && i < bars * 0.7 ? 1.4 + danceability * 0.3 : 1.0;
      const highCut = i > bars * 0.8 ? 0.7 + valence * 0.3 : 1.0;
      
      // Stable wave patterns adjusted for tempo
      const wave1 = Math.sin(adjustedTime * 1.5 + freq * 7 + progressPhase * 0.7 + trackPhase) * 0.35;
      const wave2 = Math.sin(adjustedTime * 2.2 + freq * 11 + progressPhase * 1.1) * 0.25;
      const wave3 = Math.sin(adjustedTime * 0.8 + freq * 5 + trackPhase) * 0.18;
      
      // Combine waves with frequency response
      let amplitude = (wave1 + wave2 + wave3) * bassBoost * midBoost * highCut;
      amplitude = Math.max(0.05, Math.min(1.0, amplitude + 0.3));
      
      data[i] = amplitude;
    }
    
    return data;
  }, [audioData, displayTrack, audioBrowserPlaying, currentTime, duration, isLivePlayback, currentTrack, audioFeatures, youtubeState.isPlaying]);

  // Memoize color function to prevent recalculation
  const getFrequencyColor = useMemo(() => {
    return (amplitude: number, index: number, total: number): string => {
      const freq = index / total;
      const intensity = amplitude;
      
      // If YouTube is playing, use blue color scheme
      if (youtubeState.isPlaying) {
        if (freq < 0.33) {
          // Bass - Dark to Light Blue
          const blue = Math.floor(100 + 155 * intensity);
          const green = Math.floor(50 * intensity);
          return `rgb(0, ${green}, ${blue})`;
        } else if (freq < 0.66) {
          // Mid - Blue to Cyan
          const blue = Math.floor(200 + 55 * intensity);
          const green = Math.floor(150 * intensity);
          return `rgb(0, ${green}, ${blue})`;
        } else {
          // High - Cyan to White
          const blue = Math.floor(200 + 55 * intensity);
          const green = Math.floor(200 + 55 * intensity);
          const red = Math.floor(100 * intensity);
          return `rgb(${red}, ${green}, ${blue})`;
        }
      }
      
      // If live playback on Spotify, use green color scheme
      if (isLivePlayback) {
        if (freq < 0.33) {
          // Bass - Dark to Light Green
          const green = Math.floor(100 + 155 * intensity);
          const red = Math.floor(20 * intensity);
          return `rgb(${red}, ${green}, 0)`;
        } else if (freq < 0.66) {
          // Mid - Light Green to Cyan
          const green = Math.floor(200 + 55 * intensity);
          const blue = Math.floor(100 * intensity);
          return `rgb(0, ${green}, ${blue})`;
        } else {
          // High - Cyan to Light Blue
          const green = Math.floor(150 + 105 * intensity);
          const blue = Math.floor(150 + 105 * intensity);
          return `rgb(0, ${green}, ${blue})`;
        }
      }
      
      // Default color scheme for non-live playback
      if (freq < 0.33) {
        // Bass - Red to Orange
        const red = Math.floor(255 * intensity);
        const green = Math.floor(100 * intensity);
        return `rgb(${red}, ${green}, 0)`;
      } else if (freq < 0.66) {
        // Mid - Orange to Yellow
        const red = Math.floor(200 * intensity);
        const green = Math.floor(255 * intensity);
        return `rgb(${red}, ${green}, 0)`;
      } else {
        // High - Blue to Purple
        const blue = Math.floor(255 * intensity);
        const red = Math.floor(150 * intensity);
        return `rgb(${red}, 0, ${blue})`;
      }
    };
  }, [isLivePlayback, youtubeState.isPlaying]);

  // Optimized drawing function with memoization
  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Get frequency data
    const frequencyData = generateFrequencyData();
    const barCount = frequencyData.length;
    const barWidth = canvasSize.width / barCount;

    // Draw bars
    for (let i = 0; i < barCount; i++) {
      const amplitude = frequencyData[i];
      const barHeight = amplitude * canvasSize.height * 0.8;
      const x = i * barWidth;
      const y = canvasSize.height - barHeight;

      // Get color for this bar
      const color = getFrequencyColor(amplitude, i, barCount);
      
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
      
      // Add glow effect for higher amplitudes
      if (amplitude > 0.6) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fillRect(x, y, barWidth - 1, barHeight);
        ctx.shadowBlur = 0;
      }
    }
  }, [canvasSize, generateFrequencyData, getFrequencyColor]);

  // Animation loop with optimized frame rate
  useEffect(() => {
    if (!isOpen) return;

    let lastFrameTime = 0;
    const targetFPS = 30; // Reduced from 60fps to prevent excessive updates
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      if (currentTime - lastFrameTime >= frameInterval) {
        drawVisualizer();
        lastFrameTime = currentTime;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen, drawVisualizer]);

  // Format time helper
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Volume controls
  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
  };

  if (!isOpen) return null;

  return (
    <Window
      title={`Spotify Audio Visualizer ${youtubeState.isPlaying ? '🎵 Playing' : isLivePlayback ? '🟢 Live' : ''}`}
      onClose={onClose}
      initialSize={{ width: 900, height: 700 }}
      initialPosition={{ x: 200, y: 100 }}
    >
      <div 
        ref={containerRef}
        className="flex flex-col h-full bg-mac-light-gray mac-border-inset"
      >
        {/* Header */}
        <div className="p-4 border-b border-mac-dark-gray bg-mac-medium-gray">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music size={24} className="text-mac-dark-gray" />
              <div>
                <h2 className="text-lg pixel-font font-bold text-mac-black">
                  Spotify Visualizer
                </h2>
                <p className="text-xs text-mac-dark-gray pixel-font flex items-center gap-2">
                  {isAuthenticated ? (
                    <>
                      {isLivePlayback ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <Radio size={10} className="animate-pulse" />
                          <span>Live • Playing on Spotify</span>
                        </span>
                      ) : (
                        <span>Connected • Last Played</span>
                      )}
                    </>
                  ) : (
                    'Not connected'
                  )}
                </p>
                {isAuthenticated && !currentTrack && (
                  <p className="text-xs text-blue-600 pixel-font mt-1">
                    💡 Start playing music on Spotify for live visualization!
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <PixelButton
                onClick={refresh}
                disabled={isLoading}
                className="!px-3 !py-1 !text-xs"
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              </PixelButton>
              
              {isAuthenticated ? (
                <PixelButton
                  onClick={logout}
                  className="!px-3 !py-1 !text-xs bg-red-600 hover:bg-red-700 text-white"
                >
                  <LogOut size={12} />
                  Logout
                </PixelButton>
              ) : (
                <PixelButton
                  onClick={login}
                  className="!px-3 !py-1 !text-xs bg-green-600 hover:bg-green-700 text-white"
                >
                  <LogIn size={12} />
                  Login
                </PixelButton>
              )}
            </div>
          </div>
        </div>

        {/* Visualizer */}
        <div className="flex-1 p-4 flex flex-col items-center justify-center bg-black min-h-0">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="mac-border-inset bg-black rounded"
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Track Info */}
        {displayTrack && (
          <div className="p-4 bg-mac-medium-gray border-t border-mac-dark-gray">
            <div className="flex items-center gap-4">
              {/* Album Art */}
              <div className="w-16 h-16 bg-mac-darker-gray mac-border-inset flex items-center justify-center rounded">
                {displayTrack.item?.album?.images?.[0]?.url ? (
                  <img 
                    src={displayTrack.item.album.images[0].url} 
                    alt="Album Art"
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <Music size={24} className="text-mac-dark-gray" />
                )}
              </div>

              {/* Track Details */}
              <div className="flex-1 min-w-0">
                <h3 className="pixel-font font-bold text-mac-black text-lg truncate">
                  {displayTrack.item?.name || 'Unknown Track'}
                </h3>
                <p className="pixel-font text-mac-dark-gray text-sm truncate">
                  {displayTrack.item?.artists?.map(a => a.name).join(', ') || 'Unknown Artist'}
                </p>
                <p className="pixel-font text-mac-dark-gray text-xs mt-1 truncate">
                  {displayTrack.item?.album?.name || 'Unknown Album'}
                </p>
                
                {/* Progress Bar for Browser Playback */}
                {audioBrowserPlaying && duration > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-mac-darker-gray mac-border-inset h-2 rounded">
                      <div 
                        className="bg-apple-blue h-full rounded transition-all duration-300"
                        style={{ 
                          width: `${(currentTime / duration) * 100}%` 
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs pixel-font text-mac-dark-gray mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                )}
                
                {/* Preview Notice */}
                {displayTrack.item?.preview_url && (
                  <p className="text-xs pixel-font text-mac-dark-gray mt-1">
                    30-second preview available
                  </p>
                )}
                
                {!displayTrack.item?.preview_url && (
                  <p className="text-xs pixel-font text-red-600 mt-1">
                    No preview available
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-4 bg-mac-light-gray border-t border-mac-dark-gray">
          <div className="flex items-center justify-between">
            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              {/* Spotify Controls (when authenticated) */}
              {isAuthenticated && (
                <>
                  <PixelButton
                    onClick={async () => {
                      try {
                        await spotifyService.instance.skipToPrevious();
                        setTimeout(refresh, 500);
                      } catch (error) {
                        console.error('Failed to skip to previous:', error);
                      }
                    }}
                    className="!px-3 !py-2"
                    title="Previous Track (Spotify)"
                  >
                    <SkipBack size={16} />
                  </PixelButton>
                  
                  <PixelButton
                    onClick={async () => {
                      try {
                        if (isLivePlayback) {
                          await spotifyService.instance.pausePlayback();
                        } else {
                          await spotifyService.instance.resumePlayback();
                        }
                        setTimeout(refresh, 500);
                      } catch (error) {
                        console.error('Failed to control playback:', error);
                      }
                    }}
                    className={`!px-4 !py-2 ${isLivePlayback ? 'bg-green-600 hover:bg-green-700' : 'bg-apple-blue hover:bg-blue-600'} text-white`}
                    title={isLivePlayback ? 'Pause Spotify' : 'Play on Spotify'}
                  >
                    {isLivePlayback ? <Pause size={20} /> : <Play size={20} />}
                  </PixelButton>
                  
                  <PixelButton
                    onClick={async () => {
                      try {
                        await spotifyService.instance.skipToNext();
                        setTimeout(refresh, 500);
                      } catch (error) {
                        console.error('Failed to skip to next:', error);
                      }
                    }}
                    className="!px-3 !py-2"
                    title="Next Track (Spotify)"
                  >
                    <SkipForward size={16} />
                  </PixelButton>
                  
                  <div className="w-px h-8 bg-mac-dark-gray mx-2" />
                </>
              )}
              
              {/* Preview Controls */}
              <PixelButton
                onClick={handleTogglePlayback}
                disabled={!displayTrack?.item?.preview_url}
                className="!px-4 !py-2 bg-apple-blue hover:bg-blue-600 text-white disabled:bg-gray-400"
                title="Play/Pause Preview"
              >
                {audioBrowserPlaying ? <Pause size={20} /> : <Play size={20} />}
              </PixelButton>
              
              <PixelButton
                onClick={handleStopPlayback}
                disabled={!audioBrowserPlaying}
                className="!px-3 !py-2 disabled:bg-gray-400"
                title="Stop Preview"
              >
                <Square size={16} />
              </PixelButton>
              
              {/* YouTube Controls */}
              {displayTrack && (
                <>
                  <div className="w-px h-8 bg-mac-dark-gray mx-2" />
                  <PixelButton
                    onClick={() => {
                      if (youtubeState.isPlaying) {
                        youtubeAudioService.instance.pause();
                      } else if (displayTrack) {
                        playYouTubeTrack(displayTrack);
                      }
                    }}
                    disabled={isSearchingYouTube}
                    className={`!px-4 !py-2 ${youtubeState.isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                    title={youtubeState.isPlaying ? 'Stop YouTube' : 'Play on YouTube'}
                  >
                    <Youtube size={16} />
                    {isSearchingYouTube ? 'Searching...' : youtubeState.isPlaying ? 'Stop' : 'YouTube'}
                  </PixelButton>
                </>
              )}
            </div>

            {/* Volume Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="text-mac-dark-gray hover:text-mac-black transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 accent-apple-blue"
              />
              
              <span className="text-xs pixel-font text-mac-dark-gray w-8">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mt-3 p-2 bg-red-100 mac-border-inset rounded">
              <p className="text-xs pixel-font text-red-700">{error}</p>
            </div>
          )}
          
          {!isAuthenticated && !error && (
            <div className="mt-3 p-2 bg-yellow-100 mac-border-inset rounded">
              <p className="text-xs pixel-font text-yellow-800">
                Connect to Spotify to browse your music and play previews
              </p>
            </div>
          )}
          
          {isAuthenticated && !displayTrack && (
            <div className="mt-3 p-2 bg-blue-100 mac-border-inset rounded">
              <p className="text-xs pixel-font text-blue-800">
                <strong>🎵 Start playing music on Spotify</strong> to see live visualization!
              </p>
            </div>
          )}
          
          {isAuthenticated && displayTrack && !isLivePlayback && (
            <div className="mt-3 p-2 bg-orange-100 mac-border-inset rounded">
              <p className="text-xs pixel-font text-orange-800">
                <strong>Showing last played:</strong> {displayTrack.item?.name || 'Unknown'}<br/>
                Start playing on Spotify to see live visualization in green!
              </p>
            </div>
          )}
          
          {isAuthenticated && isLivePlayback && (
            <div className="mt-3 p-2 bg-green-100 mac-border-inset rounded">
              <p className="text-xs pixel-font text-green-800">
                <strong>🟢 Live:</strong> Currently playing on your Spotify!<br/>
                Controls above sync with your active Spotify device.
              </p>
            </div>
          )}
          
          {displayTrack?.item?.preview_url && !isLivePlayback && (
            <div className="mt-3 p-2 bg-blue-100 mac-border-inset rounded">
              <p className="text-xs pixel-font text-blue-800">
                <strong>Preview available!</strong> Click play to hear a 30-second preview with visualization.
              </p>
            </div>
          )}
          
          {youtubeState.isPlaying && (
            <div className="mt-3 p-2 bg-blue-100 mac-border-inset rounded">
              <p className="text-xs pixel-font text-blue-800">
                <strong>🎵 YouTube Audio Playing!</strong><br/>
                Full track playback with real-time visualization.
              </p>
            </div>
          )}
          
          {isSearchingYouTube && (
            <div className="mt-3 p-2 bg-yellow-100 mac-border-inset rounded">
              <p className="text-xs pixel-font text-yellow-800">
                <strong>🔍 Searching YouTube...</strong><br/>
                Looking for "{displayTrack?.item?.name}" by {displayTrack?.item?.artists?.[0]?.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </Window>
  );
};

export { SpotifyAudioVisualizer }; 