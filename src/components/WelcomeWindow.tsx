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
    <div className="p-2 font-sans text-mac-black flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4">Welcome!</h2>
      <div className="flex-grow overflow-auto mac-border-inset bg-mac-light-gray p-3">
        <Card className="mac-border-outset bg-mac-white text-mac-black mb-4">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Greetings from the Past!</CardTitle>
            <CardDescription className="text-sm text-mac-dark-gray">
              A retro-inspired personal website.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-3">
              Welcome to my digital realm, designed with a nostalgic nod to classic operating systems.
              Here, you can explore my projects, thoughts, and connect with me in a unique, interactive environment.
            </p>
            <p className="text-sm mb-3">
              I'm Andy Jung, a recent grad (Class of 2024) from Boston College. I studied
              <Badge variant="secondary" className="ml-1 mr-1 bg-mac-medium-gray text-mac-black">Finance</Badge>
              <Badge variant="secondary" className="mr-1 bg-mac-medium-gray text-mac-black">Computer Science</Badge>
              and
              <Badge variant="secondary" className="ml-1 bg-mac-medium-gray text-mac-black">Information Systems</Badge>.
            </p>
            <p className="text-sm">
              I enjoy building things and listening to music. Feel free to click around and discover more!
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 text-right">
        <PixelButton onClick={onClose} variant="default">Enter Desktop</PixelButton>
      </div>
    </div>
  );
};

export { WelcomeWindow };