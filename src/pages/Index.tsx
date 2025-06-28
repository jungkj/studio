import React, { useState } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Window } from '@/components/Window';
import { BlogApp } from '@/components/BlogApp';
import { AboutApp } from '@/components/AboutApp';
import { MyComputerApp } from '@/components/MyComputerApp';
import { NotesApp } from '@/components/NotesApp'; // Import NotesApp
import { MenuBar } from '@/components/MenuBar';
import { SystemTray } from '@/components/SystemTray';
import { DesktopIcon } from '@/components/DesktopIcon';
import { FileText, User, Monitor, Trash2, NotebookText } from 'lucide-react'; // Added NotebookText icon
import { toast } from 'sonner';

type WindowName = 'blog' | 'about' | 'myComputer' | 'notes'; // Added 'notes'

interface WindowState {
  isOpen: boolean;
  zIndex: number;
}

const Index = () => {
  const [windowStates, setWindowStates] = useState<Record<WindowName, WindowState>>({
    blog: { isOpen: false, zIndex: 10 },
    about: { isOpen: false, zIndex: 11 },
    myComputer: { isOpen: false, zIndex: 12 },
    notes: { isOpen: false, zIndex: 13 }, // Initial z-index for Notes
  });

  const [maxZIndex, setMaxZIndex] = useState(13); // Updated max z-index

  const openWindow = (windowName: WindowName) => {
    setWindowStates(prev => {
      const newMaxZIndex = maxZIndex + 1;
      setMaxZIndex(newMaxZIndex);
      return {
        ...prev,
        [windowName]: { isOpen: true, zIndex: newMaxZIndex },
      };
    });
  };

  const closeWindow = (windowName: WindowName) => {
    setWindowStates(prev => ({
      ...prev,
      [windowName]: { ...prev[windowName], isOpen: false },
    }));
  };

  const focusWindow = (windowName: WindowName) => {
    setWindowStates(prev => {
      const currentZIndex = prev[windowName].zIndex;
      if (currentZIndex === maxZIndex) {
        return prev; // Already on top
      }
      const newMaxZIndex = maxZIndex + 1;
      setMaxZIndex(newMaxZIndex);
      return {
        ...prev,
        [windowName]: { ...prev[windowName], zIndex: newMaxZIndex },
      };
    });
  };

  const handleTrashClick = () => {
    toast.info("Trash is empty. Drag items here to delete them!");
  };

  return (
    <div className="min-h-screen w-full mac-desktop-bg flex flex-col relative overflow-hidden">
      {/* Menu Bar */}
      <MenuBar />

      {/* Desktop Icons */}
      <div className="p-4 flex flex-col items-start space-y-2">
        <DesktopIcon icon={FileText} label="My Blog" onClick={() => openWindow('blog')} />
        <DesktopIcon icon={User} label="About Me" onClick={() => openWindow('about')} />
        <DesktopIcon icon={Monitor} label="My Computer" onClick={() => openWindow('myComputer')} />
        <DesktopIcon icon={NotebookText} label="Notes" onClick={() => openWindow('notes')} /> {/* New Notes Icon */}
        <DesktopIcon icon={Trash2} label="Trash" onClick={handleTrashClick} />
      </div>

      {/* Active Windows */}
      {windowStates.blog.isOpen && (
        <Window
          title="My Blog"
          onClose={() => closeWindow('blog')}
          initialPosition={{ x: 50, y: 50 }}
          zIndex={windowStates.blog.zIndex}
          onFocus={() => focusWindow('blog')}
        >
          <BlogApp onClose={() => closeWindow('blog')} />
        </Window>
      )}
      {windowStates.about.isOpen && (
        <Window
          title="About Me"
          onClose={() => closeWindow('about')}
          initialPosition={{ x: 150, y: 100 }}
          zIndex={windowStates.about.zIndex}
          onFocus={() => focusWindow('about')}
        >
          <AboutApp onClose={() => closeWindow('about')} />
        </Window>
      )}
      {windowStates.myComputer.isOpen && (
        <Window
          title="My Computer"
          onClose={() => closeWindow('myComputer')}
          initialPosition={{ x: 250, y: 150 }}
          zIndex={windowStates.myComputer.zIndex}
          onFocus={() => focusWindow('myComputer')}
        >
          <MyComputerApp onClose={() => closeWindow('myComputer')} />
        </Window>
      )}
      {windowStates.notes.isOpen && (
        <Window
          title="Notes"
          onClose={() => closeWindow('notes')}
          initialPosition={{ x: 350, y: 200 }}
          zIndex={windowStates.notes.zIndex}
          onFocus={() => focusWindow('notes')}
        >
          <NotesApp onClose={() => closeWindow('notes')} />
        </Window>
      )}

      {/* Made with Dyad */}
      <div className="absolute bottom-10 right-4">
        <MadeWithDyad />
      </div>

      {/* System Tray */}
      <SystemTray />
    </div>
  );
};

export default Index;