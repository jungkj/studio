"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Window } from '@/components/Window';
import { EssaysApp } from '@/components/EssaysApp';
import { AboutApp } from '@/components/AboutApp';
import { MyComputerApp } from '@/components/MyComputerApp';
import { GamesLauncherApp } from '@/components/GamesLauncherApp';
import { ChessGame } from '@/components/ChessGame';
import { BreakoutGame } from '@/components/BreakoutGame';
import { ContactApp } from '@/components/ContactApp';
import { WorkApp } from '@/components/WorkApp';
import { MenuBar } from '@/components/MenuBar';
import { SystemTray } from '@/components/SystemTray';
import { DesktopIcon } from '@/components/DesktopIcon';
import { WelcomeWindow } from '@/components/WelcomeWindow';
import { MacLoadingScreen } from '@/components/MacLoadingScreen';
import { Clock } from '@/components/Clock';
import { SettingsModal } from '@/components/SettingsModal';
import { SimpleCalculator } from '@/components/SimpleCalculator';
import { useToast } from '@/components/ui/use-toast';

type WindowName = 'essays' | 'about' | 'myComputer' | 'gamesLauncher' | 'chess' | 'breakout' | 'contact' | 'work' | 'welcome' | 'clock' | 'calculator';

interface WindowState {
  isOpen: boolean;
  zIndex: number;
}

const windowTitles: Record<WindowName, string> = {
  essays: 'My Essays',
  about: 'About Me',
  myComputer: 'My Computer',
  gamesLauncher: 'Games',
  chess: 'Chess',
  breakout: 'Breakout',
  contact: 'Contact Me',
  work: 'My Work',
  welcome: 'Welcome',
  clock: 'Clock',
  calculator: 'Calculator',
};

const windowIcons: Record<WindowName, string> = {
  essays: '📄',
  about: '👤',
  myComputer: '💻',
  gamesLauncher: '🎮',
  chess: '♟️',
  breakout: '🧱',
  contact: '📧',
  work: '📁',
  welcome: '👋',
  clock: '🕐',
  calculator: '🧮',
};

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const [windowStates, setWindowStates] = useState<Record<WindowName, WindowState>>({
    essays: { isOpen: false, zIndex: 10 },
    about: { isOpen: false, zIndex: 11 },
    myComputer: { isOpen: false, zIndex: 12 },
    gamesLauncher: { isOpen: false, zIndex: 13 },
    chess: { isOpen: false, zIndex: 14 },
    breakout: { isOpen: false, zIndex: 15 },
    contact: { isOpen: false, zIndex: 16 },
    work: { isOpen: false, zIndex: 17 },
    welcome: { isOpen: false, zIndex: 18 }, // Start closed until loading completes
    clock: { isOpen: false, zIndex: 19 },
    calculator: { isOpen: false, zIndex: 20 },
  });

  const [maxZIndex, setMaxZIndex] = useState(24);
  const [showSettings, setShowSettings] = useState(false);
  const prevWindowStatesRef = useRef<Record<WindowName, WindowState>>(windowStates);

  // Emit window events when states change
  useEffect(() => {
    const prevStates = prevWindowStatesRef.current;
    
    // Check for newly opened windows
    Object.keys(windowStates).forEach((windowName) => {
      const key = windowName as WindowName;
      if (windowStates[key].isOpen && !prevStates[key].isOpen) {
        window.dispatchEvent(new CustomEvent('windowOpen', {
          detail: {
            name: key,
            title: windowTitles[key],
            icon: windowIcons[key],
          }
        }));
      }
      // Check for closed windows
      else if (!windowStates[key].isOpen && prevStates[key].isOpen) {
        window.dispatchEvent(new CustomEvent('windowClose', {
          detail: { name: key }
        }));
      }
    });
    
    prevWindowStatesRef.current = windowStates;
  }, [windowStates]);

  // Listen for taskbar events
  React.useEffect(() => {
    const handleFocusWindow = (event: Event) => {
      const customEvent = event as CustomEvent<{ name: string }>;
      const windowName = customEvent.detail.name as WindowName;
      setWindowStates(prev => {
        if (!prev[windowName]?.isOpen) return prev;
        
        const currentZIndex = prev[windowName].zIndex;
        if (currentZIndex === maxZIndex) return prev;
        
        const newMaxZIndex = maxZIndex + 1;
        setMaxZIndex(newMaxZIndex);
        
        window.dispatchEvent(new CustomEvent('windowFocus', {
          detail: { name: windowName }
        }));
        
        return {
          ...prev,
          [windowName]: { ...prev[windowName], zIndex: newMaxZIndex },
        };
      });
    };

    const handleCloseFromTaskbar = (event: Event) => {
      const customEvent = event as CustomEvent<{ name: string }>;
      const windowName = customEvent.detail.name as WindowName;
      setWindowStates(prev => {
        if (!prev[windowName]?.isOpen) return prev;
        
        window.dispatchEvent(new CustomEvent('windowClose', {
          detail: { name: windowName }
        }));
        
        return {
          ...prev,
          [windowName]: { ...prev[windowName], isOpen: false },
        };
      });
    };

    window.addEventListener('focusWindow', handleFocusWindow);
    window.addEventListener('closeWindowFromTaskbar', handleCloseFromTaskbar);

    return () => {
      window.removeEventListener('focusWindow', handleFocusWindow);
      window.removeEventListener('closeWindowFromTaskbar', handleCloseFromTaskbar);
    };
  }, [maxZIndex]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    // Open welcome window after loading
    const newMaxZIndex = maxZIndex + 1;
    setWindowStates(prev => ({
      ...prev,
      welcome: { isOpen: true, zIndex: newMaxZIndex }
    }));
    setMaxZIndex(newMaxZIndex);
    
    // Emit window open event for welcome window
    window.dispatchEvent(new CustomEvent('windowOpen', {
      detail: {
        name: 'welcome',
        title: 'Welcome',
      }
    }));
  };


  const openWindow = (windowName: WindowName) => {
    setWindowStates(prev => {
      // If window is already open, just focus it
      if (prev[windowName].isOpen) {
        return prev;
      }
      
      const newMaxZIndex = maxZIndex + 1;
      setMaxZIndex(newMaxZIndex);
      
      return {
        ...prev,
        [windowName]: { isOpen: true, zIndex: newMaxZIndex },
      };
    });
    
    // If window was already open, focus it
    if (windowStates[windowName].isOpen) {
      focusWindow(windowName);
    }
  };

  const closeWindow = (windowName: WindowName) => {
    setWindowStates(prev => ({
      ...prev,
      [windowName]: { ...prev[windowName], isOpen: false },
    }));
  };

  const focusWindow = (windowName: WindowName) => {
    setWindowStates(prev => {
      const currentZIndex = prev[windowName].zIndex;
      if (currentZIndex === maxZIndex) {
        return prev;
      }
      const newMaxZIndex = maxZIndex + 1;
      setMaxZIndex(newMaxZIndex);
      
      // Emit window focus event for taskbar
      window.dispatchEvent(new CustomEvent('windowFocus', {
        detail: { name: windowName }
      }));
      
      return {
        ...prev,
        [windowName]: { ...prev[windowName], zIndex: newMaxZIndex },
      };
    });
  };



  const iconBaseUrl = "/icons";
  const desktopIcons = [
    { name: 'work', label: 'My Work', icon: 'Be-Os-Be-Box-Be-Folder.32.png', fallback: 'folder' as const },
    { name: 'essays', label: 'My Essays', icon: 'Be-Os-Be-Box-Be-Card-Stack.32.png', fallback: 'document' as const },
    { name: 'gamesLauncher', label: 'Games', icon: 'Be-Os-Be-Box-Be-Play.32.png', fallback: 'game' as const },
    { name: 'contact', label: 'Contact', icon: 'Be-Os-Be-Box-Be-Mail-2.32.png', fallback: 'mail' as const },
    { name: 'about', label: 'About Me', icon: 'Be-Os-Be-Box-Be-Sound.32.png', fallback: 'user' as const },
  ];

  // Show loading screen first
  if (isLoading) {
    return <MacLoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <div className="w-screen h-screen mac-desktop-bg flex flex-col relative overflow-hidden">
      <MenuBar 
        onOpenAbout={() => openWindow('about')}
        onOpenCalculator={() => openWindow('calculator')}
        onOpenFinder={() => {}}
        onOpenClock={() => openWindow('clock')}
        onOpenSettings={() => setShowSettings(true)}
        onRestart={() => {
          if (window.confirm('Are you sure you want to restart? This will reload the page.')) {
            window.location.reload();
          }
        }}
        onShutdown={() => {
          if (window.confirm('Are you sure you want to shut down? This will close the application.')) {
            window.close();
          }
        }}
      />

      <div className="flex-grow relative">
        {/* Desktop Icons */}
        <div className="absolute top-4 left-4 grid grid-cols-2 gap-4">
          {desktopIcons.map(icon => (
            <DesktopIcon
              key={icon.name}
              iconSrc={`${iconBaseUrl}/${icon.icon}`}
              label={icon.label}
              onClick={() => openWindow(icon.name as WindowName)}
              fallbackIcon={icon.fallback}
            />
          ))}

        </div>

        {/* Active Windows */}
        {windowStates.welcome.isOpen && (
          <Window 
            title="Welcome" 
            onClose={() => closeWindow('welcome')} 
            initialPosition={{ x: 300, y: 200 }} 
            initialSize={{ width: 480, height: 400 }}
            zIndex={windowStates.welcome.zIndex} 
            onFocus={() => focusWindow('welcome')}
          >
            <WelcomeWindow onClose={() => closeWindow('welcome')} />
          </Window>
        )}
        {windowStates.essays.isOpen && (
          <Window 
            title="My Essays" 
            onClose={() => closeWindow('essays')} 
            initialPosition={{ x: 100, y: 80 }} 
            initialSize={{ width: 800, height: 600 }}
            zIndex={windowStates.essays.zIndex} 
            onFocus={() => focusWindow('essays')}
          >
            <EssaysApp onClose={() => closeWindow('essays')} />
          </Window>
        )}
        {windowStates.about.isOpen && (
          <Window 
            title="About Me" 
            onClose={() => closeWindow('about')} 
            initialPosition={{ x: 150, y: 120 }} 
            initialSize={{ width: 650, height: 500 }}
            zIndex={windowStates.about.zIndex} 
            onFocus={() => focusWindow('about')}
          >
            <AboutApp onClose={() => closeWindow('about')} />
          </Window>
        )}
        {windowStates.myComputer.isOpen && (
          <Window 
            title="My Computer" 
            onClose={() => closeWindow('myComputer')} 
            initialPosition={{ x: 200, y: 150 }} 
            initialSize={{ width: 600, height: 450 }}
            zIndex={windowStates.myComputer.zIndex} 
            onFocus={() => focusWindow('myComputer')}
          >
            <MyComputerApp onClose={() => closeWindow('myComputer')} />
          </Window>
        )}
        {windowStates.gamesLauncher.isOpen && (
          <Window 
            title="Games" 
            onClose={() => closeWindow('gamesLauncher')} 
            initialPosition={{ x: 250, y: 180 }} 
            initialSize={{ width: 500, height: 400 }}
            zIndex={windowStates.gamesLauncher.zIndex} 
            onFocus={() => focusWindow('gamesLauncher')}
          >
            <GamesLauncherApp onClose={() => closeWindow('gamesLauncher')} onLaunchGame={(gameName) => openWindow(gameName)} />
          </Window>
        )}
        {windowStates.chess.isOpen && (
          <Window 
            title="Chess" 
            onClose={() => closeWindow('chess')} 
            initialPosition={{ x: 250, y: 100 }} 
            initialSize={{ width: 800, height: 650 }}
            zIndex={windowStates.chess.zIndex} 
            onFocus={() => focusWindow('chess')}
          >
            <ChessGame onClose={() => closeWindow('chess')} />
          </Window>
        )}
        {windowStates.breakout.isOpen && (
          <Window 
            title="Breakout" 
            onClose={() => closeWindow('breakout')} 
            initialPosition={{ x: 200, y: 50 }} 
            initialSize={{ width: 900, height: 720 }}
            zIndex={windowStates.breakout.zIndex} 
            onFocus={() => focusWindow('breakout')}
          >
            <BreakoutGame onClose={() => closeWindow('breakout')} />
          </Window>
        )}
        {windowStates.contact.isOpen && (
          <Window 
            title="Contact Me" 
            onClose={() => closeWindow('contact')} 
            initialPosition={{ x: 180, y: 130 }} 
            initialSize={{ width: 600, height: 450 }}
            zIndex={windowStates.contact.zIndex} 
            onFocus={() => focusWindow('contact')}
          >
            <ContactApp onClose={() => closeWindow('contact')} />
          </Window>
        )}
        {windowStates.work.isOpen && (
          <Window 
            title="My Work" 
            onClose={() => closeWindow('work')} 
            initialPosition={{ x: 120, y: 100 }} 
            initialSize={{ width: 750, height: 600 }}
            zIndex={windowStates.work.zIndex} 
            onFocus={() => focusWindow('work')}
          >
            <WorkApp onClose={() => closeWindow('work')} />
          </Window>
        )}
        {windowStates.clock.isOpen && (
          <Window 
            title="Clock" 
            onClose={() => closeWindow('clock')} 
            initialPosition={{ x: 400, y: 200 }} 
            initialSize={{ width: 300, height: 200 }}
            zIndex={windowStates.clock.zIndex} 
            onFocus={() => focusWindow('clock')}
          >
            <div className="p-4 bg-mac-light-gray h-full flex items-center justify-center">
              <Clock />
            </div>
          </Window>
        )}
        {windowStates.calculator.isOpen && (
          <Window 
            title="Calculator" 
            onClose={() => closeWindow('calculator')} 
            initialPosition={{ x: 350, y: 150 }} 
            initialSize={{ width: 280, height: 400 }}
            zIndex={windowStates.calculator.zIndex} 
            onFocus={() => focusWindow('calculator')}
          >
            <SimpleCalculator onClose={() => closeWindow('calculator')} />
          </Window>
        )}
      </div>

      <SystemTray />
      
      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};

export default Index;