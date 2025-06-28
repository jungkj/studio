import React from 'react';
import { PixelButton } from './PixelButton';
import { Code, Image, ExternalLink } from 'lucide-react'; // Added ExternalLink icon
import { cn } from '@/lib/utils';

interface WorkAppProps {
  onClose: () => void;
}

const WorkApp: React.FC<WorkAppProps> = ({ onClose }) => {
  const projects = [
    {
      icon: Code,
      title: 'Retro Portfolio Site',
      screenshot: 'https://via.placeholder.com/150x100?text=Site+Screenshot', // Placeholder for screenshot
      description: 'This very website, built with React and a macOS-inspired theme. It features draggable windows and interactive desktop elements.',
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Shadcn/ui'],
      link: '#', // Placeholder for actual project link
    },
    {
      icon: Image,
      title: 'Digital Art Gallery',
      screenshot: 'https://via.placeholder.com/150x100?text=Art+Screenshot',
      description: 'A collection of digital illustrations and graphic designs showcasing various styles and techniques.',
      technologies: ['Photoshop', 'Illustrator', 'Procreate'],
      link: '#',
    },
    {
      icon: Code,
      title: 'Game Development Project',
      screenshot: 'https://via.placeholder.com/150x100?text=Game+Screenshot',
      description: 'A small indie game developed using a modern game engine, focusing on unique mechanics and storytelling.',
      technologies: ['Unity', 'C#', 'Blender'],
      link: '#',
    },
  ];

  return (
    <div className="p-2 font-sans text-mac-black flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4">My Work</h2>
      <div className="flex-grow overflow-auto mac-border-inset bg-mac-light-gray p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((project, index) => (
            <a
              key={index}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex flex-col p-3 cursor-pointer mac-border-outset bg-mac-white", // Card styling
                "hover:bg-mac-medium-gray/30 active:bg-mac-medium-gray/50 rounded-sm",
                "transition-colors duration-150"
              )}
            >
              <div className="flex items-center mb-2">
                <project.icon size={20} className="mr-2 text-mac-dark-gray" />
                <h3 className="font-bold text-md leading-tight">{project.title}</h3>
                <ExternalLink size={16} className="ml-auto text-mac-dark-gray" />
              </div>
              <img src={project.screenshot} alt={project.title} className="w-full h-auto mb-2 object-cover mac-border-inset" />
              <p className="text-sm text-mac-black mb-2">{project.description}</p>
              <div className="flex flex-wrap gap-1">
                {project.technologies.map((tech, techIndex) => (
                  <span key={techIndex} className="bg-mac-medium-gray text-mac-black text-xs px-2 py-1 rounded-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
        <p className="text-xs text-mac-dark-gray mt-4">
          (Note: Click on project cards to view more details or external links.)
        </p>
      </div>
      <div className="mt-4 text-right">
        <PixelButton onClick={onClose} variant="default">Close Work</PixelButton>
      </div>
    </div>
  );
};

export { WorkApp };