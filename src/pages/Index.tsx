import React, { useState } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Window } from '@/components/Window';
import { BlogApp } from '@/components/BlogApp';
import { AboutApp } from '@/components/AboutApp';
import { DesktopDock } from '@/components/DesktopDock';

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
    <div className="min-h-screen w-full bg-emerald-dark-green flex flex-col items-start justify-start p-4 relative overflow-hidden">
      {/* Active Windows */}
      {windowStates.blog.isOpen && (
        <Window
          title="Blog"
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

      {/* Desktop Dock */}
      <DesktopDock onOpenWindow={openWindow} />

      <div className="absolute bottom-20 right-4">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;