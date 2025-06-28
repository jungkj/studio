import React from 'react';
import { PixelButton } from './PixelButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';

interface WelcomeWindowProps {
  onClose: () => void;
}

const WelcomeWindow: React.FC<WelcomeWindowProps> = ({ onClose }) => {
  return (
    <div className="p-1 font-sans text-mac-black flex flex-col h-full"> {/* Adjusted padding */}
      <h2 className="text-base mb-2">Welcome!</h2> {/* Adjusted font size, removed bold */}
      <div className="flex-grow overflow-auto mac-border-inset bg-mac-light-gray p-2"> {/* Adjusted padding */}
        <Card className="mac-border-outset bg-mac-white text-mac-black mb-2"> {/* Adjusted margin */}
          <CardHeader className="p-2 pb-1"> {/* Adjusted padding */}
            <CardTitle className="text-base">Greetings from the Past!</CardTitle> {/* Adjusted font size, removed bold */}
            <CardDescription className="text-xs text-mac-dark-gray"> {/* Adjusted font size */}
              A retro-inspired personal website.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 pt-0"> {/* Adjusted padding */}
            <p className="text-xs mb-2"> {/* Adjusted font size and margin */}
              Welcome to my digital realm, designed with a nostalgic nod to classic operating systems.
              Here, you can explore my projects, thoughts, and connect with me in a unique, interactive environment.
            </p>
            <p className="text-xs mb-2"> {/* Adjusted font size and margin */}
              I'm Andy Jung, a recent grad (Class of 2024) from Boston College. I studied
              <Badge variant="secondary" className="ml-0.5 mr-0.5 bg-mac-medium-gray text-mac-black text-[0.65rem] px-1 py-0.5">Finance</Badge> {/* Adjusted padding and font size */}
              <Badge variant="secondary" className="mr-0.5 bg-mac-medium-gray text-mac-black text-[0.65rem] px-1 py-0.5">Computer Science</Badge> {/* Adjusted padding and font size */}
              and
              <Badge variant="secondary" className="ml-0.5 bg-mac-medium-gray text-mac-black text-[0.65rem] px-1 py-0.5">Information Systems</Badge>. {/* Adjusted padding and font size */}
            </p>
            <p className="text-xs"> {/* Adjusted font size */}
              I enjoy building things and listening to music. Feel free to click around and discover more!
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-2 text-right"> {/* Adjusted margin-top */}
        <PixelButton onClick={onClose} variant="default">Enter Desktop</PixelButton>
      </div>
    </div>
  );
};

export { WelcomeWindow };