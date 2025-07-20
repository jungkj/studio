import React, { useState, useEffect } from 'react';
import { X, Settings as SettingsIcon, Music, Disc, User, FileText, LogOut } from 'lucide-react';
import { PixelButton } from './PixelButton';
import { AdminLogin } from './AdminLogin';
import { EssayAdmin } from './EssayAdmin';
import { Essay, essayStorage } from '@/utils/essayStorage';
import { spotifyService } from '@/utils/spotifyService';
import { spotifyTokenService } from '@/utils/spotifyTokenService';

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
  const [showEssayAdmin, setShowEssayAdmin] = useState(false);
  const [spotifyRefreshToken, setSpotifyRefreshToken] = useState<string | null>(null);

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
    
    // Check for Spotify refresh token
    const token = localStorage.getItem('spotify_refresh_token');
    setSpotifyRefreshToken(token);
  }, []);

  // Listen for Spotify auth success
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'SPOTIFY_AUTH_SUCCESS' && event.data.tokenData) {
        console.log('Spotify auth success received in settings');
        const refreshToken = event.data.tokenData.refresh_token;
        
        if (refreshToken) {
          setSpotifyRefreshToken(refreshToken);
          
          // Store in Supabase if admin
          if (isAuthenticated) {
            const result = await spotifyTokenService.storeRefreshToken(refreshToken);
            if (result.success) {
              console.log('Refresh token stored in Supabase');
            } else {
              console.error('Failed to store refresh token:', result.error);
            }
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isAuthenticated]);

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

  const handleAdminLogin = () => {
    setIsAuthenticated(true);
    setShowAdminLogin(false);
    setIsAdminMode(true);
    setEssays(essayStorage.getAll());
  };

  const handleAdminClose = () => {
    setIsAdminMode(false);
    setIsAuthenticated(false);
    essayStorage.clearAdminAuth();
  };

  const handleEssaysChange = (updatedEssays: Essay[]) => {
    setEssays(updatedEssays);
  };

  if (!isOpen) return null;

  // Show Essay Admin if requested
  if (showEssayAdmin && isAuthenticated) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-mac-light-gray mac-border-outset p-4 w-[90vw] h-[80vh] max-w-4xl">
            <EssayAdmin
              essays={essays}
              onEssaysChange={handleEssaysChange}
              onClose={() => setShowEssayAdmin(false)}
            />
          </div>
        </div>
      </>
    );
  }

  // Show admin login if requested
  if (showAdminLogin && !isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-mac-light-gray mac-border-outset p-4 w-96 h-64">
          <AdminLogin
            onSuccess={handleAdminLogin}
            onCancel={() => {
              setShowAdminLogin(false);
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
        <div className="bg-mac-white mac-border-outset w-[600px] max-h-[80vh] overflow-hidden">
          {/* Admin Header */}
          <div className="bg-mac-light-gray mac-border-inset p-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User size={16} />
              <span className="text-sm font-bold mac-system-font">Admin Panel</span>
            </div>
            <PixelButton
              variant="secondary"
              className="w-5 h-5 p-0 text-xs flex items-center justify-center"
              onClick={handleAdminClose}
            >
              <X size={10} />
            </PixelButton>
          </div>

          {/* Admin Content */}
          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(80vh-100px)]">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold mac-system-font mb-2">Admin Dashboard</h3>
              <p className="text-xs text-mac-dark-gray">Welcome, Administrator</p>
            </div>

            {/* Admin Options */}
            <div className="space-y-3">
              {/* Manage Essays */}
              <div className="mac-border-outset p-3 hover:bg-mac-light-gray transition-colors">
                <button 
                  onClick={() => setShowEssayAdmin(true)}
                  className="w-full text-left flex items-center space-x-3"
                >
                  <FileText size={20} className="text-blue-600" />
                  <div>
                    <h4 className="text-sm font-bold mac-system-font">Manage Essays</h4>
                    <p className="text-xs text-mac-dark-gray">Create, edit, and manage blog posts</p>
                  </div>
                </button>
              </div>

              {/* Spotify Authentication */}
              <div className="mac-border-outset p-3 hover:bg-mac-light-gray transition-colors">
                <button 
                  onClick={async () => {
                    const authUrl = await spotifyService.getAuthUrl();
                    window.open(authUrl, '_blank', 'width=500,height=600');
                  }}
                  className="w-full text-left flex items-center space-x-3"
                >
                  <Music size={20} className="text-green-600" />
                  <div>
                    <h4 className="text-sm font-bold mac-system-font">Connect Spotify</h4>
                    <p className="text-xs text-mac-dark-gray">Authenticate to show "Now Playing" to all visitors</p>
                  </div>
                </button>
              </div>

              {/* Spotify Status */}
              <div className="mac-border-inset bg-mac-light-gray p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Disc size={16} className="text-mac-dark-gray" />
                  <span className="text-xs font-bold mac-system-font">Spotify Status</span>
                </div>
                <div className="text-xs text-mac-dark-gray space-y-1">
                  <p>Account: andyjung2001</p>
                  <p>Token Status: {spotifyRefreshToken ? 'Connected' : 'Not Connected'}</p>
                  <p className="text-[10px] mt-2">When connected, all visitors will see your currently playing or last played track.</p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="pt-4 border-t border-mac-dark-gray">
              <PixelButton
                variant="secondary"
                className="w-full flex items-center justify-center space-x-2"
                onClick={handleAdminClose}
              >
                <LogOut size={14} />
                <span>Logout</span>
              </PixelButton>
            </div>
          </div>
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

          {/* Admin Section */}
          <div className="border-t border-mac-dark-gray pt-4">
            <div className="flex justify-center">
              {!isAuthenticated ? (
                <PixelButton
                  variant="default"
                  className="flex items-center space-x-2"
                  onClick={() => setShowAdminLogin(true)}
                >
                  <User size={14} />
                  <span>Admin Login</span>
                </PixelButton>
              ) : (
                <PixelButton
                  variant="default"
                  className="flex items-center space-x-2"
                  onClick={() => setIsAdminMode(true)}
                >
                  <Settings size={14} />
                  <span>Admin Panel</span>
                </PixelButton>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-mac-light-gray mac-border-inset p-2 flex justify-center items-center">
          <div className="text-xs text-mac-dark-gray mac-system-font">
            System 7.5.3
          </div>
        </div>
      </div>
    </div>
  );
};

export { SettingsModal }; 