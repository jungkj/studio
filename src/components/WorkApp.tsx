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
    <div className="p-1 font-sans text-mac-black flex flex-col h-full"> {/* Adjusted padding */}
      <h2 className="text-base mb-2">My Work</h2> {/* Adjusted font size, removed bold */}
      <div className="flex-grow overflow-auto mac-border-inset bg-mac-light-gray p-2"> {/* Adjusted padding */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2"> {/* Adjusted gap */}
          {projects.map((project, index) => (
            <a
              key={index}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex flex-col p-2 cursor-pointer mac-border-outset bg-mac-white", // Card styling, adjusted padding
                "hover:bg-mac-medium-gray/30 active:bg-mac-medium-gray/50 rounded-sm",
                "transition-colors duration-150"
              )}
            >
              <div className="flex items-center mb-1"> {/* Adjusted margin */}
                <project.icon size={16} className="mr-1 text-mac-dark-gray" /> {/* Adjusted icon size and margin */}
                <h3 className="text-sm leading-tight">{project.title}</h3> {/* Adjusted font size, removed bold */}
                <ExternalLink size={14} className="ml-auto text-mac-dark-gray" /> {/* Adjusted icon size */}
              </div>
              <img src={project.screenshot} alt={project.title} className="w-full h-auto mb-1 object-cover mac-border-inset" /> {/* Adjusted margin */}
              <p className="text-xs text-mac-black mb-1">{project.description}</p> {/* Adjusted font size and margin */}
              <div className="flex flex-wrap gap-0.5"> {/* Adjusted gap */}
                {project.technologies.map((tech, techIndex) => (
                  <span key={techIndex} className="bg-mac-medium-gray text-mac-black text-[0.65rem] px-1 py-0.5 rounded-sm"> {/* Adjusted font size and padding */}
                    {tech}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
        <p className="text-[0.65rem] text-mac-dark-gray mt-2"> {/* Smaller font size, adjusted margin */}
          (Note: Click on project cards to view more details or external links.)
        </p>
      </div>
      <div className="mt-2 text-right"> {/* Adjusted margin-top */}
        <PixelButton onClick={onClose} variant="default">Close Work</PixelButton>
      </div>
    </div>
  );
};

export { WorkApp };