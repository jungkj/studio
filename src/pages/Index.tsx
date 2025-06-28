import React, { useState } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Window } from '@/components/Window';
import { EssaysApp } from '@/components/EssaysApp'; // Changed from BlogApp to EssaysApp
import { AboutApp } from '@/components/AboutApp';
import { MyComputerApp } from '@/components/MyComputerApp';
import { NotesApp } from '@/components/NotesApp';
import { GamesApp } from '@/components/GamesApp'; // Import GamesApp
import { MenuBar } from '@/components/MenuBar';
import { SystemTray } from '@/components/SystemTray';
import { DesktopIcon } from '@/components/DesktopIcon';
import { FileText, User, Monitor, Trash2, NotebookText, Gamepad2 } from 'lucide-react'; // Added Gamepad2 icon
import { toast } from 'sonner';

type WindowName = 'essays' | 'about' | 'myComputer' | 'notes' | 'games'; // Updated 'blog' to 'essays', added 'games'

interface WindowState {
  isOpen: boolean;
  zIndex: number;
}

const Index = () => {
  const [windowStates, setWindowStates] = useState<Record<WindowName, WindowState>>({
    essays: { isOpen: false, zIndex: 10 }, // Updated 'blog' to 'essays'
    about: { isOpen: false, zIndex: 11 },
    myComputer: { isOpen: false, zIndex: 12 },
    notes: { isOpen: false, zIndex: 13 },
    games: { isOpen: false, zIndex: 14 }, // Initial z-index for Games
  });

  const [maxZIndex, setMaxZIndex] = useState(14); // Updated max z-index

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
        <DesktopIcon icon={FileText} label="My Essays" onClick={() => openWindow('essays')} /> {/* Updated label */}
        <DesktopIcon icon={User} label="About Me" onClick={() => openWindow('about')} />
        <DesktopIcon icon={Monitor} label="My Computer" onClick={() => openWindow('myComputer')} />
        <DesktopIcon icon={NotebookText} label="Notes" onClick={() => openWindow('notes')} />
        <DesktopIcon icon={Gamepad2} label="Games" onClick={() => openWindow('games')} /> {/* New Games Icon */}
        <DesktopIcon icon={Trash2} label="Trash" onClick={handleTrashClick} />
      </div>

      {/* Active Windows */}
      {windowStates.essays.isOpen && (
        <Window
          title="My Essays" // Updated title
          onClose={() => closeWindow('essays')}
          initialPosition={{ x: 50, y: 50 }}
          zIndex={windowStates.essays.zIndex}
          onFocus={() => focusWindow('essays')}
        >
          <EssaysApp onClose={() => closeWindow('essays')} />
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
      {windowStates.games.isOpen && (
        <Window
          title="Games"
          onClose={() => closeWindow('games')}
          initialPosition={{ x: 450, y: 250 }}
          zIndex={windowStates.games.zIndex}
          onFocus={() => focusWindow('games')}
        >
          <GamesApp onClose={() => closeWindow('games')} />
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