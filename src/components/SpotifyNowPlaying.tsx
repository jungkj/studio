import React, { useState, useEffect, useRef } from 'react';
import { Music, ExternalLink, Pause, Play } from 'lucide-react';
import { spotifyNowPlaying, NowPlayingTrack } from '@/utils/spotifyNowPlaying';
import { cn } from '@/lib/utils';

interface SpotifyNowPlayingProps {
  className?: string;
}

export const SpotifyNowPlaying: React.FC<SpotifyNowPlayingProps> = ({ className }) => {
  const [track, setTrack] = useState<NowPlayingTrack | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const fetchNowPlaying = async () => {
    try {
      console.log('🎵 SpotifyNowPlaying: Starting fetch...');
      const nowPlaying = await spotifyNowPlaying.getNowPlaying();
      console.log('🎵 SpotifyNowPlaying: Result:', nowPlaying);
      setTrack(nowPlaying);
      setIsLoading(false);
    } catch (error) {
      console.error('🎵 SpotifyNowPlaying: Error:', error);
      setTrack(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNowPlaying();

    // Set up interval when window is focused
    const startPolling = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(fetchNowPlaying, 15000);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleFocus = () => startPolling();
    const handleBlur = () => stopPolling();

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Start polling if window is already focused
    if (document.hasFocus()) {
      startPolling();
    }

    return () => {
      stopPolling();
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopup]);

  // Show loading state or no track state
  if (isLoading || !track) {
    return (
      <div className={cn("flex items-center space-x-2 text-xs", className)}>
        <Music size={14} className="text-mac-dark-gray" />
        <span className="mac-system-font text-mac-dark-gray">
          {isLoading ? "Loading..." : "Spotify"}
        </span>
      </div>
    );
  }

  const displayText = `${track.artist} - ${track.name}`;
  const maxLength = 30;
  const truncatedText = displayText.length > maxLength 
    ? `${displayText.substring(0, maxLength)}...` 
    : displayText;

  return (
    <>
      <div 
        className={cn("flex items-center space-x-2 text-xs cursor-pointer hover:opacity-80 transition-opacity", className)}
        onClick={() => setShowPopup(true)}
      >
        {/* Album artwork */}
        {track.albumImageUrl ? (
          <img 
            src={track.albumImageUrl} 
            alt={track.album}
            className="w-4 h-4 rounded-sm"
            style={{ imageRendering: 'auto' }}
          />
        ) : (
          <Music size={14} className="text-mac-dark-gray" />
        )}

        {/* Track info with updated label */}
        <span className="mac-system-font text-mac-dark-gray">
          <span className="text-mac-darker-gray mr-1">
            {track.isPlaying ? "What I'm listening to:" : "Last played:"}
          </span>
          {track.isPlaying ? (
            <span className="inline-flex items-center gap-1">
              <Play size={10} className="fill-current" />
              {truncatedText}
            </span>
          ) : (
            truncatedText
          )}
        </span>
      </div>

      {/* Cute popup */}
      {showPopup && (
        <div 
          ref={popupRef}
          className="absolute bottom-8 right-2 w-64 bg-mac-white mac-border-outset p-3 z-[9999]"
          style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}
        >
          <div className="flex items-start space-x-3">
            {/* Album art */}
            <img 
              src={track.albumImageUrl} 
              alt={track.album}
              className="w-16 h-16 rounded mac-border-inset flex-shrink-0"
              style={{ imageRendering: 'auto' }}
            />

            {/* Track details */}
            <div className="flex-1 min-w-0">
              <h4 className="mac-system-font text-xs font-bold text-mac-black truncate">
                {track.name}
              </h4>
              <p className="mac-system-font text-xs text-mac-dark-gray truncate">
                {track.artist}
              </p>
              <p className="mac-system-font text-xs text-mac-dark-gray truncate opacity-75">
                {track.album}
              </p>
              
              {/* Status */}
              <div className="mt-2 flex items-center justify-between">
                <span className="mac-system-font text-xs text-mac-dark-gray">
                  {track.isPlaying ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <Play size={10} className="fill-current" />
                      Playing
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Pause size={10} />
                      Last played
                    </span>
                  )}
                </span>

                {/* Open in Spotify */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(track.songUrl, '_blank');
                  }}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mac-system-font"
                >
                  Open
                  <ExternalLink size={10} />
                </button>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPopup(false);
            }}
            className="absolute top-1 right-1 w-3 h-3 bg-mac-light-gray mac-border-outset flex items-center justify-center hover:bg-mac-medium-gray"
          >
            <span className="text-[8px] mac-system-font">×</span>
          </button>
        </div>
      )}
    </>
  );
};