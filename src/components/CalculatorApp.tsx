import React, { useState } from 'react';
import { PixelButton } from './PixelButton';
import { cn } from '@/lib/utils';

interface CalculatorAppProps {
  onClose: () => void;
}

const CalculatorApp: React.FC<CalculatorAppProps> = ({ onClose }) => {
  const [display, setDisplay] = useState<string>('0');
  const [currentValue, setCurrentValue] = useState<string>('');
  const [operator, setOperator] = useState<string | null>(null);
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [resetDisplay, setResetDisplay] = useState<boolean>(false);

  const handleNumberClick = (num: string) => {
    if (resetDisplay) {
      setDisplay(num);
      setCurrentValue(num);
      setResetDisplay(false);
    } else {
      setDisplay(prev => (prev === '0' ? num : prev + num));
      setCurrentValue(prev => (prev === '0' ? num : prev + num));
    }
  };

  const handleOperatorClick = (op: string) => {
    if (currentValue === '') return;

    if (prevValue !== null && operator !== null) {
      const result = calculate();
      setPrevValue(result.toString());
      setDisplay(result.toString());
    } else {
      setPrevValue(currentValue);
    }
    setOperator(op);
    setCurrentValue('');
    setResetDisplay(true);
  };

  const handleEqualsClick = () => {
    if (prevValue === null || operator === null || currentValue === '') return;
    const result = calculate();
    setDisplay(result.toString());
    setCurrentValue(result.toString());
    setPrevValue(null);
    setOperator(null);
    setResetDisplay(true);
  };

  const calculate = (): number => {
    const num1 = parseFloat(prevValue || '0');
    const num2 = parseFloat(currentValue || '0');

    switch (operator) {
      case '+':
        return num1 + num2;
      case '-':
        return num1 - num2;
      case '*':
        return num1 * num2;
      case '/':
        return num1 / num2;
      default:
        return num2;
    }
  };

  const handleClearClick = () => {
    setDisplay('0');
    setCurrentValue('');
    setOperator(null);
    setPrevValue(null);
    setResetDisplay(false);
  };

  const buttonClasses = "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg font-bold mac-border-outset active:mac-border-inset bg-mac-light-gray text-mac-black";
  const operatorButtonClasses = "bg-mac-medium-gray text-mac-black";

  return (
    <div className="p-2 font-sans text-mac-black flex flex-col items-center">
      <h2 className="text-lg font-bold mb-4">Calculator</h2>
      <div className="mac-border-inset bg-mac-dark-gray p-2 mb-4 w-full max-w-[240px]">
        <div className="bg-mac-black text-mac-white text-right p-2 text-xl font-pixel overflow-hidden whitespace-nowrap">
          {display}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1 w-full max-w-[240px]">
        <PixelButton onClick={handleClearClick} className={cn(buttonClasses, "col-span-3", operatorButtonClasses)}>C</PixelButton>
        <PixelButton onClick={() => handleOperatorClick('/')} className={cn(buttonClasses, operatorButtonClasses)}>/</PixelButton>

        <PixelButton onClick={() => handleNumberClick('7')} className={buttonClasses}>7</PixelButton>
        <PixelButton onClick={() => handleNumberClick('8')} className={buttonClasses}>8</PixelButton>
        <PixelButton onClick={() => handleNumberClick('9')} className={buttonClasses}>9</PixelButton>
        <PixelButton onClick={() => handleOperatorClick('*')} className={cn(buttonClasses, operatorButtonClasses)}>*</PixelButton>

        <PixelButton onClick={() => handleNumberClick('4')} className={buttonClasses}>4</PixelButton>
        <PixelButton onClick={() => handleNumberClick('5')} className={buttonClasses}>5</PixelButton>
        <PixelButton onClick={() => handleNumberClick('6')} className={buttonClasses}>6</PixelButton>
        <PixelButton onClick={() => handleOperatorClick('-')} className={cn(buttonClasses, operatorButtonClasses)}>-</PixelButton>

        <PixelButton onClick={() => handleNumberClick('1')} className={buttonClasses}>1</PixelButton>
        <PixelButton onClick={() => handleNumberClick('2')} className={buttonClasses}>2</PixelButton>
        <PixelButton onClick={() => handleNumberClick('3')} className={buttonClasses}>3</PixelButton>
        <PixelButton onClick={() => handleOperatorClick('+')} className={cn(buttonClasses, operatorButtonClasses)}>+</PixelButton>

        <PixelButton onClick={() => handleNumberClick('0')} className={cn(buttonClasses, "col-span-2")}>0</PixelButton>
        <PixelButton onClick={() => handleNumberClick('.')} className={buttonClasses}>.</PixelButton>
        <PixelButton onClick={handleEqualsClick} className={cn(buttonClasses, operatorButtonClasses)}>=</PixelButton>
      </div>
      <div className="mt-6 text-right w-full max-w-[240px]">
        <PixelButton onClick={onClose} variant="default">Close Calculator</PixelButton>
      </div>
    </div>
  );
};

export { CalculatorApp };