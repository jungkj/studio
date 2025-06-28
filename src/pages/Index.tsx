import React, { useState } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Window } from '@/components/Window';
import { BlogApp } from '@/components/BlogApp';
import { AboutApp } from '@/components/AboutApp';
import { FileText, User } from 'lucide-react';
import { PixelButton } from '@/components/PixelButton';

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
      {/* Desktop Icons */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col items-center cursor-pointer" onClick={() => openWindow('blog')}>
          <div className="w-12 h-12 bg-emerald-light-blue flex items-center justify-center pixel-border border-emerald-border pixel-shadow mb-1">
            <FileText className="text-emerald-white" size={28} />
          </div>
          <span className="text-emerald-white font-pixel text-xs text-shadow-sm">Blog</span>
        </div>
        <div className="flex flex-col items-center cursor-pointer" onClick={() => openWindow('about')}>
          <div className="w-12 h-12 bg-emerald-light-blue flex items-center justify-center pixel-border border-emerald-border pixel-shadow mb-1">
            <User className="text-emerald-white" size={28} />
          </div>
          <span className="text-emerald-white font-pixel text-xs text-shadow-sm">About</span>
        </div>
      </div>

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

      <div className="absolute bottom-4 right-4">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;