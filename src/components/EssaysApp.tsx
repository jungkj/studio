import React from 'react';
import { PixelButton } from './PixelButton';

interface EssaysAppProps {
  onClose: () => void;
}

const EssaysApp: React.FC<EssaysAppProps> = ({ onClose }) => {
  return (
    <div className="p-1 font-sans text-mac-black"> {/* Adjusted padding */}
      <h2 className="text-base mb-2">My Essays</h2> {/* Adjusted font size, removed bold */}
      <div className="space-y-2"> {/* Adjusted space-y */}
        <div className="mac-border-inset p-2 bg-mac-light-gray"> {/* Adjusted padding */}
          <h3 className="text-sm mb-0.5">First Essay Title</h3> {/* Adjusted font size, removed bold */}
          <p className="text-xs">This is the content of my very first essay. It's a thoughtful piece, just like a good retro game review!</p> {/* Adjusted font size */}
          <p className="text-[0.65rem] text-mac-dark-gray mt-1">Date: 2024-07-26</p> {/* Smaller font size, adjusted margin */}
        </div>
        <div className="mac-border-inset p-2 bg-mac-light-gray"> {/* Adjusted padding */}
          <h3 className="text-sm mb-0.5">Another Thought Piece</h3> {/* Adjusted font size, removed bold */}
          <p className="text-xs">Here's another entry, perhaps about my latest coding philosophy or a new perspective on classic software.</p> {/* Adjusted font size */}
          <p className="text-[0.65rem] text-mac-dark-gray mt-1">Date: 2024-07-20</p> {/* Smaller font size, adjusted margin */}
        </div>
      </div>
      <div className="mt-4 text-right"> {/* Adjusted margin-top */}
        <PixelButton onClick={onClose} variant="default">Close Essays</PixelButton>
      </div>
    </div>
  );
};

export { EssaysApp };