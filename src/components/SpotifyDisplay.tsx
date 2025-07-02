import React, { useState, useEffect, useMemo } from 'react';
import { Music, Play, Pause, ExternalLink, PlayCircle } from 'lucide-react';
import { SpotifyCurrentlyPlaying } from '@/utils/spotifyService';
import { cn } from '@/lib/utils';
import { SpotifyAudioVisualizer } from './SpotifyAudioVisualizer';

interface SpotifyDisplayProps {
  currentTrack: SpotifyCurrentlyPlaying | null;
  cachedTrack: SpotifyCurrentlyPlaying | null;
  isLoading: boolean;
  error: string | null;
  demoMode: boolean;
  onPlayCached: () => void;
  className?: string;
  // Browser audio state
  isPlaying?: boolean;
  currentTime?: number;
  duration?: number;
  onPlayPreview?: (track: SpotifyCurrentlyPlaying) => void;
}

const SpotifyDisplay: React.FC<SpotifyDisplayProps> = ({ 
  currentTrack, 
  cachedTrack,
  isLoading, 
  error, 
  demoMode,
  onPlayCached,
  className,
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  onPlayPreview,
}) => {
  const [showVisualizer, setShowVisualizer] = useState(false);

  // Stable progress calculation to prevent flashing
  const progressPercentage = useMemo(() => {
    if (!isPlaying || !duration || duration === 0) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [isPlaying, currentTime, duration]);

  // Format time in mm:ss (memoized to prevent recalculation)
  const formatTime = useMemo(() => {
    return (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
  }, []);

  // Stable display text calculation
  const displayData = useMemo(() => {
    if (error) {
      return { type: 'error', text: 'Spotify error', showProgress: false };
    }

    if (isLoading) {
      return { type: 'loading', text: 'Loading...', showProgress: false };
    }

    // Show cached track if nothing is currently playing but we have a cached track
    if ((!currentTrack || !currentTrack.item || !currentTrack.is_playing) && cachedTrack?.item) {
      const { item: track } = cachedTrack;
      const artistNames = track.artists.map(artist => artist.name).join(', ');
      const displayText = `${artistNames} - ${track.name}`;
      const maxLength = window.innerWidth < 768 ? 18 : 25;
      const truncatedText = displayText.length > maxLength 
        ? `${displayText.substring(0, maxLength)}...` 
        : displayText;

      return {
        type: 'cached',
        text: truncatedText,
        fullText: displayText,
        track: cachedTrack,
        showProgress: false,
        hasPreview: !!track.preview_url,
      };
    }

    // Show "Not playing" if no current track and no cached track
    if (!currentTrack || !currentTrack.item || !currentTrack.is_playing) {
      return { type: 'not_playing', text: 'Not playing', showProgress: false };
    }

    // Show current playing track
    const { item: track, is_playing } = currentTrack;
    const artistNames = track.artists.map(artist => artist.name).join(', ');
    const displayText = `${artistNames} - ${track.name}`;
    const maxLength = window.innerWidth < 768 ? 20 : 30;
    const truncatedText = displayText.length > maxLength 
      ? `${displayText.substring(0, maxLength)}...` 
      : displayText;

    return {
      type: 'current',
      text: truncatedText,
      fullText: displayText,
      track: currentTrack,
      isPlaying: is_playing,
      showProgress: true,
      hasPreview: !!track.preview_url,
    };
  }, [currentTrack, cachedTrack, isLoading, error]);

  // Handle play preview
  const handlePlayPreview = () => {
    if (displayData.track && onPlayPreview) {
      onPlayPreview(displayData.track);
    }
  };

  // Render based on display type
  if (displayData.type === 'error') {
    return (
      <div className={cn("flex items-center space-x-2 text-xs", className)}>
        <Music size={14} className="text-mac-dark-gray" />
        <span className="text-mac-dark-gray">{displayData.text}</span>
      </div>
    );
  }

  if (displayData.type === 'loading') {
    return (
      <div className={cn("flex items-center space-x-2 text-xs", className)}>
        <Music size={14} className="text-mac-dark-gray animate-pulse" />
        <span className="text-mac-dark-gray">{displayData.text}</span>
      </div>
    );
  }

  if (displayData.type === 'cached') {
    return (
      <>
        <div className={cn("flex items-center space-x-2 text-xs group", className)}>
          {/* Play button for cached track */}
          <button
            onClick={displayData.hasPreview ? handlePlayPreview : onPlayCached}
            className="flex items-center hover:text-green-600 transition-colors"
            title={displayData.hasPreview ? "Play preview" : "Play last track"}
          >
            <PlayCircle size={14} className="text-mac-dark-gray hover:text-green-600" />
          </button>
          
          {/* Cached track info */}
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <span 
              className={cn(
                "mac-system-font text-mac-dark-gray truncate transition-colors break-words cursor-pointer hover:text-blue-600"
              )}
              title={`${displayData.fullText} (Last played) - Click to open visualizer`}
              onClick={() => setShowVisualizer(true)}
            >
              {displayData.text}
            </span>
            
            <span className="text-[10px] text-mac-dark-gray opacity-75">(last played)</span>
            
            {/* External link icon */}
            {!demoMode && displayData.track?.item?.external_urls?.spotify && (
              <span
                title="Open in Spotify"
                className="cursor-pointer flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(displayData.track.item.external_urls.spotify, '_blank');
                }}
              >
                <ExternalLink 
                  size={10} 
                  className="text-mac-dark-gray opacity-0 group-hover:opacity-100 transition-opacity" 
                />
              </span>
            )}
          </div>
        </div>
        
        {/* Audio Visualizer Modal */}
        {showVisualizer && (
          <SpotifyAudioVisualizer
            isOpen={showVisualizer}
            onClose={() => setShowVisualizer(false)}
          />
        )}
      </>
    );
  }

  if (displayData.type === 'not_playing') {
    return (
      <div className={cn("flex items-center space-x-2 text-xs", className)}>
        <Music size={14} className="text-mac-dark-gray" />
        <span className="text-mac-dark-gray">{displayData.text}</span>
      </div>
    );
  }

  // Current playing track
  return (
    <>
      <div className={cn("flex items-center space-x-2 text-xs group", className)}>
        {/* Music icon with play/pause state */}
        <div className="flex items-center">
          {displayData.isPlaying ? (
            <Play size={14} className="text-green-600 fill-current animate-pulse" />
          ) : (
            <Pause size={14} className="text-mac-dark-gray" />
          )}
        </div>
        
        {/* Track info with progress */}
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <span 
            className={cn(
              "mac-system-font text-mac-black truncate transition-colors break-words cursor-pointer hover:text-blue-600"
            )}
            title={`${displayData.fullText}${demoMode ? ' (Demo Mode)' : ''} - Click to open visualizer`}
            onClick={() => setShowVisualizer(true)}
          >
            {displayData.text}
          </span>
          
          {/* Browser playback progress bar */}
          {isPlaying && duration > 0 && (
            <div className="flex items-center space-x-1 min-w-[60px]">
              <div className="w-16 h-1 bg-mac-dark-gray mac-border-inset relative overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-300 ease-linear"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-[10px] text-mac-dark-gray whitespace-nowrap">
                {formatTime(currentTime)}/{formatTime(duration)}
              </span>
            </div>
          )}
          
          {/* Preview indicator */}
          {displayData.hasPreview && (
            <button
              onClick={handlePlayPreview}
              className="text-[10px] text-blue-600 hover:text-blue-800 cursor-pointer"
              title="Play 30s preview"
            >
              preview
            </button>
          )}
          
          {/* External link icon */}
          {!demoMode && displayData.track?.item?.external_urls?.spotify && (
            <span
              title="Open in Spotify"
              className="cursor-pointer flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                window.open(displayData.track.item.external_urls.spotify, '_blank');
              }}
            >
              <ExternalLink 
                size={10} 
                className="text-mac-dark-gray opacity-0 group-hover:opacity-100 transition-opacity" 
              />
            </span>
          )}
        </div>
      </div>
      
      {/* Audio Visualizer Modal */}
      {showVisualizer && (
        <SpotifyAudioVisualizer
          isOpen={showVisualizer}
          onClose={() => setShowVisualizer(false)}
        />
      )}
    </>
  );
};

export { SpotifyDisplay }; 