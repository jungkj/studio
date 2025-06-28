import React from 'react';
import { PixelButton } from './PixelButton';
import { Mail, Phone, Linkedin, Github } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactAppProps {
  onClose: () => void;
}

const ContactApp: React.FC<ContactAppProps> = ({ onClose }) => {
  return (
    <div className="p-2 font-sans text-mac-black flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4">Contact Me</h2>
      <div className="flex-grow mac-border-inset bg-mac-light-gray p-3 flex flex-col space-y-4">
        <p className="text-sm">
          Feel free to reach out to me through any of the following channels:
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Mail size={16} className="text-mac-dark-gray" />
            <a href="mailto:your.email@example.com" className="text-blue-600 hover:underline text-sm">
              your.email@example.com
            </a>
          </div>
          <div className="flex items-center space-x-2">
            <Phone size={16} className="text-mac-dark-gray" />
            <span className="text-sm">+1 (123) 456-7890</span>
          </div>
          <div className="flex items-center space-x-2">
            <Linkedin size={16} className="text-mac-dark-gray" />
            <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
              LinkedIn Profile
            </a>
          </div>
          <div className="flex items-center space-x-2">
            <Github size={16} className="text-mac-dark-gray" />
            <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
              GitHub Profile
            </a>
          </div>
        </div>
        <p className="text-xs text-mac-dark-gray mt-4">
          (Note: Replace placeholder information with your actual details.)
        </p>
      </div>
      <div className="mt-4 text-right">
        <PixelButton onClick={onClose} variant="default">Close Contact</PixelButton>
      </div>
    </div>
  );
};

export { ContactApp };