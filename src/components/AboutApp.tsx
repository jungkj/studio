import React from 'react';
import { PixelButton } from './PixelButton';

interface AboutAppProps {
  onClose: () => void;
}

const AboutApp: React.FC<AboutAppProps> = ({ onClose }) => {
  return (
    <div className="p-3 mac-system-font text-mac-black flex flex-col h-full bg-mac-light-gray">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold mb-1">About This Human</h2>
        <div className="text-sm text-mac-dark-gray">The story behind the pixels 🕺</div>
      </div>
      
      <div className="flex-grow overflow-auto mac-border-inset bg-mac-white p-4 mb-4">
        <div className="text-sm leading-relaxed space-y-4">
          <div className="text-center mb-4">
            <div className="text-xl mb-2">👋</div>
            <div className="font-bold">Hey there! I'm Andy Jung.</div>
          </div>
          
          <p className="break-words">
            I'm a recent Boston College grad (Class of 2024) who studied the trifecta: 
            Finance, Computer Science, and Information Systems. Sounds like I couldn't 
            make up my mind, right? Well... you're not wrong 😅
          </p>
          
          <p className="break-words">
            Here's the thing: I genuinely love building things. Whether it's coding up 
            a retro website that makes you feel nostalgic for computers you've never 
            owned, or diving into financial models that actually make sense, I'm all about 
            creating stuff that matters.
          </p>
          
          <div className="mac-border-inset bg-mac-light-gray p-3 text-xs">
            <div className="font-bold mb-2">The Real Talk 💯</div>
            <p className="break-words">
              I built this entire site because I was tired of boring portfolio websites. 
              Everyone's got the same Webflow template, same stock photos, same energy. 
              Where's the personality? Where's the FUN?
            </p>
          </div>
          
          <p className="break-words">
            When I'm not coding or analyzing spreadsheets, you'll find me listening to music 
            (my Spotify Wrapped is... diverse), exploring new places, or probably explaining 
            to someone why the original Mac was revolutionary.
          </p>
          
          <p className="break-words">
            This website? It's my digital playground. It's where I can be authentically me 
            while showing off the work I'm actually proud of. No corporate buzzwords, 
            no "synergistic solutions" - just real projects, real thoughts, and real vibes.
          </p>
          
          <div className="text-center mt-4 p-2 text-xs text-mac-dark-gray">
            <strong>Current Status:</strong> Building cool stuff & looking for the next adventure 🚀
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

export { AboutApp };