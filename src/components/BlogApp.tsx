import React from 'react';
import { PixelButton } from './PixelButton';

interface BlogAppProps {
  onClose: () => void;
}

const BlogApp: React.FC<BlogAppProps> = ({ onClose }) => {
  return (
    <div className="p-2 font-sans text-mac-black">
      <h2 className="text-lg font-bold mb-4">My Blog Posts</h2>
      <div className="space-y-4">
        <div className="mac-border-inset p-3 bg-mac-light-gray"> {/* macOS inset border and light gray background */}
          <h3 className="font-bold text-md mb-1">First Post Title</h3>
          <p className="text-sm">This is the content of my very first blog post. It's short and sweet, just like a good retro game tutorial!</p>
          <p className="text-xs text-mac-dark-gray mt-2">Date: 2024-07-26</p>
        </div>
        <div className="mac-border-inset p-3 bg-mac-light-gray"> {/* macOS inset border and light gray background */}
          <h3 className="font-bold text-md mb-1">Another Great Read</h3>
          <p className="text-sm">Here's another entry, perhaps about my latest coding adventure or a new discovery in the world of pixel art.</p>
          <p className="text-xs text-mac-dark-gray mt-2">Date: 2024-07-20</p>
        </div>
      </div>
      <div className="mt-6 text-right">
        <PixelButton onClick={onClose} variant="default">Close Blog</PixelButton>
      </div>
    </div>
  );
};

export { BlogApp };