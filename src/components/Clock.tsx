import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon, Play, Pause, RotateCcw, Coffee, Target, Settings, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelButton } from './PixelButton';

interface ClockProps {
  className?: string;
}

type TimerMode = 'work' | 'break' | 'longBreak';

interface TimerSettings {
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
}

const Clock: React.FC<ClockProps> = ({ className }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [timerMode, setTimerMode] = useState<TimerMode>('work');
  const [sessions, setSessions] = useState(0);
  
  const [settings, setSettings] = useState<TimerSettings>({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15
  });

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Pomodoro timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished
      setTimerActive(false);
      
      if (timerMode === 'work') {
        setSessions(prev => prev + 1);
        if (sessions + 1 >= 4) {
          // Long break after 4 sessions
          setTimerMode('longBreak');
          setTimeLeft(settings.longBreakDuration * 60);
          setSessions(0);
        } else {
          // Short break
          setTimerMode('break');
          setTimeLeft(settings.breakDuration * 60);
        }
      } else {
        // Back to work
        setTimerMode('work');
        setTimeLeft(settings.workDuration * 60);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft, timerMode, sessions, settings]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrentTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleClockClick = () => {
    setShowPomodoro(!showPomodoro);
    setShowSettings(false);
  };

  const handleTimerToggle = () => {
    setTimerActive(!timerActive);
  };

  const handleTimerReset = () => {
    setTimerActive(false);
    setTimerMode('work');
    setTimeLeft(settings.workDuration * 60);
    setSessions(0);
  };

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
  };

  const updateSetting = (key: keyof TimerSettings, increment: boolean) => {
    setSettings(prev => {
      const currentValue = prev[key];
      const newValue = increment 
        ? Math.min(currentValue + 1, 60) // Max 60 minutes
        : Math.max(currentValue - 1, 1);  // Min 1 minute
      
      const newSettings = { ...prev, [key]: newValue };
      
      // Update current timer if not active and matches the mode
      if (!timerActive) {
        if (key === 'workDuration' && timerMode === 'work') {
          setTimeLeft(newValue * 60);
        } else if (key === 'breakDuration' && timerMode === 'break') {
          setTimeLeft(newValue * 60);
        } else if (key === 'longBreakDuration' && timerMode === 'longBreak') {
          setTimeLeft(newValue * 60);
        }
      }
      
      return newSettings;
    });
  };

  const getTimerIcon = () => {
    switch (timerMode) {
      case 'work':
        return <Target size={16} className="text-red-600" />;
      case 'break':
      case 'longBreak':
        return <Coffee size={16} className="text-green-600" />;
      default:
        return <ClockIcon size={16} />;
    }
  };

  const getTimerModeText = () => {
    switch (timerMode) {
      case 'work':
        return 'Work';
      case 'break':
        return 'Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Pomodoro';
    }
  };

  if (showPomodoro) {
    return (
      <div className={cn("relative", className)}>
        {showSettings && (
          <div className="absolute bottom-full right-0 mb-2 bg-mac-light-gray mac-border-outset p-3 shadow-lg rounded-none min-w-[220px] z-[60]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm mac-system-font font-bold">Timer Settings</span>
              <PixelButton
                variant="secondary"
                className="w-6 h-6 p-0 text-xs"
                onClick={() => setShowSettings(false)}
              >
                ×
              </PixelButton>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs mac-system-font">Work:</span>
                <div className="flex items-center space-x-1">
                  <PixelButton
                    variant="secondary"
                    className="w-6 h-6 p-0 text-xs"
                    onClick={() => updateSetting('workDuration', false)}
                  >
                    <Minus size={10} />
                  </PixelButton>
                  <span className="text-xs mac-system-font min-w-[24px] text-center">
                    {settings.workDuration}m
                  </span>
                  <PixelButton
                    variant="secondary"
                    className="w-6 h-6 p-0 text-xs"
                    onClick={() => updateSetting('workDuration', true)}
                  >
                    <Plus size={10} />
                  </PixelButton>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs mac-system-font">Break:</span>
                <div className="flex items-center space-x-1">
                  <PixelButton
                    variant="secondary"
                    className="w-6 h-6 p-0 text-xs"
                    onClick={() => updateSetting('breakDuration', false)}
                  >
                    <Minus size={10} />
                  </PixelButton>
                  <span className="text-xs mac-system-font min-w-[24px] text-center">
                    {settings.breakDuration}m
                  </span>
                  <PixelButton
                    variant="secondary"
                    className="w-6 h-6 p-0 text-xs"
                    onClick={() => updateSetting('breakDuration', true)}
                  >
                    <Plus size={10} />
                  </PixelButton>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs mac-system-font">Long Break:</span>
                <div className="flex items-center space-x-1">
                  <PixelButton
                    variant="secondary"
                    className="w-6 h-6 p-0 text-xs"
                    onClick={() => updateSetting('longBreakDuration', false)}
                  >
                    <Minus size={10} />
                  </PixelButton>
                  <span className="text-xs mac-system-font min-w-[24px] text-center">
                    {settings.longBreakDuration}m
                  </span>
                  <PixelButton
                    variant="secondary"
                    className="w-6 h-6 p-0 text-xs"
                    onClick={() => updateSetting('longBreakDuration', true)}
                  >
                    <Plus size={10} />
                  </PixelButton>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="absolute bottom-full right-0 mb-2 bg-mac-light-gray mac-border-outset p-3 shadow-lg rounded-none min-w-[200px] z-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {getTimerIcon()}
              <span className="text-sm mac-system-font font-bold">{getTimerModeText()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <PixelButton
                variant="secondary"
                className="w-6 h-6 p-0 text-xs"
                onClick={handleSettingsClick}
                title="Timer Settings"
              >
                <Settings size={12} />
              </PixelButton>
              <PixelButton
                variant="secondary"
                className="w-6 h-6 p-0 text-xs"
                onClick={handleClockClick}
              >
                ×
              </PixelButton>
            </div>
          </div>
          
          <div className="text-center mb-3">
            <div className="text-2xl mac-system-font font-bold text-mac-black">
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs text-mac-dark-gray mt-1">
              Session {sessions + 1}/4
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <PixelButton
              variant="primary"
              className="flex items-center space-x-1 text-xs px-2 py-1"
              onClick={handleTimerToggle}
            >
              {timerActive ? <Pause size={14} /> : <Play size={14} />}
              <span>{timerActive ? 'Pause' : 'Start'}</span>
            </PixelButton>
            
            <PixelButton
              variant="secondary"
              className="flex items-center space-x-1 text-xs px-2 py-1"
              onClick={handleTimerReset}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </PixelButton>
          </div>
          
          <div className="mt-2 text-xs text-mac-dark-gray text-center">
            <div>Work: {settings.workDuration}m • Break: {settings.breakDuration}m • Long: {settings.longBreakDuration}m</div>
          </div>
        </div>
        
        <PixelButton
          variant="secondary"
          className={cn(
            "text-xs mac-system-font px-2 py-1 min-w-[60px]",
            timerActive && "bg-red-100 hover:bg-red-200"
          )}
          onClick={handleClockClick}
        >
          {timerActive ? formatTime(timeLeft) : formatCurrentTime(currentTime)}
        </PixelButton>
      </div>
    );
  }

  return (
    <PixelButton
      variant="secondary"
      className={cn("text-xs mac-system-font px-2 py-1 min-w-[60px]", className)}
      onClick={handleClockClick}
      title="Click to open Pomodoro timer"
    >
      {formatCurrentTime(currentTime)}
    </PixelButton>
  );
};

export { Clock }; 