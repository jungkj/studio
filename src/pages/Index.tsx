import React, { useState } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Window } from '@/components/Window';
import { BlogApp } from '@/components/BlogApp';
import { AboutApp } from '@/components/AboutApp';
import { MenuBar } from '@/components/MenuBar'; // Import MenuBar
import { SystemTray } from '@/components/SystemTray'; // Import SystemTray
import { DesktopIcon } from '@/components/DesktopIcon'; // Import DesktopIcon
import { FileText, User, Trash2 } from 'lucide-react'; // Import icons for DesktopIcon

type WindowName = 'blog' | 'about';

interface WindowState {
  isOpen: boolean;
  zIndex: number;
}

const Index = () => {
  const [windowStates, setWindowStates] = useState<Record<WindowName, WindowState>>({
    blog: { isOpen: false, zIndex: 10 },
    about: { isOpen: false, zIndex: 11 },
  });

  const [maxZIndex, setMaxZIndex] = useState(11); // Keep track of the highest z-index

  const openWindow = (windowName: WindowName) => {
    setWindowStates(prev => {
      const newMaxZIndex = maxZIndex + 1;
      setMaxZIndex(newMaxZIndex);
      return {
        ...prev,
        [windowName]: { isOpen: true, zIndex: newMaxZIndex },
      };
    });
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
        return prev; // Already on top
      }
      const newMaxZIndex = maxZIndex + 1;
      setMaxZIndex(newMaxZIndex);
      return {
        ...prev,
        [windowName]: { ...prev[windowName], zIndex: newMaxZIndex },
      };
    });
  };

  return (
    <div className="min-h-screen w-full mac-desktop-bg flex flex-col relative overflow-hidden">
      {/* Menu Bar */}
      <MenuBar />

      {/* Desktop Icons */}
      <div className="p-4 flex flex-col items-start space-y-2">
        <DesktopIcon icon={FileText} label="My Blog" onClick={() => openWindow('blog')} />
        <DesktopIcon icon={User} label="About Me" onClick={() => openWindow('about')} />
      </div>

      {/* Active Windows */}
      {windowStates.blog.isOpen && (
        <Window
          title="My Blog"
          onClose={() => closeWindow('blog')}
          initialPosition={{ x: 50, y: 50 }}
          zIndex={windowStates.blog.zIndex}
          onFocus={() => focusWindow('blog')}
        >
          <BlogApp onClose={() => closeWindow('blog')} />
        </Window>
      )}
      {windowStates.about.isOpen && (
        <Window
          title="About Me"
          onClose={() => closeWindow('about')}
          initialPosition={{ x: 150, y: 100 }}
          zIndex={windowStates.about.zIndex}
          onFocus={() => focusWindow('about')}
        >
          <AboutApp onClose={() => closeWindow('about')} />
        </Window>
      )}

      {/* Made with Dyad */}
      <div className="absolute bottom-10 right-4"> {/* Adjusted position to be above SystemTray */}
        <MadeWithDyad />
      </div>

      {/* System Tray */}
      <SystemTray />
    </div>
  );
};

export default Index;