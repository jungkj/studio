import React from 'react';

interface SimplePixelIconProps {
  type: 'computer' | 'folder' | 'document' | 'game' | 'terminal' | 'mail' | 'user';
  size?: number;
  className?: string;
}

const SimplePixelIcon: React.FC<SimplePixelIconProps> = ({ type, size = 32, className = '' }) => {
  const getIconPath = () => {
    switch (type) {
      case 'computer':
        return (
          <g>
            <rect x="6" y="8" width="20" height="12" fill="#E0E0E0" stroke="#000" strokeWidth="1"/>
            <rect x="8" y="10" width="16" height="8" fill="#000"/>
            <rect x="12" y="20" width="8" height="4" fill="#E0E0E0" stroke="#000" strokeWidth="1"/>
            <rect x="8" y="24" width="16" height="2" fill="#E0E0E0" stroke="#000" strokeWidth="1"/>
          </g>
        );
      case 'folder':
        return (
          <g>
            <rect x="4" y="12" width="24" height="12" fill="#E0E0E0" stroke="#000" strokeWidth="1"/>
            <rect x="4" y="8" width="12" height="4" fill="#E0E0E0" stroke="#000" strokeWidth="1"/>
            <rect x="6" y="14" width="20" height="8" fill="#BFBFBF"/>
          </g>
        );
      case 'document':
        return (
          <g>
            <rect x="8" y="6" width="16" height="20" fill="#FFFFFF" stroke="#000" strokeWidth="1"/>
            <rect x="20" y="6" width="4" height="4" fill="#E0E0E0" stroke="#000" strokeWidth="1"/>
            <line x1="12" y1="12" x2="20" y2="12" stroke="#000" strokeWidth="1"/>
            <line x1="12" y1="16" x2="20" y2="16" stroke="#000" strokeWidth="1"/>
            <line x1="12" y1="20" x2="18" y2="20" stroke="#000" strokeWidth="1"/>
          </g>
        );
      case 'game':
        return (
          <g>
            <rect x="6" y="10" width="20" height="12" fill="#E0E0E0" stroke="#000" strokeWidth="1"/>
            <circle cx="12" cy="16" r="2" fill="#000"/>
            <circle cx="20" cy="16" r="2" fill="#000"/>
            <rect x="14" y="12" width="4" height="2" fill="#000"/>
            <rect x="15" y="11" width="2" height="4" fill="#000"/>
          </g>
        );
      case 'terminal':
        return (
          <g>
            <rect x="4" y="8" width="24" height="16" fill="#000" stroke="#808080" strokeWidth="1"/>
            <text x="8" y="16" fill="#00FF00" fontSize="6" fontFamily="monospace">&gt;</text>
            <rect x="12" y="13" width="1" height="4" fill="#00FF00"/>
          </g>
        );
      case 'mail':
        return (
          <g>
            <rect x="6" y="12" width="20" height="12" fill="#FFFFFF" stroke="#000" strokeWidth="1"/>
            <polygon points="6,12 16,18 26,12" fill="none" stroke="#000" strokeWidth="1"/>
            <line x1="6" y1="24" x2="16" y2="18" stroke="#000" strokeWidth="1"/>
            <line x1="26" y1="24" x2="16" y2="18" stroke="#000" strokeWidth="1"/>
          </g>
        );
      case 'user':
        return (
          <g>
            <circle cx="16" cy="12" r="4" fill="#E0E0E0" stroke="#000" strokeWidth="1"/>
            <path d="M8 24 Q16 20 24 24" fill="#E0E0E0" stroke="#000" strokeWidth="1"/>
          </g>
        );
      default:
        return <rect x="8" y="8" width="16" height="16" fill="#E0E0E0" stroke="#000" strokeWidth="1"/>;
    }
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      className={`${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {getIconPath()}
    </svg>
  );
};

export { SimplePixelIcon }; 