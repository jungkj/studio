import React, { useState } from 'react';
import { Folder, Volume2, HardDrive, Monitor, Settings, Network, Printer, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelButton } from './PixelButton';
import { SpotifyDisplay } from './SpotifyDisplay';
import { SettingsModal } from './SettingsModal';
import { useSpotify } from '@/hooks/useSpotify';
import { Clock } from './Clock';
import { logSpotifyConfig } from '@/utils/environment';
import { SpotifyCurrentlyPlaying } from '@/utils/spotifyService';

const SystemTray: React.FC = () => {
  const [volumeLevel, setVolumeLevel] = useState(75);
  const [showSettings, setShowSettings] = useState(false);
  const {
    currentTrack,
    lastPlayedTrack,
    isLoading,
    error,
    login: spotifyLogin,
    logout: spotifyLogout,
    // Browser audio state
    isPlaying: audioBrowserPlaying,
    currentTime,
    duration,
    playPreview,
  } = useSpotify();

  const handleVolumeClick = () => {
    const newLevel = volumeLevel > 0 ? 0 : 75;
    setVolumeLevel(newLevel);
  };

  const handleFolderClick = () => {
    // Could open a file browser in the future
    console.log('Folder clicked');
  };

  const handleHardDriveClick = () => {
    // Could show disk usage
    console.log('Hard drive clicked');
  };

  const handleMonitorClick = () => {
    // Could show display settings
    console.log('Monitor clicked');
  };

  const handleNetworkClick = () => {
    // Could show network status
    console.log('Network clicked');
  };

  const handlePrinterClick = () => {
    // Could show printer queue
    console.log('Printer clicked');
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleSpotifyClick = () => {
    if (currentTrack) {
      // Show context menu or additional actions
      console.log('Current track:', currentTrack.item?.name);
    } else {
      // Log current configuration for debugging
      logSpotifyConfig();
      console.log('Connecting to Spotify...');
      spotifyLogin();
    }
  };

  const handlePlayPreview = (trackData: SpotifyCurrentlyPlaying) => {
    if (trackData.item) {
      playPreview(trackData.item);
    }
  };

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0",
      "w-full h-12 bg-mac-light-gray mac-border-outset",
      "flex items-center justify-between px-3 text-mac-black text-sm font-sans",
      "select-none shadow-lg"
    )}>
      {/* Left side: System icons */}
      <div className="flex items-center space-x-1 h-full">
        <PixelButton 
          variant="secondary" 
          className="w-8 h-8 p-0 flex items-center justify-center hover:bg-mac-medium-gray transition-colors" 
          onClick={handleFolderClick}
          title="File Manager"
        >
          <Folder size={18} />
        </PixelButton>
        <PixelButton 
          variant="secondary" 
          className="w-8 h-8 p-0 flex items-center justify-center hover:bg-mac-medium-gray transition-colors"
          onClick={handleHardDriveClick}
          title="Disk Usage"
        >
          <HardDrive size={18} />
        </PixelButton>
        <PixelButton 
          variant="secondary" 
          className="w-8 h-8 p-0 flex items-center justify-center hover:bg-mac-medium-gray transition-colors"
          onClick={handleMonitorClick}
          title="Display Settings"
        >
          <Monitor size={18} />
        </PixelButton>
        <PixelButton 
          variant="secondary" 
          className="w-8 h-8 p-0 flex items-center justify-center hover:bg-mac-medium-gray transition-colors"
          onClick={handleNetworkClick}
          title="Network Status"
        >
          <Network size={18} />
        </PixelButton>
        <PixelButton 
          variant="secondary" 
          className="w-8 h-8 p-0 flex items-center justify-center hover:bg-mac-medium-gray transition-colors"
          onClick={handlePrinterClick}
          title="Printer Queue"
        >
          <Printer size={18} />
        </PixelButton>
      </div>

      {/* Center: Spotify Display */}
      <div className="flex-1 flex items-center justify-center px-3 min-w-0">
        <div className="flex items-center space-x-2 max-w-md w-full">
          <PixelButton
            variant="secondary"
            className={cn(
              "w-8 h-8 p-0 flex items-center justify-center hover:bg-mac-medium-gray transition-colors flex-shrink-0",
              currentTrack && "bg-green-100 hover:bg-green-200"
            )}
            onClick={handleSpotifyClick}
            title={
              currentTrack 
                ? "Toggle Spotify demo mode" 
                : "Connect to Spotify"
            }
          >
            <Music size={18} className={currentTrack ? "text-green-600" : ""} />
          </PixelButton>
          
          <div className="flex-1 min-w-0">
            <SpotifyDisplay
              currentTrack={currentTrack}
              cachedTrack={lastPlayedTrack}
              isLoading={isLoading}
              error={error}
              demoMode={false}
              onPlayCached={() => {}}
              className="w-full"
              // Browser audio state
              isPlaying={audioBrowserPlaying}
              currentTime={currentTime}
              duration={duration}
              onPlayPreview={handlePlayPreview}
            />
          </div>
        </div>
      </div>

      {/* Right side: System controls and clock */}
      <div className="flex items-center space-x-1 h-full">
        {/* Volume control */}
        <PixelButton 
          variant="secondary" 
          className={cn(
            "w-8 h-8 p-0 flex items-center justify-center hover:bg-mac-medium-gray transition-colors",
            !currentTrack && "bg-mac-dark-gray text-mac-white"
          )}
          onClick={handleVolumeClick}
          title={`Volume: ${currentTrack ? "Playing" : "Muted"}`}
        >
          <Volume2 size={18} />
        </PixelButton>

        {/* Settings */}
        <PixelButton 
          variant="secondary" 
          className="w-8 h-8 p-0 flex items-center justify-center hover:bg-mac-medium-gray transition-colors"
          onClick={handleSettingsClick}
          title="System Preferences"
        >
          <Settings size={18} />
        </PixelButton>

        {/* Live Clock with Pomodoro */}
        <div className="ml-2">
          <Clock />
        </div>
      </div>
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
};

export { SystemTray };