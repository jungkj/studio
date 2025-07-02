import React, { useState, useEffect } from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import { PixelButton } from './PixelButton';
import { AdminLogin } from './AdminLogin';
import { EssayAdmin } from './EssayAdmin';
import { Essay, essayStorage } from '@/utils/essayStorage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Settings storage
const SETTINGS_KEY = 'retro-mac-settings';

interface AppSettings {
  background: 'default' | 'warm' | 'cool' | 'dark';
  appleAccent: 'classic' | 'shimmer' | 'slide';
  soundEnabled: boolean;
  volume: number;
  showDesktopPattern: boolean;
}

const defaultSettings: AppSettings = {
  background: 'default',
  appleAccent: 'shimmer',
  soundEnabled: true,
  volume: 75,
  showDesktopPattern: true,
};

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [secretClickCount, setSecretClickCount] = useState(0);

  // Load settings on mount
  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    const loadedSettings = saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    setSettings(loadedSettings);
    
    // Apply loaded settings to document
    document.documentElement.setAttribute('data-background', loadedSettings.background);
    document.documentElement.setAttribute('data-apple-accent', loadedSettings.appleAccent);
    document.documentElement.setAttribute('data-show-pattern', loadedSettings.showDesktopPattern.toString());
    document.documentElement.style.setProperty('--app-volume', loadedSettings.volume.toString());
  }, []);

  // Save settings
  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    
    // Apply settings to document
    document.documentElement.setAttribute('data-background', newSettings.background);
    document.documentElement.setAttribute('data-apple-accent', newSettings.appleAccent);
    document.documentElement.setAttribute('data-show-pattern', newSettings.showDesktopPattern.toString());
    document.documentElement.style.setProperty('--app-volume', newSettings.volume.toString());
  };

  // Handle secret admin access
  const handleSecretClick = () => {
    setSecretClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 7) {
        setShowAdminLogin(true);
        return 0;
      }
      return newCount;
    });
  };

  const handleAdminLogin = () => {
    setIsAuthenticated(true);
    setShowAdminLogin(false);
    setIsAdminMode(true);
    setEssays(essayStorage.getAll());
  };

  const handleAdminClose = () => {
    setIsAdminMode(false);
    setIsAuthenticated(false);
    setSecretClickCount(0);
    essayStorage.clearAdminAuth();
  };

  const handleEssaysChange = (updatedEssays: Essay[]) => {
    setEssays(updatedEssays);
  };

  if (!isOpen) return null;

  // Show admin login if requested
  if (showAdminLogin && !isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-mac-light-gray mac-border-outset p-4 w-96 h-64">
          <AdminLogin
            onSuccess={handleAdminLogin}
            onCancel={() => {
              setShowAdminLogin(false);
              setSecretClickCount(0);
            }}
          />
        </div>
      </div>
    );
  }

  // Show admin interface if authenticated and in admin mode
  if (isAdminMode && isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-mac-light-gray mac-border-outset p-4 w-[90vw] h-[80vh] max-w-4xl">
          <EssayAdmin
            essays={essays}
            onEssaysChange={handleEssaysChange}
            onClose={handleAdminClose}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-mac-white mac-border-outset w-80 min-h-[400px]">
        {/* Header */}
        <div className="bg-mac-light-gray mac-border-inset p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SettingsIcon size={16} />
            <span className="text-sm font-bold mac-system-font">Control Panel</span>
          </div>
          <PixelButton
            variant="secondary"
            className="w-5 h-5 p-0 text-xs flex items-center justify-center"
            onClick={onClose}
          >
            <X size={10} />
          </PixelButton>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Background Settings */}
          <div>
            <div className="text-sm font-bold mac-system-font mb-2">Desktop</div>
            <div className="mac-border-inset bg-mac-light-gray p-3 space-y-2">
              <div className="text-xs mac-system-font mb-2">Background:</div>
              <div className="space-y-1">
                {[
                  { value: 'default', label: 'Classic Gray' },
                  { value: 'warm', label: 'Warm Cream' },
                  { value: 'cool', label: 'Cool Blue' },
                  { value: 'dark', label: 'Dark Mode' }
                ].map((bg) => (
                  <label key={bg.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="background"
                      value={bg.value}
                      checked={settings.background === bg.value}
                      onChange={(e) => saveSettings({ ...settings, background: e.target.value as AppSettings['background'] })}
                      className="w-3 h-3"
                    />
                    <span className="text-xs mac-system-font">{bg.label}</span>
                  </label>
                ))}
              </div>
              
              <div className="mt-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showDesktopPattern}
                    onChange={(e) => saveSettings({ ...settings, showDesktopPattern: e.target.checked })}
                    className="w-3 h-3"
                  />
                  <span className="text-xs mac-system-font">Show desktop pattern</span>
                </label>
              </div>
            </div>
          </div>

          {/* Apple Accent Animation */}
          <div>
            <div className="text-sm font-bold mac-system-font mb-2">Menu Accent</div>
            <div className="mac-border-inset bg-mac-light-gray p-3 space-y-2">
              <div className="text-xs mac-system-font mb-2">Animation:</div>
              <div className="space-y-1">
                {[
                  { value: 'classic', label: 'Classic Rainbow' },
                  { value: 'shimmer', label: 'Shimmer Effect' },
                  { value: 'slide', label: 'Sliding Colors' }
                ].map((accent) => (
                  <label key={accent.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="appleAccent"
                      value={accent.value}
                      checked={settings.appleAccent === accent.value}
                      onChange={(e) => saveSettings({ ...settings, appleAccent: e.target.value as AppSettings['appleAccent'] })}
                      className="w-3 h-3"
                    />
                    <span className="text-xs mac-system-font">{accent.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Sound Settings */}
          <div>
            <div className="text-sm font-bold mac-system-font mb-2">Sound</div>
            <div className="mac-border-inset bg-mac-light-gray p-3 space-y-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => saveSettings({ ...settings, soundEnabled: e.target.checked })}
                  className="w-3 h-3"
                />
                <span className="text-xs mac-system-font">System sounds</span>
              </label>
              
              <div>
                <div className="text-xs mac-system-font mb-1">Volume: {settings.volume}%</div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.volume}
                  onChange={(e) => saveSettings({ ...settings, volume: parseInt(e.target.value) })}
                  className="w-full h-2 bg-mac-medium-gray appearance-none"
                  disabled={!settings.soundEnabled}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer with secret access */}
        <div className="bg-mac-light-gray mac-border-inset p-2 flex justify-between items-center">
          <div className="text-xs text-mac-dark-gray mac-system-font">
            System 7.5.3
          </div>
          <button
            onClick={handleSecretClick}
            className="w-2 h-2 bg-mac-medium-gray hover:bg-mac-dark-gray transition-colors"
            title={secretClickCount > 0 ? `${7 - secretClickCount} more` : ''}
          >
          </button>
        </div>
      </div>
    </div>
  );
};

export { SettingsModal }; 