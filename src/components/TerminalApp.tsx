import React, { useState, useRef, useEffect } from 'react';
import { PixelButton } from './PixelButton';
import { cn } from '@/lib/utils';

interface TerminalAppProps {
  onClose: () => void;
}

interface TerminalLine {
  type: 'input' | 'output';
  text: string;
}

const TerminalApp: React.FC<TerminalAppProps> = ({ onClose }) => {
  const [input, setInput] = useState<string>('');
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const username = "guest";
  const hostname = "personal-mac";
  const prompt = `[${username}@${hostname} ~]$`;

  useEffect(() => {
    // Scroll to bottom on new output
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
    // Focus input when terminal opens or history changes
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [history]);

  const handleCommand = (command: string) => {
    const newHistory: TerminalLine[] = [...history, { type: 'input', text: `${prompt} ${command}` }];
    const [cmd, ...args] = command.trim().split(' ');

    let output = '';
    switch (cmd.toLowerCase()) {
      case 'help':
        output = `Available commands:
  help      - Show this help message
  whoami    - Display information about the user
  ls        - List directory contents (simulated)
  clear     - Clear the terminal screen
  echo [text] - Echoes the provided text`;
        break;
      case 'whoami':
        output = `You are logged in as '${username}' on '${hostname}'.
This is a simulated terminal for a personal website.`;
        break;
      case 'ls':
        output = `Applications/  Documents/  Games/  Essays/  Work/  Contact/  Trash/`;
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'echo':
        output = args.join(' ');
        break;
      case '':
        output = ''; // No output for empty command
        break;
      default:
        output = `Command not found: ${cmd}. Type 'help' for a list of commands.`;
    }

    if (output) {
      newHistory.push({ type: 'output', text: output });
    }
    setHistory(newHistory);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommand(input);
    }
  };

  return (
    <div className="p-1 font-mono text-mac-white flex flex-col h-full bg-mac-black mac-border-inset"> {/* Adjusted padding */}
      <h2 className="text-base mb-1 text-mac-white">Terminal</h2> {/* Adjusted font size, removed bold, adjusted margin */}
      <div
        ref={terminalRef}
        className="flex-grow overflow-y-auto text-xs p-1 bg-black text-green-400" // Classic terminal look, adjusted padding
        style={{ scrollbarWidth: 'none' }} // Hide scrollbar for cleaner look
      >
        {history.map((line, index) => (
          <pre key={index} className={cn(line.type === 'input' ? 'text-blue-300' : 'text-green-400', 'whitespace-pre-wrap')}>
            {line.text}
          </pre>
        ))}
      </div>
      <div className="mt-1 flex items-center"> {/* Adjusted margin-top */}
        <span className="text-blue-300 text-xs mr-0.5">{prompt}</span> {/* Adjusted margin */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow bg-black text-green-400 border-none outline-none text-xs"
          autoFocus
        />
      </div>
      <div className="mt-2 text-right"> {/* Adjusted margin-top */}
        <PixelButton onClick={onClose} variant="danger">Close Terminal</PixelButton>
      </div>
    </div>
  );
};

export { TerminalApp };