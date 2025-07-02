import React, { useState } from 'react';
import { PixelButton } from './PixelButton';

interface SimpleCalculatorProps {
  onClose: () => void;
}

const SimpleCalculator: React.FC<SimpleCalculatorProps> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const handleNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const handleEqual = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  return (
    <div className="p-4 bg-mac-light-gray mac-system-font h-full">
      {/* Display */}
      <div className="bg-mac-white mac-border-inset p-3 mb-4 text-right">
        <div className="text-2xl font-bold text-mac-black pixel-font min-h-[40px] flex items-center justify-end">
          {display}
        </div>
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-2">
        {/* Row 1 */}
        <PixelButton 
          onClick={handleClear}
          variant="default"
          className="bg-mac-medium-gray hover:bg-mac-dark-gray hover:text-mac-white text-mac-black font-bold py-3"
        >
          C
        </PixelButton>
        <PixelButton 
          onClick={() => {}}
          variant="default"
          className="bg-mac-medium-gray hover:bg-mac-dark-gray hover:text-mac-white text-mac-black font-bold py-3"
        >
          ±
        </PixelButton>
        <PixelButton 
          onClick={() => {}}
          variant="default"
          className="bg-mac-medium-gray hover:bg-mac-dark-gray hover:text-mac-white text-mac-black font-bold py-3"
        >
          %
        </PixelButton>
        <PixelButton 
          onClick={() => handleOperation('/')}
          variant="default"
          className="bg-mac-dark-gray hover:bg-mac-black text-mac-white font-bold py-3"
        >
          ÷
        </PixelButton>

        {/* Row 2 */}
        <PixelButton 
          onClick={() => handleNumber('7')}
          variant="default"
          className="bg-mac-white hover:bg-mac-light-gray text-mac-black font-bold py-3"
        >
          7
        </PixelButton>
        <PixelButton 
          onClick={() => handleNumber('8')}
          variant="default"
          className="bg-mac-white hover:bg-mac-light-gray text-mac-black font-bold py-3"
        >
          8
        </PixelButton>
        <PixelButton 
          onClick={() => handleNumber('9')}
          variant="default"
          className="bg-mac-white hover:bg-mac-light-gray text-mac-black font-bold py-3"
        >
          9
        </PixelButton>
        <PixelButton 
          onClick={() => handleOperation('*')}
          variant="default"
          className="bg-mac-dark-gray hover:bg-mac-black text-mac-white font-bold py-3"
        >
          ×
        </PixelButton>

        {/* Row 3 */}
        <PixelButton 
          onClick={() => handleNumber('4')}
          variant="default"
          className="bg-mac-white hover:bg-mac-light-gray text-mac-black font-bold py-3"
        >
          4
        </PixelButton>
        <PixelButton 
          onClick={() => handleNumber('5')}
          variant="default"
          className="bg-mac-white hover:bg-mac-light-gray text-mac-black font-bold py-3"
        >
          5
        </PixelButton>
        <PixelButton 
          onClick={() => handleNumber('6')}
          variant="default"
          className="bg-mac-white hover:bg-mac-light-gray text-mac-black font-bold py-3"
        >
          6
        </PixelButton>
        <PixelButton 
          onClick={() => handleOperation('-')}
          variant="default"
          className="bg-mac-dark-gray hover:bg-mac-black text-mac-white font-bold py-3"
        >
          −
        </PixelButton>

        {/* Row 4 */}
        <PixelButton 
          onClick={() => handleNumber('1')}
          variant="default"
          className="bg-mac-white hover:bg-mac-light-gray text-mac-black font-bold py-3"
        >
          1
        </PixelButton>
        <PixelButton 
          onClick={() => handleNumber('2')}
          variant="default"
          className="bg-mac-white hover:bg-mac-light-gray text-mac-black font-bold py-3"
        >
          2
        </PixelButton>
        <PixelButton 
          onClick={() => handleNumber('3')}
          variant="default"
          className="bg-mac-white hover:bg-mac-light-gray text-mac-black font-bold py-3"
        >
          3
        </PixelButton>
        <PixelButton 
          onClick={() => handleOperation('+')}
          variant="default"
          className="bg-mac-dark-gray hover:bg-mac-black text-mac-white font-bold py-3"
        >
          +
        </PixelButton>

        {/* Row 5 */}
        <PixelButton 
          onClick={() => handleNumber('0')}
          variant="default"
          className="bg-mac-white hover:bg-mac-light-gray text-mac-black font-bold py-3 col-span-2"
        >
          0
        </PixelButton>
        <PixelButton 
          onClick={handleDecimal}
          variant="default"
          className="bg-mac-white hover:bg-mac-light-gray text-mac-black font-bold py-3"
        >
          .
        </PixelButton>
        <PixelButton 
          onClick={handleEqual}
          variant="default"
          className="bg-mac-dark-gray hover:bg-mac-black text-mac-white font-bold py-3"
        >
          =
        </PixelButton>
      </div>

      {/* Close button */}
      <div className="mt-4 text-center">
        <PixelButton 
          onClick={onClose}
          variant="default"
          className="bg-mac-medium-gray hover:bg-mac-dark-gray hover:text-mac-white text-mac-black font-bold px-6 py-2"
        >
          Close
        </PixelButton>
      </div>
    </div>
  );
};

export { SimpleCalculator }; 