import React, { useState, useEffect, useRef } from 'react';
import { PixelButton } from './PixelButton';
import { cn } from '@/lib/utils';

interface TerminalAppProps {
  onClose: () => void;
}

interface TerminalEntry {
  command: string;
  output: string[];
  timestamp: string;
}

const TerminalApp: React.FC<TerminalAppProps> = ({ onClose }) => {
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<TerminalEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const commands: Record<string, () => string[]> = {
    help: () => [
      'Available commands:',
      '  about      - Learn about Andy',
      '  skills     - View technical skills',
      '  projects   - List recent projects',
      '  contact    - Get contact info',
      '  philosophy - Andy\'s work philosophy',
      '  music      - Current playlist vibes',
      '  energy     - Check big desk energy level',
      '  joke       - Random programming joke',
      '  clear      - Clear terminal',
      '  exit       - Close terminal'
    ],
    about: () => [
      'Andy Jung - Recent BC Grad & Builder',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      'Education: Finance, CS, Information Systems',
      'Status: Building cool stuff & looking for next adventure',
      'Location: Probably listening to music while coding',
      'Fun fact: Built this entire retro site because templates are boring'
    ],
    skills: () => [
      'Technical Arsenal:',
      '━━━━━━━━━━━━━━━━━',
      'Languages: JavaScript, TypeScript, Python, Java',
      'Frontend: React, Next.js, Tailwind CSS, HTML/CSS',
      'Backend: Node.js, FastAPI, Express',
      'Databases: MongoDB, PostgreSQL, Firebase',
      'Tools: Git, Docker, Figma, VS Code',
      'Soft Skills: Building in public, authentic communication',
      'Special Power: Making boring things fun'
    ],
    projects: () => [
      'Recent Projects:',
      '━━━━━━━━━━━━━━━━',
      '1. This Retro Portfolio Site',
      '   → Built because everyone else uses the same template',
      '   → Tech: React, TypeScript, Tailwind, Vintage Vibes',
      '',
      '2. FinTech Trading Dashboard',
      '   → Real-time data for $2M+ daily transactions',
      '   → Tech: React, Python, FastAPI, WebSockets',
      '',
      '3. Campus Food Tracker',
      '   → Helped 500+ BC students avoid dining hall lines',
      '   → Tech: React Native, Node.js, MongoDB'
    ],
    contact: () => [
      'Let\'s Connect:',
      '━━━━━━━━━━━━━━',
      'Email: andyjung@example.com',
      'LinkedIn: linkedin.com/in/andyjung',
      'GitHub: github.com/andyjung',
      'Twitter: @andyjung',
      '',
      'Best for: Real conversations, cool projects, coffee chats',
      'Response time: Usually within 24 hours (faster for cool stuff)'
    ],
    philosophy: () => [
      'Andy\'s Work Philosophy:',
      '━━━━━━━━━━━━━━━━━━━━━━',
      '• Authenticity > Corporate BS',
      '• Building cool stuff > Following templates',
      '• Passion > Prestige',
      '• Real impact > Fancy titles',
      '• Fun > Boring',
      '',
      '"Your portfolio should be like your favorite playlist:',
      ' uniquely yours and impossible to replicate."'
    ],
    music: () => [
      'Current Vibes:',
      '━━━━━━━━━━━━━━',
      '♪ Indie Electronic ♪',
      '♪ Lo-fi Hip Hop ♪',
      '♪ Synthwave ♪',
      '♪ Whatever keeps the energy up ♪',
      '',
      'Status: Curating the perfect coding playlist',
      'Big Desk Energy Level: Maximum'
    ],
    energy: () => [
      'Big Desk Energy Status:',
      '━━━━━━━━━━━━━━━━━━━━━━',
      'Energy Level: ████████████ 100%',
      'Authenticity: ████████████ 100%',
      'Corporate Speak: ░░░░░░░░░░░░ 0%',
      'Fun Factor: ████████████ Maximum',
      '',
      'Status: OPTIMAL',
      'Ready to build something amazing!'
    ],
    joke: () => {
      const jokes = [
        'Why do programmers prefer dark mode?\nBecause light attracts bugs!',
        'How many programmers does it take to change a light bulb?\nNone. That\'s a hardware problem.',
        'Why don\'t programmers like nature?\nIt has too many bugs.',
        'What do you call a programmer from Finland?\nNils.',
        'Why did the programmer quit his job?\nBecause he didn\'t get arrays.'
      ];
      return [jokes[Math.floor(Math.random() * jokes.length)]];
    },
    clear: () => {
      setCommandHistory([]);
      return [];
    },
    exit: () => {
      onClose();
      return [];
    }
  };

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    const timestamp = new Date().toLocaleTimeString();
    
    if (trimmedCmd === 'clear') {
      commands.clear();
      return;
    }

    if (trimmedCmd === 'exit') {
      commands.exit();
      return;
    }

    let output: string[];
    if (commands[trimmedCmd]) {
      output = commands[trimmedCmd]();
    } else if (trimmedCmd === '') {
      output = [];
    } else {
      output = [
        `Command '${trimmedCmd}' not found.`,
        'Type "help" for available commands.'
      ];
    }

    const newEntry: TerminalEntry = {
      command: cmd,
      output,
      timestamp
    };

    setCommandHistory(prev => [...prev, newEntry]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentCommand);
      setCurrentCommand('');
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex].command);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex < commandHistory.length - 1 
          ? historyIndex + 1 
          : -1;
        setHistoryIndex(newIndex);
        setCurrentCommand(newIndex === -1 ? '' : commandHistory[newIndex].command);
      }
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [commandHistory]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeEntry: TerminalEntry = {
      command: '',
      output: [
        'Andy Terminal v2.0.1',
        '━━━━━━━━━━━━━━━━━━━',
        'Welcome to my digital brain! 🧠',
        'Type "help" to see what I can do.',
        ''
      ],
      timestamp: new Date().toLocaleTimeString()
    };
    setCommandHistory([welcomeEntry]);
  }, []);

  return (
    <div className="p-3 mac-system-font text-mac-black flex flex-col h-full bg-mac-light-gray">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold mb-1">Terminal</h2>
        <div className="text-sm text-mac-dark-gray">Talk to my digital brain 🤖</div>
      </div>
      
      <div 
        ref={outputRef}
        className="flex-grow overflow-auto mac-border-inset bg-black p-3 mb-4 text-green-400 text-xs mac-system-font"
        style={{ fontFamily: 'Monaco, Menlo, monospace' }}
      >
        {commandHistory.map((entry, index) => (
          <div key={index} className="mb-2">
            {entry.command && (
              <div className="text-green-300">
                <span className="text-green-500">andy@portfolio:~$</span> {entry.command}
              </div>
            )}
            {entry.output.map((line, lineIndex) => (
              <div key={lineIndex} className="text-green-400 whitespace-pre-wrap">
                {line}
              </div>
            ))}
          </div>
        ))}
        
        <div className="flex">
          <span className="text-green-500">andy@portfolio:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyPress}
            className="bg-transparent border-none outline-none text-green-400 ml-1 flex-grow"
            style={{ fontFamily: 'Monaco, Menlo, monospace' }}
            autoFocus
          />
          <span className="text-green-400 animate-pulse">█</span>
        </div>
      </div>
      
      <div className="text-center">
        <PixelButton onClick={onClose} variant="default" className="px-6">
          Back to Desktop
        </PixelButton>
      </div>
    </div>
  );
};

export { TerminalApp };