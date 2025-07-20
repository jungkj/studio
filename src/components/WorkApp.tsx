import React from 'react';
import { PixelButton } from './PixelButton';
import { Code, Image, ExternalLink, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkAppProps {
  onClose: () => void;
}

const WorkApp: React.FC<WorkAppProps> = ({ onClose }) => {
  const projects = [
    {
      icon: Code,
      title: 'This Retro Mac Site',
      status: '🔥 Live Project',
      description: 'You\'re looking at it! Built this entire vintage Mac experience from scratch because I was bored of template portfolios. Features authentic System 7 styling, draggable windows, and that sweet startup sequence.',
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Vintage Vibes'],
      link: 'https://github.com/yourusername/portfolio',
    },
    {
      icon: Code,
      title: 'FinTech Dashboard',
      status: '💼 Professional Work',
      description: 'Built a real-time trading dashboard for a startup that processed $2M+ in daily transactions. Clean UI, fast data updates, zero downtime during market hours.',
      technologies: ['React', 'Python', 'FastAPI', 'WebSockets'],
      link: '#',
    },
    {
      icon: Code,
      title: 'Campus Food Tracker',
      status: '🎓 College Project',
      description: 'Created an app that helped BC students avoid dining hall lines. Got 500+ users in the first week because nobody likes waiting for mediocre pasta.',
      technologies: ['React Native', 'Node.js', 'MongoDB'],
      link: '#',
    },
    {
      icon: Image,
      title: 'Brand Identity Work',
      status: '🎨 Creative Side',
      description: 'Designed logos and brand systems for local businesses. Because good design shouldn\'t be reserved for Fortune 500 companies.',
      technologies: ['Figma', 'Illustrator', 'Brand Strategy'],
      link: '#',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-mac-light-gray mac-system-font">
      {/* Header */}
      <div className="bg-mac-white mac-border-inset p-4 m-4 mb-2">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Briefcase size={20} className="text-mac-black" />
            <h1 className="text-lg font-bold text-mac-black pixel-font">My Work Portfolio</h1>
          </div>
          <p className="text-sm text-mac-dark-gray pixel-font">
            Projects I've built & things I'm proud of 🛠️
          </p>
        </div>
      </div>
      
      {/* Projects List */}
      <div className="flex-1 overflow-auto p-4 pt-2">
        <div className="space-y-4">
          {projects.map((project, index) => (
            <div
              key={index}
              className="bg-mac-white mac-border-outset p-4"
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    <project.icon size={16} className="text-mac-dark-gray" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-bold mb-1 text-mac-black pixel-font">
                      {project.title}
                    </h2>
                    <span className="text-xs text-mac-dark-gray pixel-font">
                      {project.status}
                    </span>
                  </div>
                </div>
                {project.link !== '#' && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                    title="View project"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
              
              {/* Description */}
              <div className="bg-mac-light-gray mac-border-inset p-2 mb-3">
                <p className="text-xs leading-relaxed text-mac-black pixel-font">
                  {project.description}
                </p>
              </div>
              
              {/* Technologies */}
              <div className="mb-3">
                <span className="text-xs text-mac-dark-gray font-bold pixel-font">Technologies: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.technologies.map((tech, techIndex) => (
                    <span 
                      key={techIndex} 
                      className="bg-mac-medium-gray text-mac-black text-xs px-2 py-1 mac-border-outset pixel-font"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 pt-2">
        <PixelButton 
          onClick={onClose} 
          className="w-full bg-mac-medium-gray hover:bg-mac-dark-gray hover:text-mac-white transition-colors"
        >
          ← Back to Desktop
        </PixelButton>
      </div>
    </div>
  );
};

export { WorkApp };