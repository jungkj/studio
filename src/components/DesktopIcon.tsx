import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { SimplePixelIcon } from './SimplePixelIcon';

interface DesktopIconProps {
  iconSrc: string;
  label: string;
  onClick: () => void;
  className?: string;
  fallbackIcon?: 'computer' | 'folder' | 'document' | 'game' | 'terminal' | 'mail' | 'user';
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ iconSrc, label, onClick, className, fallbackIcon = 'folder' }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div 
      className={cn(
        "flex flex-col items-center cursor-pointer select-none group w-16 sm:w-20",
        className
      )}
      onClick={onClick}
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mac-border-outset bg-mac-light-gray p-2 mb-2 group-hover:bg-mac-medium-gray interactive">
        {!imageError && iconSrc ? (
          <img 
            src={iconSrc} 
            alt={label}
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
            style={{ imageRendering: 'pixelated' }}
            onError={() => setImageError(true)}
          />
        ) : (
          <SimplePixelIcon type={fallbackIcon} size={48} />
        )}
      </div>
      <span 
        className={cn(
          "text-responsive-sm mac-system-font text-mac-black text-center leading-tight",
          "max-w-full text-container break-words px-1 py-0.5",
          "group-hover:bg-mac-white/80 rounded-sm interactive",
          "block w-full"
        )}
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          hyphens: 'auto'
        }}
      >
        {label}
      </span>
    </div>
  );
};

export { DesktopIcon };