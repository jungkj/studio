import React from 'react';
import { PixelButton } from './PixelButton';

interface EssaysAppProps {
  onClose: () => void;
}

const EssaysApp: React.FC<EssaysAppProps> = ({ onClose }) => {
  return (
    <div className="p-2 font-sans text-mac-black">
      <h2 className="text-lg font-bold mb-4">My Essays</h2>
      <div className="space-y-4">
        <div className="mac-border-inset p-3 bg-mac-light-gray">
          <h3 className="font-bold text-md mb-1">First Essay Title</h3>
          <p className="text-sm">This is the content of my very first essay. It's a thoughtful piece, just like a good retro game review!</p>
          <p className="text-xs text-mac-dark-gray mt-2">Date: 2024-07-26</p>
        </div>
        <div className="mac-border-inset p-3 bg-mac-light-gray">
          <h3 className="font-bold text-md mb-1">Another Thought Piece</h3>
          <p className="text-sm">Here's another entry, perhaps about my latest coding philosophy or a new perspective on classic software.</p>
          <p className="text-xs text-mac-dark-gray mt-2">Date: 2024-07-20</p>
        </div>
      </div>
      <div className="mt-6 text-right">
        <PixelButton onClick={onClose} variant="default">Close Essays</PixelButton>
      </div>
    </div>
  );
};

export { EssaysApp };