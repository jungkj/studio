import React from 'react';
import { HelpCircle, Flag, Settings, Info, Calculator, Clock, Folder, Power, RotateCcw, FolderPlus, FileText, Copy, Clipboard, Undo, Eye, List, Grid3x3, Trash2, Disc, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MenuBarProps {
  onOpenAbout: () => void;
  onOpenCalculator?: () => void;
  onOpenFinder?: () => void;
  onOpenClock?: () => void;
  onOpenSettings?: () => void;
  onRestart?: () => void;
  onShutdown?: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ 
  onOpenAbout, 
  onOpenCalculator,
  onOpenFinder,
  onOpenClock,
  onOpenSettings,
  onRestart,
  onShutdown
}) => {

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'calculator':
        onOpenCalculator?.();
        break;
      case 'finder':
        onOpenFinder?.();
        break;
      case 'clock':
        onOpenClock?.();
        break;
      case 'settings':
        onOpenSettings?.();
        break;
      case 'restart':
        if (onRestart) {
          onRestart();
        } else {
          if (window.confirm('Are you sure you want to restart? This will reload the page.')) {
            window.location.reload();
          }
        }
        break;
      case 'shutdown':
        if (onShutdown) {
          onShutdown();
        } else {
          if (window.confirm('Are you sure you want to shut down? This will close the application.')) {
            window.close();
          }
        }
        break;
      case 'new':
        alert('New Folder: This would create a new folder on the desktop');
        break;
      case 'open':
        alert('Open: This would open a file selection dialog');
        break;
      case 'close': {
        // Try to close the top window
        const windows = document.querySelectorAll('[data-window]');
        if (windows.length > 0) {
          const topWindow = windows[windows.length - 1];
          const closeButton = topWindow.querySelector('[data-close-button]');
          if (closeButton) {
            (closeButton as HTMLElement).click();
          }
        }
        break;
      }
      case 'undo':
        document.execCommand('undo');
        break;
      case 'copy':
        document.execCommand('copy');
        break;
      case 'paste':
        document.execCommand('paste');
        break;
      case 'icon-view':
        alert('View by Icon: Desktop icons arranged in icon view');
        break;
      case 'list-view':
        alert('View by List: Desktop icons arranged in list view');
        break;
      case 'clean-up':
        alert('Clean Up Desktop: Desktop icons have been organized');
        break;
      case 'red-label':
      case 'blue-label':
      case 'green-label':
        alert(`Label: Selected items labeled as ${action.replace('-label', '')}`);
        break;
      case 'empty-trash':
        if (window.confirm('Are you sure you want to empty the trash?')) {
          alert('Trash has been emptied');
        }
        break;
      case 'eject':
        alert('Eject: No disks to eject');
        break;
      case 'sleep':
        alert('Sleep: The system would go to sleep mode');
        break;
      default:
        console.log(`Menu action: ${action}`);
    }
  };

  return (
    <div className="relative">
      <div className={cn(
        "w-full h-8 sm:h-9 bg-mac-light-gray mac-border-inset",
        "flex items-center justify-between px-2 sm:px-3 text-mac-black mac-system-font",
        "select-none flex-shrink-0 shadow-sm"
      )}>
        {/* Left side: Apple logo and menu items */}
        <div className="flex items-center space-x-2 sm:space-x-4 h-full overflow-hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-1.5 py-1 interactive mac-border-outset hover:mac-border-inset flex items-center justify-center flex-shrink-0 text-sm font-bold">
                <img 
                  src="/applelogo.png" 
                  alt="Apple" 
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  style={{ imageRendering: 'pixelated' }}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mac-border-outset bg-mac-white text-mac-black mac-system-font font-bold">
              <DropdownMenuItem onClick={onOpenAbout} className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold">
                <Info className="w-4 h-4 mr-2" />
                About This Macintosh...
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-mac-dark-gray h-px" />
              <DropdownMenuItem 
                onClick={() => handleMenuAction('clock')} 
                className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold"
              >
                <Clock className="w-4 h-4 mr-2" />
                Alarm Clock
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleMenuAction('calculator')} 
                className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculator
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleMenuAction('finder')} 
                className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold"
              >
                <Folder className="w-4 h-4 mr-2" />
                Finder
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleMenuAction('settings')} 
                className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold"
              >
                <Settings className="w-4 h-4 mr-2" />
                Control Panel
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-mac-dark-gray h-px" />
              <DropdownMenuItem 
                onClick={() => handleMenuAction('restart')} 
                className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleMenuAction('shutdown')} 
                className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold"
              >
                <Power className="w-4 h-4 mr-2" />
                Shut Down
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Menu items with smaller, functional buttons */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-2 sm:px-3 py-1 interactive mac-border-outset hover:mac-border-inset text-sm font-bold text-container whitespace-nowrap">
                File
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mac-border-outset bg-mac-white text-mac-black mac-system-font font-bold">
              <DropdownMenuItem onClick={() => handleMenuAction('new')} className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold">
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuAction('open')} className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold">
                <FileText className="w-4 h-4 mr-2" />
                Open
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-mac-dark-gray h-px" />
              <DropdownMenuItem onClick={() => handleMenuAction('close')} className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold">
                Close Window
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-2 sm:px-3 py-1 interactive mac-border-outset hover:mac-border-inset text-sm font-bold text-container whitespace-nowrap">
                Edit
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mac-border-outset bg-mac-white text-mac-black mac-system-font font-bold">
              <DropdownMenuItem onClick={() => handleMenuAction('undo')} className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold">
                <Undo className="w-4 h-4 mr-2" />
                Undo
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-mac-dark-gray h-px" />
              <DropdownMenuItem onClick={() => handleMenuAction('copy')} className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuAction('paste')} className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold">
                <Clipboard className="w-4 h-4 mr-2" />
                Paste
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-2 sm:px-3 py-1 interactive mac-border-outset hover:mac-border-inset text-sm font-bold text-container whitespace-nowrap">
                View
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mac-border-outset bg-mac-white text-mac-black mac-system-font font-bold">
              <DropdownMenuItem onClick={() => handleMenuAction('icon-view')} className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold">
                <Grid3x3 className="w-4 h-4 mr-2" />
                by Icon
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuAction('list-view')} className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold">
                <List className="w-4 h-4 mr-2" />
                by List
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-mac-dark-gray h-px" />
              <DropdownMenuItem onClick={() => handleMenuAction('clean-up')} className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold">
                <Eye className="w-4 h-4 mr-2" />
                Clean Up Desktop
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-2 sm:px-3 py-1 interactive mac-border-outset hover:mac-border-inset text-sm font-bold text-container whitespace-nowrap hidden sm:inline-flex">
                Label
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mac-border-outset bg-mac-white text-mac-black mac-system-font font-bold">
              <DropdownMenuItem onClick={() => handleMenuAction('red-label')} className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                Red
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuAction('blue-label')} className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Blue
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuAction('green-label')} className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Green
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-2 sm:px-3 py-1 interactive mac-border-outset hover:mac-border-inset text-sm font-bold text-container whitespace-nowrap hidden md:inline-flex">
                Special
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mac-border-outset bg-mac-white text-mac-black mac-system-font font-bold">
              <DropdownMenuItem onClick={() => handleMenuAction('empty-trash')} className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold">
                <Trash2 className="w-4 h-4 mr-2" />
                Empty Trash
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuAction('eject')} className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold">
                <Disc className="w-4 h-4 mr-2" />
                Eject Disk
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-mac-dark-gray h-px" />
              <DropdownMenuItem onClick={() => handleMenuAction('sleep')} className="cursor-pointer hover:bg-mac-dark-gray hover:text-mac-white px-3 py-2 text-sm interactive font-bold">
                <Moon className="w-4 h-4 mr-2" />
                Sleep
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right side: System status indicators */}
        <div className="flex items-center h-full gap-2">
          <div className="text-xs font-bold text-mac-black">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export { MenuBar };