import React from 'react';
import { PixelButton } from './PixelButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';

interface WelcomeWindowProps {
  onClose: () => void;
}

const WelcomeWindow: React.FC<WelcomeWindowProps> = ({ onClose }) => {
  return (
    <div className="p-3 mac-system-font text-mac-black flex flex-col h-full bg-mac-light-gray">
      <div className="text-center mb-3">
        <h2 className="text-base font-bold mb-1">Welcome</h2>
        <div className="text-xs text-mac-dark-gray">Andy's Digital Workspace</div>
        <div className="apple-accent mt-2 mx-4"></div>
      </div>
      
      <div className="flex-grow mac-border-inset bg-mac-white p-3 mb-3">
        <div className="text-xs leading-relaxed">
          <div className="mb-3 text-center">
            <div className="text-lg mb-1">👋</div>
            <div className="text-sm font-bold">Hey there!</div>
          </div>
          
          <p className="mb-2">
            I'm Andy Jung, a recent BC grad exploring the intersection of finance, 
            tech, and creativity.
          </p>
          
          <p className="mb-3">
            This retro Mac interface is my digital playground. Click around to 
            explore my work, thoughts, and projects.
          </p>
          
          <div className="text-center text-xs text-mac-dark-gray">
            Double-click desktop icons to get started!
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <PixelButton onClick={onClose} variant="default" className="px-4 text-xs apple-blue-button">
          Enter
        </PixelButton>
      </div>
    </div>
  );
};

export { WelcomeWindow };