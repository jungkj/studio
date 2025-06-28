import React from 'react';
import { FileText, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelButton } from './PixelButton';

interface DesktopDockProps {
  onOpenWindow: (windowName: 'blog' | 'about') => void;
}

const DesktopDock: React.FC<DesktopDockProps> = ({ onOpenWindow }) => {
  return (
    <div className={cn(
      "absolute bottom-0 left-0 right-0",
      "w-full h-16 bg-emerald-dark-blue pixel-border-inset border-emerald-border",
      "flex items-center justify-center px-4 space-x-4"
    )}>
      <PixelButton
        onClick={() => onOpenWindow('blog')}
        className="flex flex-col items-center justify-center w-14 h-14 p-1"
        variant="secondary"
      >
        <FileText className="text-emerald-black" size={20} />
        <span className="text-emerald-black font-pixel text-xs mt-1">Blog</span>
      </PixelButton>
      <PixelButton
        onClick={() => onOpenWindow('about')}
        className="flex flex-col items-center justify-center w-14 h-14 p-1"
        variant="secondary"
      >
        <User className="text-emerald-black" size={20} />
        <span className="text-emerald-black font-pixel text-xs mt-1">About</span>
      </PixelButton>
    </div>
  );
};

export { DesktopDock };