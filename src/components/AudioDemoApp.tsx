import React, { useState } from 'react';
import { Music, Play, Settings, Waves } from 'lucide-react';
import { Window } from './Window';
import { RealTimeAudioPlayer } from './RealTimeAudioPlayer';
import { SpotifyDisplay } from './SpotifyDisplay';
import { useSpotify } from '@/hooks/useSpotify';
import { SpotifyCurrentlyPlaying } from '@/utils/spotifyService';
import { cn } from '@/lib/utils';

interface AudioDemoAppProps {
  isOpen: boolean;
  onClose: () => void;
}

const AudioDemoApp: React.FC<AudioDemoAppProps> = ({ isOpen, onClose }) => {
  const [activeMode, setActiveMode] = useState<'spotify' | 'realtime'>('realtime');
  const [showSettings, setShowSettings] = useState(false);
  
  // Use existing Spotify hook for comparison
  const { 
    currentTrack, 
    lastPlayedTrack,
    isLoading, 
    error,
    // Browser audio state
    isPlaying: audioBrowserPlaying,
    currentTime,
    duration,
    playPreview,
  } = useSpotify();

  const handlePlayPreview = (trackData: SpotifyCurrentlyPlaying) => {
    if (trackData.item) {
      playPreview(trackData.item);
    }
  };

  if (!isOpen) return null;

  return (
    <Window
      title="Audio Visualizer Demo"
      onClose={onClose}
      initialSize={{ width: 500, height: 600 }}
      initialPosition={{ x: 200, y: 100 }}
    >
      <div className="flex flex-col h-full bg-mac-light-gray p-4 space-y-4">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Music size={20} className="text-mac-dark-gray" />
            <h2 className="text-lg mac-system-font font-bold text-mac-black">
              Audio Visualization Demo
            </h2>
          </div>
          <p className="text-xs text-mac-dark-gray mac-system-font">
            Compare Spotify simulation vs real-time audio analysis
          </p>
        </div>

        {/* Mode Selector */}
        <div className="bg-mac-medium-gray mac-border-inset p-3 rounded">
          <div className="text-sm mac-system-font text-mac-black mb-3 font-bold">
            Select Audio Source:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveMode('realtime')}
              className={cn(
                "p-3 mac-border-outset text-sm mac-system-font transition-colors flex flex-col items-center gap-2",
                activeMode === 'realtime' 
                  ? "bg-apple-blue text-white" 
                  : "bg-mac-light-gray text-mac-black hover:bg-mac-medium-gray"
              )}
            >
              <Waves size={20} />
              <div>
                <div className="font-bold">Real-Time Audio</div>
                <div className="text-xs opacity-75">Upload & analyze live</div>
              </div>
            </button>
            
            <button
              onClick={() => setActiveMode('spotify')}
              className={cn(
                "p-3 mac-border-outset text-sm mac-system-font transition-colors flex flex-col items-center gap-2",
                activeMode === 'spotify' 
                  ? "bg-green-600 text-white" 
                  : "bg-mac-light-gray text-mac-black hover:bg-mac-medium-gray"
              )}
            >
              <Play size={20} />
              <div>
                <div className="font-bold">Spotify Simulation</div>
                <div className="text-xs opacity-75">Algorithmic patterns</div>
              </div>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeMode === 'realtime' ? (
            <div className="space-y-4">
              <div className="bg-mac-darker-gray mac-border-inset p-3 rounded">
                <h3 className="text-sm mac-system-font font-bold text-mac-black mb-2">
                  Real-Time Audio Analysis
                </h3>
                <p className="text-xs text-mac-dark-gray mac-system-font mb-3">
                  Upload an audio file and see live frequency analysis with synchronized visualization.
                  Uses Web Audio API for real-time spectrum analysis.
                </p>
                
                <div className="space-y-2 text-xs text-mac-dark-gray">
                  <div>✓ Real-time frequency analysis</div>
                  <div>✓ Bass/Mid/Treble separation</div>
                  <div>✓ Peak frequency detection</div>
                  <div>✓ Volume level monitoring</div>
                  <div>✓ Synchronized visualizer</div>
                </div>
              </div>

              {/* Real-Time Audio Player */}
              <RealTimeAudioPlayer className="w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-mac-darker-gray mac-border-inset p-3 rounded">
                <h3 className="text-sm mac-system-font font-bold text-mac-black mb-2">
                  Spotify Simulation Mode
                </h3>
                <p className="text-xs text-mac-dark-gray mac-system-font mb-3">
                  Current Spotify integration creates algorithmic patterns based on song metadata 
                  and progress. No actual audio analysis is performed.
                </p>

                <div className="space-y-2 text-xs text-mac-dark-gray">
                  <div>○ Simulated frequency patterns</div>
                  <div>○ Progress-based variations</div>
                  <div>○ Metadata-driven colors</div>
                  <div>○ No real audio analysis</div>
                  <div>○ Spotify Web API only</div>
                </div>
              </div>

              {/* Spotify Display */}
              <div className="bg-mac-light-gray mac-border-outset p-3 rounded">
                <SpotifyDisplay
                  currentTrack={currentTrack}
                  cachedTrack={lastPlayedTrack}
                  isLoading={isLoading}
                  error={error}
                  demoMode={true}
                  onPlayCached={() => {}}
                  className="w-full"
                  // Browser audio state
                  isPlaying={audioBrowserPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  onPlayPreview={handlePlayPreview}
                />
              </div>

              {/* Explanation */}
              <div className="text-xs text-mac-dark-gray mac-system-font p-2 bg-mac-medium-gray mac-border-inset rounded">
                <strong>Note:</strong> Spotify's Web API doesn't provide access to actual audio streams 
                due to DRM restrictions. The current visualizer creates convincing patterns based on 
                song progress and metadata, but isn't analyzing real audio frequencies.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-mac-dark-gray pt-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-mac-dark-gray mac-system-font">
              {activeMode === 'realtime' 
                ? 'Web Audio API + Canvas Visualization' 
                : 'Spotify Web API + Simulated Patterns'
              }
            </div>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 bg-mac-medium-gray mac-border-outset hover:bg-mac-dark-gray transition-colors"
              title="Settings"
            >
              <Settings size={14} />
            </button>
          </div>
          
          {showSettings && (
            <div className="mt-3 p-2 bg-mac-medium-gray mac-border-inset rounded text-xs text-mac-dark-gray">
              <div className="space-y-1">
                <div><strong>Real-Time Mode:</strong> Supports MP3, WAV, OGG, M4A files</div>
                <div><strong>Browser Support:</strong> Chrome, Firefox, Safari, Edge</div>
                <div><strong>Sample Rate:</strong> 44.1kHz (standard)</div>
                <div><strong>FFT Size:</strong> 2048 (high resolution)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Window>
  );
};

export { AudioDemoApp }; 