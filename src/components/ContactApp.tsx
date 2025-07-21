import React from 'react';
import { PixelButton } from './PixelButton';
import { Mail, Github, Linkedin, ExternalLink } from 'lucide-react';

interface ContactAppProps {
  onClose: () => void;
}

const ContactApp: React.FC<ContactAppProps> = ({ onClose }) => {
  const contacts = [
    {
      icon: '📧',
      label: 'Gmail',
      value: 'andyjung2001@gmail.com',
      link: 'mailto:andyjung2001@gmail.com',
      color: 'bg-red-500'
    },
    {
      icon: '💼',
      label: 'LinkedIn',
      value: 'Ki Hwan Andy Jung',
      link: 'https://www.linkedin.com/in/ki-hwan-andy-jung/',
      color: 'bg-blue-600'
    },
    {
      icon: '🐙',
      label: 'GitHub',
      value: '@jungkj',
      link: 'https://github.com/jungkj',
      color: 'bg-gray-800'
    }
  ];

  return (
    <div className="h-full flex flex-col bg-mac-white">
      {/* Header */}
      <div className="bg-mac-light-gray mac-border-inset p-4 text-center">
        <h2 className="text-lg font-bold text-mac-black">Contact Me</h2>
        <p className="text-xs text-mac-dark-gray mt-1">Click to connect</p>
      </div>
      
      {/* Contact Grid */}
      <div className="flex-1 p-6">
        <div className="grid gap-4">
          {contacts.map((contact, index) => (
            <a
              key={index}
              href={contact.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="bg-mac-light-gray mac-border-outset p-4 hover:mac-border-inset transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  {/* Retro Icon */}
                  <div className="text-3xl select-none">
                    {contact.icon}
                  </div>
                  
                  {/* Contact Info */}
                  <div className="flex-1">
                    <div className="font-bold text-sm text-mac-black group-hover:text-apple-blue transition-colors">
                      {contact.label}
                    </div>
                    <div className="text-xs text-mac-dark-gray">
                      {contact.value}
                    </div>
                  </div>
                  
                  {/* External Link Icon */}
                  <ExternalLink 
                    size={16} 
                    className="text-mac-dark-gray opacity-0 group-hover:opacity-100 transition-opacity" 
                  />
                </div>
              </div>
            </a>
          ))}
        </div>
        
        {/* Quick Message */}
        <div className="mt-6 p-4 bg-cream-50 mac-border-inset text-center">
          <p className="text-xs text-mac-black">
            Always open to interesting projects and collaborations!
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 bg-mac-light-gray mac-border-outset">
        <PixelButton onClick={onClose} variant="default" className="w-full">
          ← Back to Desktop
        </PixelButton>
      </div>
    </div>
  );
};

export { ContactApp };