import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { SpotifyCurrentlyPlaying } from '@/utils/spotifyService';
import { Window } from './Window';

interface AudioVisualizerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: SpotifyCurrentlyPlaying | null;
  currentProgress: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isOpen, onClose, currentTrack, currentProgress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Generate frequency data that responds to song progress
  const generateLiveFrequencyData = () => {
    const bars = 128;
    const data = new Array(bars);
    const time = Date.now() * 0.002;
    
    // Use song progress to create different patterns throughout the song
    const songProgress = currentTrack?.item?.duration_ms 
      ? currentProgress / currentTrack.item.duration_ms 
      : 0;

    // Create different "sections" of the song with varying intensity
    const songSection = Math.floor(songProgress * 8); // Divide song into 8 sections
    const sectionProgress = (songProgress * 8) % 1; // Progress within current section
    
    for (let i = 0; i < bars; i++) {
      const freq = i / bars;
      
      // Base frequency response curve (more realistic)
      const bassBoost = i < bars * 0.15 ? 1.8 : 1.0;
      const midBoost = i > bars * 0.15 && i < bars * 0.6 ? 1.3 : 1.0;
      const highCut = i > bars * 0.75 ? 0.6 : 1.0;
      
      // Create waves that change based on song progress
      const progressPhase = songProgress * Math.PI * 4; // Multiple cycles through song
      const sectionIntensity = Math.sin(sectionProgress * Math.PI) * 0.5 + 0.5; // Fade in/out within sections
      
      // Different wave patterns for different parts of the song
      let wave1, wave2, wave3;
      
      switch (songSection % 4) {
        case 0: // Intro/verse - more subtle
          wave1 = Math.sin(time * 1.2 + freq * 6 + progressPhase * 0.5) * 0.3;
          wave2 = Math.sin(time * 2.0 + freq * 10 + progressPhase) * 0.2;
          wave3 = Math.sin(time * 0.7 + freq * 4) * 0.15;
          break;
        case 1: // Build-up - increasing energy
          wave1 = Math.sin(time * 1.8 + freq * 8 + progressPhase) * (0.4 + sectionProgress * 0.3);
          wave2 = Math.sin(time * 2.5 + freq * 12 + progressPhase * 1.5) * 0.3;
          wave3 = Math.sin(time * 1.0 + freq * 6) * 0.2;
          break;
        case 2: // Chorus/drop - high energy
          wave1 = Math.sin(time * 2.2 + freq * 10 + progressPhase * 2) * 0.6;
          wave2 = Math.sin(time * 3.1 + freq * 15 + progressPhase * 1.8) * 0.4;
          wave3 = Math.sin(time * 1.4 + freq * 8 + progressPhase) * 0.3;
          break;
        case 3: // Bridge/breakdown - different pattern
          wave1 = Math.sin(time * 1.0 + freq * 5 + progressPhase * 0.8) * 0.4;
          wave2 = Math.cos(time * 2.8 + freq * 11) * 0.3;
          wave3 = Math.sin(time * 1.6 + freq * 7 + progressPhase * 1.2) * 0.25;
          break;
        default:
          wave1 = wave2 = wave3 = 0;
      }
      
      // Add some controlled randomness
      const noise = (Math.random() - 0.5) * 0.08 * sectionIntensity;
      
      // Combine all elements
      let amplitude = (wave1 + wave2 + wave3 + noise) * bassBoost * midBoost * highCut * sectionIntensity;
      amplitude = (amplitude + 1) * 0.5; // Normalize to 0-1
      amplitude = Math.max(0.02, Math.min(0.98, amplitude));
      
      // Add subtle beat-like pulses based on song position
      const beatPhase = songProgress * 120; // Assume ~120 BPM
      const beatPulse = Math.sin(beatPhase * Math.PI * 2) * 0.1 + 1;
      amplitude *= beatPulse;
      
      data[i] = amplitude;
    }
    
    return data;
  };

  // Enhanced color mapping that responds to song progress
  const getLiveFrequencyColor = (frequency: number, amplitude: number) => {
    const songProgress = currentTrack?.item?.duration_ms 
      ? currentProgress / currentTrack.item.duration_ms 
      : 0;

    // Base hue shifts throughout the song
    const progressHueShift = songProgress * 60; // Shift through color spectrum
    const baseHue = 240 - (frequency * 120) + progressHueShift; // Blue to green + progress shift
    
    // Saturation varies with amplitude and song progress
    const saturation = 85 + (amplitude * 15) + (songProgress * 10);
    
    // Lightness responds to amplitude more dramatically
    const lightness = 35 + (amplitude * 45) + (Math.sin(songProgress * Math.PI * 2) * 5);
    
    return `hsl(${baseHue % 360}, ${Math.min(100, saturation)}%, ${Math.min(85, lightness)}%)`;
  };

  const drawLiveVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const frequencyData = generateLiveFrequencyData();
    const barCount = frequencyData.length;
    const barWidth = width / barCount;

    // Clear with black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Draw frequency bars
    frequencyData.forEach((amplitude, index) => {
      const frequency = index / barCount;
      const barHeight = amplitude * height * 0.9;
      const x = index * barWidth;
      const y = height - barHeight;

      // Get color based on frequency and current song progress
      const color = getLiveFrequencyColor(frequency, amplitude);
      
      ctx.fillStyle = color;
      ctx.fillRect(x, y, Math.max(1, barWidth - 0.5), barHeight);
      
      // Add subtle glow effect for high amplitudes
      if (amplitude > 0.7) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 2;
        ctx.fillRect(x, y, Math.max(1, barWidth - 0.5), barHeight);
        ctx.shadowBlur = 0;
      }
    });

    // Continue animation if playing
    if (currentTrack?.is_playing) {
      animationRef.current = requestAnimationFrame(drawLiveVisualizer);
    }
  };

  useEffect(() => {
    if (isOpen && currentTrack?.is_playing) {
      drawLiveVisualizer();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen, currentTrack?.is_playing, currentProgress]);

  // Calculate song progress for display
  const progressPercentage = currentTrack?.item?.duration_ms 
    ? (currentProgress / currentTrack.item.duration_ms) * 100
    : 0;

  // Window icon
  const windowIcon = <div className="w-2 h-2 bg-white rounded"></div>;

  return (
    <Window
      title="CD Player - Spectrum Analyzer"
      isOpen={isOpen}
      onClose={onClose}
      icon={windowIcon}
      defaultWidth={600}
      defaultHeight={400}
      minWidth={400}
      minHeight={300}
    >
      {/* Track Info with Progress */}
      <div className="px-4 py-2 bg-mac-light-gray border-b border-mac-dark-gray">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-sm mac-system-font text-mac-black font-bold truncate">
              {currentTrack?.item?.name || 'Unknown Track'}
            </div>
            <div className="text-xs mac-system-font text-mac-dark-gray truncate">
              {currentTrack?.item?.artists?.[0]?.name || 'Unknown Artist'}
            </div>
          </div>
          <div className="text-xs text-mac-dark-gray">
            {Math.round(progressPercentage)}% complete
          </div>
        </div>
        
        {/* Progress bar in visualizer */}
        <div className="mt-2 w-full h-2 bg-mac-dark-gray mac-border-inset relative overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-100 ease-linear"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Visualizer Canvas */}
      <div className="relative bg-black flex-1 m-3 mac-border-inset">
        <canvas
          ref={canvasRef}
          width={570}
          height={250}
          className="w-full h-full"
        />
        
        {!currentTrack?.is_playing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-green-400 mac-system-font text-sm bg-black bg-opacity-75 px-3 py-1 rounded">
              {currentTrack ? 'Music Paused' : 'No Track Playing'}
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="h-8 bg-mac-medium-gray mac-border-inset flex items-center justify-between px-4 text-xs mac-system-font text-mac-black">
        <div className="flex items-center space-x-6">
          <span>Spectrum Analyzer</span>
          <span>128 bands</span>
          <span>Progress-Reactive</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={cn(
            "w-3 h-3 rounded-full border border-mac-dark-gray",
            currentTrack?.is_playing ? "bg-green-400 animate-pulse" : "bg-red-400"
          )}></div>
          <span className="font-bold">{currentTrack?.is_playing ? 'PLAYING' : 'STOPPED'}</span>
          {currentTrack?.is_playing && (
            <button
              onClick={onClose}
              className="ml-4 px-2 py-1 bg-mac-light-gray mac-border-outset hover:bg-mac-medium-gray text-xs"
            >
              Close Visualizer
            </button>
          )}
        </div>
      </div>
    </Window>
  );
};

export { AudioVisualizer }; 