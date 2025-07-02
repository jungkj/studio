import React from 'react';
import { PixelButton } from './PixelButton';
import { Mail, Github, Linkedin, Twitter, MessageCircle } from 'lucide-react';

interface ContactAppProps {
  onClose: () => void;
}

const ContactApp: React.FC<ContactAppProps> = ({ onClose }) => {
  const contactMethods = [
    {
      icon: Mail,
      label: 'Email',
      value: 'andyjung@example.com',
      link: 'mailto:andyjung@example.com',
      description: 'Best for: Real conversations, collaboration, or just saying hi'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn', 
      value: 'Andy Jung',
      link: 'https://linkedin.com/in/andyjung',
      description: 'Best for: Professional stuff (but I promise I\'m not boring)'
    },
    {
      icon: Github,
      label: 'GitHub',
      value: '@andyjung',
      link: 'https://github.com/andyjung',
      description: 'Best for: Seeing my code, judging my commit messages'
    },
    {
      icon: Twitter,
      label: 'Twitter/X',
      value: '@andyjung',
      link: 'https://twitter.com/andyjung',
      description: 'Best for: Hot takes, memes, and probably too many startup thoughts'
    }
  ];

  return (
    <div className="p-3 mac-system-font text-mac-black flex flex-col h-full bg-mac-light-gray">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold mb-1">Let's Connect</h2>
        <div className="text-sm text-mac-dark-gray">Always down to chat about cool projects 💬</div>
      </div>
      
      <div className="flex-grow overflow-auto mac-border-inset bg-mac-white p-4 mb-4">
        <div className="space-y-4 mb-6">
          {contactMethods.map((method, index) => (
            <div key={index} className="mac-border-outset bg-mac-light-gray p-4">
              <div className="flex items-center mb-2">
                <method.icon size={18} className="mr-3 text-mac-dark-gray" />
                <div className="flex-grow min-w-0">
                  <div className="font-bold text-base break-words">{method.label}</div>
                  <a 
                    href={method.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-mac-dark-gray hover:text-mac-black hover:underline break-words"
                  >
                    {method.value}
                  </a>
                </div>
              </div>
              <p className="text-xs text-mac-dark-gray ml-9 break-words">
                {method.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mac-border-inset bg-mac-light-gray p-4 mb-4">
          <div className="text-center">
            <MessageCircle size={24} className="mx-auto mb-2 text-mac-dark-gray" />
            <div className="text-base font-bold mb-2">What I'm looking for:</div>
            <div className="text-sm space-y-1">
              <div>• Cool people building cool things</div>
              <div>• Startup opportunities (early-stage preferred)</div>
              <div>• Freelance projects that don't suck</div>
              <div>• Coffee chats about literally anything</div>
              <div>• Collaborations on side projects</div>
            </div>
          </div>
        </div>

                  <div className="text-center p-3 mac-border-inset bg-mac-light-gray">
          <div className="text-sm font-bold mb-2">Response Time ⏰</div>
          <div className="text-xs text-mac-dark-gray space-y-1">
            <div className="break-words">Email: Usually within 24 hours</div>
            <div className="break-words">Social Media: When I remember to check</div>
            <div className="break-words">Actual good opportunities: Immediately</div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <div className="text-xs text-mac-dark-gray italic">
            "The best opportunities come from the most unexpected conversations." 
            <br />- Someone smart, probably
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <PixelButton onClick={onClose} variant="default" className="px-6">
          Back to Desktop
        </PixelButton>
      </div>
    </div>
  );
};

export { ContactApp };