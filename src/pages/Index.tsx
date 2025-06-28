import React, { useState, useEffect } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Window } from '@/components/Window';
import { EssaysApp } from '@/components/EssaysApp';
import { AboutApp } from '@/components/AboutApp';
import { MyComputerApp } from '@/components/MyComputerApp';
import { GamesLauncherApp } from '@/components/GamesLauncherApp';
import { TicTacToe } from '@/components/TicTacToe';
import { SnakeGame } from '@/components/SnakeGame';
import { SudokuGame } from '@/components/SudokuGame';
import { SolitaireGame } from '@/components/SolitaireGame';
import { ContactApp } from '@/components/ContactApp';
import { WorkApp } from '@/components/WorkApp';
import { TerminalApp } from '@/components/TerminalApp';
import { MenuBar } from '@/components/MenuBar';
import { SystemTray } from '@/components/SystemTray';
import { DesktopIcon } from '@/components/DesktopIcon';
import { WelcomeWindow } from '@/components/WelcomeWindow'; // New import
import { FileText, User, Monitor, Trash2, Gamepad2, Mail, Briefcase, Terminal } from 'lucide-react';
import { toast } from 'sonner';

type WindowName = 'essays' | 'about' | 'myComputer' | 'gamesLauncher' | 'ticTacToe' | 'snake' | 'sudoku' | 'solitaire' | 'contact' | 'work' | 'terminal' | 'welcome'; // Added 'welcome'

interface WindowState {
  isOpen: boolean;
  zIndex: number;
}

const Index = () => {
  const [windowStates, setWindowStates] = useState<Record<WindowName, WindowState>>({
    essays: { isOpen: false, zIndex: 10 },
    about: { isOpen: false, zIndex: 11 },
    myComputer: { isOpen: false, zIndex: 12 },
    gamesLauncher: { isOpen: false, zIndex: 13 },
    ticTacToe: { isOpen: false, zIndex: 14 },
    snake: { isOpen: false, zIndex: 15 },
    sudoku: { isOpen: false, zIndex: 16 },
    solitaire: { isOpen: false, zIndex: 17 },
    contact: { isOpen: false, zIndex: 18 },
    work: { isOpen: false, zIndex: 19 },
    terminal: { isOpen: false, zIndex: 20 },
    welcome: { isOpen: true, zIndex: 21 }, // Welcome window starts open
  });

  const [maxZIndex, setMaxZIndex] = useState(21); // Updated max z-index

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
      <MenuBar onOpenAbout={() => openWindow('about')} />

      {/* Desktop Icons */}
      <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-2 auto-rows-min items-start">
        <DesktopIcon icon={FileText} label="My Essays" onClick={() => openWindow('essays')} />
        <DesktopIcon icon={User} label="About Me" onClick={() => openWindow('about')} />
        <DesktopIcon icon={Monitor} label="My Computer" onClick={() => openWindow('myComputer')} />
        <DesktopIcon icon={Gamepad2} label="Games" onClick={() => openWindow('gamesLauncher')} />
        <DesktopIcon icon={Mail} label="Contact" onClick={() => openWindow('contact')} />
        <DesktopIcon icon={Briefcase} label="My Work" onClick={() => openWindow('work')} />
        <DesktopIcon icon={Terminal} label="Terminal" onClick={() => openWindow('terminal')} />
        <DesktopIcon icon={Trash2} label="Trash" onClick={handleTrashClick} />
      </div>

      {/* Active Windows */}
      {windowStates.welcome.isOpen && (
        <Window
          title="Welcome"
          onClose={() => closeWindow('welcome')}
          initialPosition={{ x: 200, y: 150 }}
          zIndex={windowStates.welcome.zIndex}
          onFocus={() => focusWindow('welcome')}
        >
          <WelcomeWindow onClose={() => closeWindow('welcome')} />
        </Window>
      )}
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
      {windowStates.gamesLauncher.isOpen && (
        <Window
          title="Games Launcher"
          onClose={() => closeWindow('gamesLauncher')}
          initialPosition={{ x: 350, y: 200 }}
          zIndex={windowStates.gamesLauncher.zIndex}
          onFocus={() => focusWindow('gamesLauncher')}
        >
          <GamesLauncherApp
            onClose={() => closeWindow('gamesLauncher')}
            onLaunchGame={(gameName) => openWindow(gameName)}
          />
        </Window>
      )}
      {windowStates.ticTacToe.isOpen && (
        <Window
          title="Tic-Tac-Toe"
          onClose={() => closeWindow('ticTacToe')}
          initialPosition={{ x: 400, y: 250 }}
          zIndex={windowStates.ticTacToe.zIndex}
          onFocus={() => focusWindow('ticTacToe')}
        >
          <TicTacToe />
        </Window>
      )}
      {windowStates.snake.isOpen && (
        <Window
          title="Snake"
          onClose={() => closeWindow('snake')}
          initialPosition={{ x: 450, y: 300 }}
          zIndex={windowStates.snake.zIndex}
          onFocus={() => focusWindow('snake')}
        >
          <SnakeGame onClose={() => closeWindow('snake')} />
        </Window>
      )}
      {windowStates.sudoku.isOpen && (
        <Window
          title="Sudoku"
          onClose={() => closeWindow('sudoku')}
          initialPosition={{ x: 500, y: 350 }}
          zIndex={windowStates.sudoku.zIndex}
          onFocus={() => focusWindow('sudoku')}
        >
          <SudokuGame onClose={() => closeWindow('sudoku')} />
        </Window>
      )}
      {windowStates.solitaire.isOpen && (
        <Window
          title="Solitaire"
          onClose={() => closeWindow('solitaire')}
          initialPosition={{ x: 550, y: 400 }}
          zIndex={windowStates.solitaire.zIndex}
          onFocus={() => focusWindow('solitaire')}
        >
          <SolitaireGame onClose={() => closeWindow('solitaire')} />
        </Window>
      )}
      {windowStates.contact.isOpen && (
        <Window
          title="Contact Me"
          onClose={() => closeWindow('contact')}
          initialPosition={{ x: 600, y: 450 }}
          zIndex={windowStates.contact.zIndex}
          onFocus={() => focusWindow('contact')}
        >
          <ContactApp onClose={() => closeWindow('contact')} />
        </Window>
      )}
      {windowStates.work.isOpen && (
        <Window
          title="My Work"
          onClose={() => closeWindow('work')}
          initialPosition={{ x: 650, y: 500 }}
          zIndex={windowStates.work.zIndex}
          onFocus={() => focusWindow('work')}
        >
          <WorkApp onClose={() => closeWindow('work')} />
        </Window>
      )}
      {windowStates.terminal.isOpen && (
        <Window
          title="Terminal"
          onClose={() => closeWindow('terminal')}
          initialPosition={{ x: 700, y: 550 }}
          zIndex={windowStates.terminal.zIndex}
          onFocus={() => focusWindow('terminal')}
        >
          <TerminalApp onClose={() => closeWindow('terminal')} />
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