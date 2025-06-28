import React from 'react';
import { PixelButton } from './PixelButton';

interface AboutAppProps {
  onClose: () => void;
}

const AboutApp: React.FC<AboutAppProps> = ({ onClose }) => {
  return (
    <div className="p-1 font-sans text-mac-black"> {/* Adjusted padding */}
      <h2 className="text-base mb-2">About Me</h2> {/* Adjusted font size, removed bold */}
      <div className="mac-border-inset p-2 bg-mac-light-gray"> {/* macOS inset border and light gray background, adjusted padding */}
        <p className="text-xs mb-1"> {/* Adjusted font size and margin */}
          Greetings, adventurer! I'm [Your Name], a passionate [Your Profession/Hobby] with a love for all things retro and digital.
        </p>
        <p className="text-xs mb-1"> {/* Adjusted font size and margin */}
          This website is my little corner of the internet, designed to share my thoughts, projects, and journey.
        </p>
        <p className="text-xs"> {/* Adjusted font size */}
          Feel free to explore and learn more about my adventures!
        </p>
      </div>
      <div className="mt-4 text-right"> {/* Adjusted margin-top */}
        <PixelButton onClick={onClose} variant="default">Close About</PixelButton>
      </div>
    </div>
  );
};

export { AboutApp };