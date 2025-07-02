import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Upload, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { AudioAnalyzer, AudioAnalysisData } from '@/utils/audioAnalyzer';
import { SpotifyAudioVisualizer } from './SpotifyAudioVisualizer';
import { cn } from '@/lib/utils';

interface Track {
  id: string;
  name: string;
  artist: string;
  file: File | string;
  duration?: number;
}

interface RealTimeAudioPlayerProps {
  className?: string;
}

// Convert AudioAnalysisData to format expected by existing AudioVisualizer
const convertToSpotifyFormat = (track: Track, analysisData: AudioAnalysisData, currentTime: number, isPlaying: boolean) => {
  return {
    is_playing: isPlaying,
    item: {
      id: track.id,
      name: track.name,
      artists: [{ name: track.artist }],
      album: {
        name: 'Local Audio',
        images: [{ url: '', width: 300, height: 300 }]
      },
      duration_ms: (track.duration || 0) * 1000,
      uri: `local:track:${track.id}`,
      external_urls: { spotify: '' }
    },
    progress_ms: currentTime * 1000,
    timestamp: Date.now()
  };
};

const RealTimeAudioPlayer: React.FC<RealTimeAudioPlayerProps> = ({ className }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(true); // Start muted by default
  const [analysisData, setAnalysisData] = useState<AudioAnalysisData | null>(null);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [isAnalyzerReady, setIsAnalyzerReady] = useState(false);
  const [autoplayAttempted, setAutoplayAttempted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number>();

  // Initialize audio analyzer
  useEffect(() => {
    analyzerRef.current = new AudioAnalyzer();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      analyzerRef.current?.disconnect();
    };
  }, []);

  // Audio analysis loop
  const updateAnalysis = useCallback(() => {
    if (!analyzerRef.current || !isPlaying) return;

    const data = analyzerRef.current.getFrequencyData();
    if (data) {
      setAnalysisData(data);
    }

    animationFrameRef.current = requestAnimationFrame(updateAnalysis);
  }, [isPlaying]);

  // Handle audio element events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      if (currentTrack) {
        setCurrentTrack(prev => prev ? { ...prev, duration: audio.duration } : null);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleCanPlay = async () => {
      if (analyzerRef.current && !isAnalyzerReady) {
        const connected = await analyzerRef.current.connectToAudioElement(audio);
        setIsAnalyzerReady(connected);
        
        // Auto-play when ready (but muted)
        if (connected && !autoplayAttempted) {
          setAutoplayAttempted(true);
          try {
            audio.volume = 0; // Start muted
            setIsMuted(true);
            await audio.play();
            setIsPlaying(true);
          } catch (error) {
            console.log('Autoplay prevented by browser policy');
          }
        }
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentTrack, isAnalyzerReady]);

  // Start/stop analysis loop based on playback state
  useEffect(() => {
    if (isPlaying && isAnalyzerReady) {
      updateAnalysis();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isAnalyzerReady, updateAnalysis]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file');
      return;
    }

    const track: Track = {
      id: `local-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      artist: 'Local File',
      file: file
    };

    setCurrentTrack(track);
    setAutoplayAttempted(false); // Reset autoplay flag for new track
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    
    if (audioRef.current) {
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      audioRef.current.load();
    }
  };

  const togglePlayback = async () => {
    if (!audioRef.current || !currentTrack) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const newTime = parseFloat(event.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Handle volume changes from visualizer
  const handleVisualizerVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Handle play/pause from visualizer
  const handleVisualizerPlayPause = () => {
    togglePlayback();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Convert to format expected by existing visualizer
  const visualizerData = currentTrack && analysisData ? 
    convertToSpotifyFormat(currentTrack, analysisData, currentTime, isPlaying) : null;

  return (
    <>
      <div className={cn("bg-mac-light-gray mac-border-outset p-4 rounded max-w-md", className)}>
        {/* File Upload */}
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 bg-mac-medium-gray mac-border-outset p-2 hover:bg-mac-dark-gray transition-colors"
          >
            <Upload size={16} />
            <span className="text-sm mac-system-font">
              {currentTrack ? 'Change Track' : 'Upload Audio File'}
            </span>
          </button>
        </div>

        {/* Track Info */}
        {currentTrack && (
          <div className="mb-4 text-center">
            <div className="text-sm mac-system-font font-bold text-mac-black truncate">
              {currentTrack.name}
            </div>
            <div className="text-xs mac-system-font text-mac-dark-gray truncate">
              {currentTrack.artist}
            </div>
          </div>
        )}

        {/* Playback Controls */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = Math.max(0, currentTime - 10);
              }
            }}
            disabled={!currentTrack}
            className="p-2 bg-mac-medium-gray mac-border-outset disabled:opacity-50 hover:bg-mac-dark-gray"
          >
            <SkipBack size={16} />
          </button>

          <button
            onClick={togglePlayback}
            disabled={!currentTrack}
            className="p-3 bg-mac-medium-gray mac-border-outset disabled:opacity-50 hover:bg-mac-dark-gray"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = Math.min(duration, currentTime + 10);
              }
            }}
            disabled={!currentTrack}
            className="p-2 bg-mac-medium-gray mac-border-outset disabled:opacity-50 hover:bg-mac-dark-gray"
          >
            <SkipForward size={16} />
          </button>
        </div>

        {/* Progress Bar */}
        {currentTrack && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs text-mac-dark-gray mb-1">
              <span>{formatTime(currentTime)}</span>
              <span className="flex-1 text-center">
                {isAnalyzerReady ? 'Live Analysis' : 'Loading...'}
              </span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-mac-dark-gray rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        )}

        {/* Volume Control */}
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => {
              const newMuted = !isMuted;
              setIsMuted(newMuted);
              if (audioRef.current) {
                audioRef.current.volume = newMuted ? 0 : volume;
              }
            }}
            className="p-1 bg-mac-medium-gray mac-border-outset hover:bg-mac-dark-gray transition-colors"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="flex-1 h-2 bg-mac-dark-gray rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-xs text-mac-dark-gray min-w-[3ch]">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>

        {/* Analysis Display */}
        {analysisData && (
          <div className="mb-4 text-xs space-y-1">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-mac-dark-gray">Bass</div>
                <div className="font-mono">{Math.round(analysisData.bassLevel * 100)}%</div>
              </div>
              <div>
                <div className="text-mac-dark-gray">Mid</div>
                <div className="font-mono">{Math.round(analysisData.midLevel * 100)}%</div>
              </div>
              <div>
                <div className="text-mac-dark-gray">Treble</div>
                <div className="font-mono">{Math.round(analysisData.trebleLevel * 100)}%</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-mac-dark-gray">Peak: {Math.round(analysisData.peakFrequency)}Hz</div>
            </div>
          </div>
        )}

        {/* Visualizer Button */}
        {currentTrack && (
          <button
            onClick={() => setShowVisualizer(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-sm transition-colors"
          >
            Open Audio Visualizer
          </button>
        )}

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          preload="metadata"
          onVolumeChange={() => setVolume(audioRef.current?.volume || 0.7)}
        />
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

export { RealTimeAudioPlayer }; 