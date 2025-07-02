import React from 'react';
import { PixelButton } from './PixelButton';
import { Code, Image, ExternalLink, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkAppProps {
  onClose: () => void;
}

const WorkApp: React.FC<WorkAppProps> = ({ onClose }) => {
  // Technology-specific color mapping
  const getTechnologyColor = (tech: string): { bg: string; text: string; border: string } => {
    const techLower = tech.toLowerCase();
    
    if (techLower.includes('react')) {
      return { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600' };
    }
    if (techLower.includes('typescript')) {
      return { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700' };
    }
    if (techLower.includes('javascript')) {
      return { bg: 'bg-yellow-500', text: 'text-black', border: 'border-yellow-600' };
    }
    if (techLower.includes('tailwind')) {
      return { bg: 'bg-cyan-500', text: 'text-white', border: 'border-cyan-600' };
    }
    if (techLower.includes('python')) {
      return { bg: 'bg-green-600', text: 'text-white', border: 'border-green-700' };
    }
    if (techLower.includes('node') || techLower.includes('fastapi')) {
      return { bg: 'bg-green-500', text: 'text-white', border: 'border-green-600' };
    }
    if (techLower.includes('mongodb')) {
      return { bg: 'bg-green-700', text: 'text-white', border: 'border-green-800' };
    }
    if (techLower.includes('figma')) {
      return { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-600' };
    }
    if (techLower.includes('illustrator')) {
      return { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' };
    }
    if (techLower.includes('websocket')) {
      return { bg: 'bg-indigo-500', text: 'text-white', border: 'border-indigo-600' };
    }
    if (techLower.includes('native')) {
      return { bg: 'bg-blue-400', text: 'text-white', border: 'border-blue-500' };
    }
    if (techLower.includes('vintage') || techLower.includes('vibes')) {
      return { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-600' };
    }
    if (techLower.includes('brand') || techLower.includes('strategy')) {
      return { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' };
    }
    
    // Default
    return { bg: 'bg-mac-dark-gray', text: 'text-mac-white', border: 'border-mac-black' };
  };

  const projects = [
    {
      icon: Code,
      title: 'This Retro Mac Site',
      status: '🔥 Live Project',
      description: 'You\'re looking at it! Built this entire vintage Mac experience from scratch because I was bored of template portfolios. Features authentic System 7 styling, draggable windows, and that sweet startup sequence.',
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Vintage Vibes'],
      link: 'https://github.com/yourusername/portfolio',
      impact: 'Made portfolios fun again',
    },
    {
      icon: Code,
      title: 'FinTech Dashboard',
      status: '💼 Professional Work',
      description: 'Built a real-time trading dashboard for a startup that processed $2M+ in daily transactions. Clean UI, fast data updates, zero downtime during market hours.',
      technologies: ['React', 'Python', 'FastAPI', 'WebSockets'],
      link: '#',
      impact: '40% faster trade execution',
    },
    {
      icon: Code,
      title: 'Campus Food Tracker',
      status: '🎓 College Project',
      description: 'Created an app that helped BC students avoid dining hall lines. Got 500+ users in the first week because nobody likes waiting for mediocre pasta.',
      technologies: ['React Native', 'Node.js', 'MongoDB'],
      link: '#',
      impact: 'Saved 1000+ hours of student time',
    },
    {
      icon: Image,
      title: 'Brand Identity Work',
      status: '🎨 Creative Side',
      description: 'Designed logos and brand systems for local businesses. Because good design shouldn\'t be reserved for Fortune 500 companies.',
      technologies: ['Figma', 'Illustrator', 'Brand Strategy'],
      link: '#',
      impact: '3 businesses launched successfully',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-mac-white via-mac-light-gray to-mac-medium-gray mac-system-font text-mac-black">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-100 via-mac-light-gray to-purple-100 mac-border-inset p-4 mb-0 border-b-2 border-mac-medium-gray">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="bg-mac-white mac-border-outset p-2 rounded">
              <Briefcase size={20} className="text-blue-600" />
            </div>
            <h1 className="text-responsive-lg font-bold text-container pixel-font">My Work Portfolio</h1>
          </div>
          <div className="bg-mac-white mac-border-inset p-2 max-w-md mx-auto">
            <p className="text-responsive text-mac-black leading-relaxed text-container pixel-font">
              Projects I've built & things I'm proud of 🛠️
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-6">
          {projects.map((project, index) => (
            <div
              key={index}
              className={cn(
                "bg-gradient-to-br from-mac-white via-mac-light-gray to-mac-medium-gray mac-border-outset p-5 shadow-lg",
                "hover:from-mac-light-gray hover:via-mac-white hover:to-mac-light-gray transition-all duration-300",
                "border-r-2 border-b-2 border-mac-dark-gray"
              )}
              style={{
                background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 50%, #d0d0d0 100%)',
                boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.8), 2px 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-1 bg-mac-white mac-border-inset p-2 rounded">
                    <project.icon size={20} className="text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-responsive font-bold mb-1 leading-tight text-container pixel-font text-mac-black">
                      {project.title}
                    </h2>
                    <div className="bg-gradient-to-r from-green-100 to-blue-100 mac-border-inset px-2 py-1 inline-block">
                      <span className="text-responsive-sm text-mac-black font-semibold text-container pixel-font">
                        {project.status}
                      </span>
                    </div>
                  </div>
                </div>
                {project.link !== '#' && (
                  <div className="bg-mac-white mac-border-outset p-2 ml-3 mt-1 hover:bg-mac-light-gray transition-colors">
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="View project"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                )}
              </div>
              
              {/* Project Description */}
              <div className="mb-4">
                <div className="bg-mac-white mac-border-inset p-3">
                  <p className="text-responsive-sm leading-relaxed text-container text-mac-black pixel-font">
                    {project.description}
                  </p>
                </div>
              </div>
              
              {/* Technologies */}
              <div className="mb-4">
                <div className="text-responsive-sm text-mac-black font-bold mb-2 text-container pixel-font">Technologies:</div>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, techIndex) => {
                    const colors = getTechnologyColor(tech);
                    return (
                      <span 
                        key={techIndex} 
                        className={cn(
                          colors.bg, 
                          colors.text,
                          "text-responsive-sm px-3 py-1 mac-border-outset font-semibold text-container pixel-font shadow-sm",
                          "hover:shadow-md transition-shadow cursor-default"
                        )}
                        style={{
                          boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.3), 1px 1px 2px rgba(0,0,0,0.3)'
                        }}
                      >
                        {tech}
                      </span>
                    );
                  })}
                </div>
              </div>
              
              {/* Impact */}
              <div className="border-t-2 border-mac-medium-gray pt-3">
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 mac-border-inset p-2">
                  <div className="text-responsive-sm text-mac-black font-bold mb-1 text-container pixel-font">Impact:</div>
                  <div className="text-responsive-sm font-semibold text-mac-black text-container pixel-font">
                    {project.impact}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Call to Action */}
        <div className="mt-6 bg-gradient-to-r from-purple-100 via-blue-100 to-green-100 mac-border-outset p-4 text-center shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #f5f3ff 0%, #eff6ff 50%, #f0fdf4 100%)',
            boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.8), 2px 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          <div className="bg-mac-white mac-border-inset p-4">
            <h3 className="text-responsive font-bold mb-2 text-container pixel-font">Want to work together?</h3>
            <p className="text-responsive-sm text-mac-black leading-relaxed text-container pixel-font">
              I'm always down to build cool stuff with cool people.<br/>
              Let's create something amazing! 🚀
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-gradient-to-r from-mac-light-gray to-mac-medium-gray mac-border-outset border-t-2 border-mac-dark-gray p-3 text-center">
        <PixelButton 
          onClick={onClose} 
          variant="default" 
          className="px-8 py-2 bg-mac-medium-gray hover:bg-mac-dark-gray hover:text-mac-white text-mac-black font-bold text-sm"
        >
          ← Back to Desktop
        </PixelButton>
      </div>
    </div>
  );
};

export { WorkApp };