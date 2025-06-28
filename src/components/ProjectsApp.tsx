import React from 'react';
import { PixelButton } from './PixelButton';
import { Folder, Code, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectsAppProps {
  onClose: () => void;
}

const ProjectsApp: React.FC<ProjectsAppProps> = ({ onClose }) => {
  const projects = [
    {
      icon: Code,
      title: 'Retro Portfolio Site',
      description: 'This very website, built with React and a macOS-inspired theme.',
      link: '#', // Placeholder for actual project link
    },
    {
      icon: Folder,
      title: 'Game Development Project',
      description: 'A small indie game developed using [Engine/Framework].',
      link: '#',
    },
    {
      icon: Image,
      title: 'Digital Art Gallery',
      description: 'A collection of digital illustrations and graphic designs.',
      link: '#',
    },
  ];

  return (
    <div className="p-2 font-sans text-mac-black flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4">My Projects</h2>
      <div className="flex-grow overflow-auto mac-border-inset bg-mac-light-gray p-3">
        <div className="grid grid-cols-1 gap-4">
          {projects.map((project, index) => (
            <a
              key={index}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center p-3 cursor-pointer",
                "hover:bg-mac-medium-gray/30 active:bg-mac-medium-gray/50 rounded-sm",
                "transition-colors duration-150"
              )}
            >
              <project.icon size={24} className="mr-3 text-mac-dark-gray" />
              <div>
                <h3 className="font-bold text-md leading-tight">{project.title}</h3>
                <p className="text-sm text-mac-dark-gray">{project.description}</p>
              </div>
            </a>
          ))}
        </div>
        <p className="text-xs text-mac-dark-gray mt-4">
          (Note: Click on project titles to view more details or external links.)
        </p>
      </div>
      <div className="mt-4 text-right">
        <PixelButton onClick={onClose} variant="default">Close Projects</PixelButton>
      </div>
    </div>
  );
};

export { ProjectsApp };