import React from 'react';
import { PixelButton } from './PixelButton';

interface AboutAppProps {
  onClose: () => void;
}

const AboutApp: React.FC<AboutAppProps> = ({ onClose }) => {
  return (
    <div className="p-2 font-sans text-mac-black">
      <h2 className="text-lg font-bold mb-4">About Me</h2>
      <div className="mac-border-inset p-3 bg-mac-light-gray"> {/* macOS inset border and light gray background */}
        <p className="text-sm mb-2">
          Greetings, adventurer! I'm [Your Name], a passionate [Your Profession/Hobby] with a love for all things retro and digital.
        </p>
        <p className="text-sm mb-2">
          This website is my little corner of the internet, designed to share my thoughts, projects, and journey.
        </p>
        <p className="text-sm">
          Feel free to explore and learn more about my adventures!
        </p>
      </div>
      <div className="mt-6 text-right">
        <PixelButton onClick={onClose} variant="default">Close About</PixelButton>
      </div>
    </div>
  );
};

export { AboutApp };