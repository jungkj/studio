import React from 'react';
import { PixelButton } from './PixelButton';
import { Mail, Phone, Linkedin, Github } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactAppProps {
  onClose: () => void;
}

const ContactApp: React.FC<ContactAppProps> = ({ onClose }) => {
  return (
    <div className="p-1 font-sans text-mac-black flex flex-col h-full"> {/* Adjusted padding */}
      <h2 className="text-base mb-2">Contact Me</h2> {/* Adjusted font size, removed bold */}
      <div className="flex-grow mac-border-inset bg-mac-light-gray p-2 flex flex-col space-y-2"> {/* Adjusted padding and space-y */}
        <p className="text-xs"> {/* Adjusted font size */}
          Feel free to reach out to me through any of the following channels:
        </p>
        <div className="space-y-1"> {/* Adjusted space-y */}
          <div className="flex items-center space-x-1"> {/* Adjusted space-x */}
            <Mail size={14} className="text-mac-dark-gray" /> {/* Adjusted icon size */}
            <a href="mailto:your.email@example.com" className="text-blue-600 hover:underline text-xs"> {/* Adjusted font size */}
              your.email@example.com
            </a>
          </div>
          <div className="flex items-center space-x-1"> {/* Adjusted space-x */}
            <Phone size={14} className="text-mac-dark-gray" /> {/* Adjusted icon size */}
            <span className="text-xs">+1 (123) 456-7890</span> {/* Adjusted font size */}
          </div>
          <div className="flex items-center space-x-1"> {/* Adjusted space-x */}
            <Linkedin size={14} className="text-mac-dark-gray" /> {/* Adjusted icon size */}
            <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs"> {/* Adjusted font size */}
              LinkedIn Profile
            </a>
          </div>
          <div className="flex items-center space-x-1"> {/* Adjusted space-x */}
            <Github size={14} className="text-mac-dark-gray" /> {/* Adjusted icon size */}
            <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs"> {/* Adjusted font size */}
              GitHub Profile
            </a>
          </div>
        </div>
        <p className="text-[0.65rem] text-mac-dark-gray mt-2"> {/* Smaller font size, adjusted margin */}
          (Note: Replace placeholder information with your actual details.)
        </p>
      </div>
      <div className="mt-2 text-right"> {/* Adjusted margin-top */}
        <PixelButton onClick={onClose} variant="default">Close Contact</PixelButton>
      </div>
    </div>
  );
};

export { ContactApp };