import React, { useState } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Window } from '@/components/Window';
import { EssaysApp } from '@/components/EssaysApp';
import { AboutApp } from '@/components/AboutApp';
import { MyComputerApp } from '@/components/MyComputerApp';
import { NotesApp } from '@/components/NotesApp';
import { GamesApp } from '@/components/GamesApp';
import { CalculatorApp } from '@/components/CalculatorApp'; // Import CalculatorApp
import { MenuBar } from '@/components/MenuBar';
import { SystemTray } from '@/components/SystemTray';
import { DesktopIcon } from '@/components/DesktopIcon';
import { FileText, User, Monitor, Trash2, NotebookText, Gamepad2, Calculator } from 'lucide-react'; // Added Calculator icon
import { toast } from 'sonner';

type WindowName = 'essays' | 'about' | 'myComputer' | 'notes' | 'games' | 'calculator'; // Added 'calculator'

interface WindowState {
  isOpen: boolean;
  zIndex: number;
}

const Index = () => {
  const [windowStates, setWindowStates] = useState<Record<WindowName, WindowState>>({
    essays: { isOpen: false, zIndex: 10 },
    about: { isOpen: false, zIndex: 11 },
    myComputer: { isOpen: false, zIndex: 12 },
    notes: { isOpen: false, zIndex: 13 },
    games: { isOpen: false, zIndex: 14 },
    calculator: { isOpen: false, zIndex: 15 }, // Initial z-index for Calculator
  });

  const [maxZIndex, setMaxZIndex] = useState(15); // Updated max z-index

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
        <DesktopIcon icon={FileText} label="My Essays" onClick={() => openWindow('essays')} />
        <DesktopIcon icon={User} label="About Me" onClick={() => openWindow('about')} />
        <DesktopIcon icon={Monitor} label="My Computer" onClick={() => openWindow('myComputer')} />
        <DesktopIcon icon={NotebookText} label="Notes" onClick={() => openWindow('notes')} />
        <DesktopIcon icon={Gamepad2} label="Games" onClick={() => openWindow('games')} />
        <DesktopIcon icon={Calculator} label="Calculator" onClick={() => openWindow('calculator')} /> {/* New Calculator Icon */}
        <DesktopIcon icon={Trash2} label="Trash" onClick={handleTrashClick} />
      </div>

      {/* Active Windows */}
      {windowStates.essays.isOpen && (
        <Window
          title="My Essays"
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
      {windowStates.calculator.isOpen && (
        <Window
          title="Calculator"
          onClose={() => closeWindow('calculator')}
          initialPosition={{ x: 550, y: 300 }}
          zIndex={windowStates.calculator.zIndex}
          onFocus={() => focusWindow('calculator')}
        >
          <CalculatorApp onClose={() => closeWindow('calculator')} />
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