import React from 'react';
import { PixelButton } from './PixelButton';
import { Code, Image, ExternalLink, Briefcase, ArrowUpRight, Link } from 'lucide-react';
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
          <h1 className="text-lg font-bold text-mac-black mb-1">My Work</h1>
          <p className="text-xs text-mac-dark-gray">
            things ive built
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
                  <div className="mt-1 bg-mac-light-gray mac-border-inset p-2">
                    <project.icon size={18} className="text-mac-black" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-bold mb-1 text-mac-black">
                      {project.title}
                    </h2>
                    <span className="text-xs text-mac-dark-gray inline-block bg-cream-50 px-2 py-1 mac-border-outset">
                      {project.status}
                    </span>
                  </div>
                </div>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "bg-mac-light-gray mac-border-outset p-2 transition-all flex items-center justify-center",
                    project.link !== '#' 
                      ? "hover:mac-border-inset cursor-pointer" 
                      : "opacity-50 cursor-not-allowed pointer-events-none"
                  )}
                  title={project.link !== '#' ? "View project" : "Link coming soon"}
                >
                  <ExternalLink size={16} className="text-mac-black" />
                </a>
              </div>
              
              {/* Description */}
              <div className="bg-cream-25 mac-border-inset p-3 mb-3">
                <p className="text-sm leading-relaxed text-mac-black">
                  {project.description}
                </p>
              </div>
              
              {/* Technologies */}
              <div className="flex flex-wrap gap-2 items-center">
                {project.technologies.map((tech, techIndex) => (
                  <span 
                    key={techIndex} 
                    className="bg-mac-white text-mac-black text-xs px-3 py-1 mac-border-outset hover:bg-mac-light-gray transition-colors"
                  >
                    {tech}
                  </span>
                ))}
                {project.link === '#' && (
                  <span className="text-xs text-mac-dark-gray italic ml-auto">
                    (link coming soon)
                  </span>
                )}
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