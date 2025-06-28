import React, { useState } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Window } from '@/components/Window';
import { BlogApp } from '@/components/BlogApp';
import { AboutApp } from '@/components/AboutApp';
import { DesktopDock } from '@/components/DesktopDock'; // Import the new component

type ActiveWindow = 'blog' | 'about' | null;

const Index = () => {
  const [activeWindows, setActiveWindows] = useState<Record<ActiveWindow, boolean>>({
    blog: false,
    about: false,
  });

  const openWindow = (windowName: ActiveWindow) => {
    if (windowName) {
      setActiveWindows(prev => ({ ...prev, [windowName]: true }));
    }
  };

  const closeWindow = (windowName: ActiveWindow) => {
    if (windowName) {
      setActiveWindows(prev => ({ ...prev, [windowName]: false }));
    }
  };

  return (
    <div className="min-h-screen w-full bg-emerald-dark-green flex flex-col items-start justify-start p-4 relative overflow-hidden">
      {/* Active Windows */}
      {activeWindows.blog && (
        <Window title="Blog" onClose={() => closeWindow('blog')} initialPosition={{ x: 50, y: 50 }} className="z-10">
          <BlogApp onClose={() => closeWindow('blog')} />
        </Window>
      )}
      {activeWindows.about && (
        <Window title="About Me" onClose={() => closeWindow('about')} initialPosition={{ x: 150, y: 100 }} className="z-20">
          <AboutApp onClose={() => closeWindow('about')} />
        </Window>
      )}

      {/* Desktop Dock */}
      <DesktopDock onOpenWindow={openWindow} />

      <div className="absolute bottom-20 right-4"> {/* Adjusted position to avoid dock */}
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;