import React, { useState, useEffect } from 'react';
import { Folder, Volume2, HardDrive, Monitor, Settings, Network, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelButton } from './PixelButton';
import { SpotifyNowPlaying } from './SpotifyNowPlaying';
import { SettingsModal } from './SettingsModal';
import { Clock } from './Clock';

interface OpenWindow {
  name: string;
  title: string;
  icon?: string;
}

const SystemTray: React.FC = () => {
  const [volumeLevel, setVolumeLevel] = useState(75);
  const [showSettings, setShowSettings] = useState(false);
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);

  // Listen for window open/close events from Desktop
  useEffect(() => {
    const handleWindowOpen = (event: CustomEvent<OpenWindow>) => {
      setOpenWindows(prev => {
        // Prevent duplicates
        if (prev.some(w => w.name === event.detail.name)) {
          return prev;
        }
        return [...prev, event.detail];
      });
    };

    const handleWindowClose = (event: CustomEvent<{ name: string }>) => {
      setOpenWindows(prev => prev.filter(w => w.name !== event.detail.name));
    };

    const handleWindowFocus = (event: CustomEvent<{ name: string }>) => {
      // Could implement visual indication of focused window
    };

    window.addEventListener('windowOpen' as any, handleWindowOpen);
    window.addEventListener('windowClose' as any, handleWindowClose);
    window.addEventListener('windowFocus' as any, handleWindowFocus);

    return () => {
      window.removeEventListener('windowOpen' as any, handleWindowOpen);
      window.removeEventListener('windowClose' as any, handleWindowClose);
      window.removeEventListener('windowFocus' as any, handleWindowFocus);
    };
  }, []);

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

  const handleTaskbarItemClick = (windowName: string) => {
    // Dispatch event to focus window
    window.dispatchEvent(new CustomEvent('focusWindow', { detail: { name: windowName } }));
  };

  const handleCloseFromTaskbar = (windowName: string) => {
    // Dispatch event to close window
    window.dispatchEvent(new CustomEvent('closeWindowFromTaskbar', { detail: { name: windowName } }));
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

        {/* Separator */}
        <div className="w-px h-8 bg-mac-dark-gray mx-2" />

        {/* Open Applications (Taskbar) */}
        {openWindows.map((window, index) => (
          <div
            key={`${window.name}-${index}`}
            className="h-8 px-2 flex items-center bg-mac-white mac-border-outset hover:bg-mac-light-gray transition-colors min-w-0 max-w-[150px] cursor-pointer"
            onClick={() => handleTaskbarItemClick(window.name)}
            title={window.title}
          >
            {window.icon && (
              <span className="mr-1 text-xs">{window.icon}</span>
            )}
            <span className="text-xs mac-system-font truncate">{window.title}</span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleCloseFromTaskbar(window.name);
              }}
              className="ml-2 text-xs hover:text-red-600 flex-shrink-0 p-0 border-0 bg-transparent cursor-pointer"
              title={`Close ${window.title}`}
            >
              ×
            </span>
          </div>
        ))}
      </div>

      {/* Center spacer */}
      <div className="flex-1" />

      {/* Right side: System controls and clock */}
      <div className="flex items-center space-x-1 h-full">
        {/* Spotify Now Playing */}
        <SpotifyNowPlaying className="mr-2" />
        {/* Volume control */}
        <PixelButton 
          variant="secondary" 
          className="w-8 h-8 p-0 flex items-center justify-center hover:bg-mac-medium-gray transition-colors"
          onClick={handleVolumeClick}
          title={`Volume: ${volumeLevel}%`}
        >
          <Volume2 size={18} className={volumeLevel === 0 ? 'text-mac-dark-gray' : ''} />
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