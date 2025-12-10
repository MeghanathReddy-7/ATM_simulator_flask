import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  disabled?: boolean;
  error?: string;
}

export function PinInput({ length = 4, onComplete, disabled = false, error }: PinInputProps) {
  const [pin, setPin] = useState<string>('');

  const handleKeyPress = useCallback((digit: string) => {
    if (disabled) return;
    
    if (digit === 'clear') {
      setPin('');
      return;
    }
    
    if (digit === 'back') {
      setPin(prev => prev.slice(0, -1));
      return;
    }
    
    if (pin.length < length) {
      const newPin = pin + digit;
      setPin(newPin);
      
      if (newPin.length === length) {
        onComplete(newPin);
        setPin('');
      }
    }
  }, [pin, length, disabled, onComplete]);

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'];

  return (
    <div className="space-y-6">
      {/* PIN Display */}
      <div className="flex justify-center gap-3">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'pin-dot',
              i < pin.length && 'pin-dot-filled'
            )}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-center text-sm text-destructive animate-fade-in">
          {error}
        </p>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => handleKeyPress(key)}
            disabled={disabled}
            className={cn(
              'h-14 rounded-xl font-semibold text-lg transition-all',
              key === 'clear' || key === 'back'
                ? 'bg-secondary text-secondary-foreground hover:bg-muted text-sm'
                : 'bg-card border border-border text-foreground hover:bg-secondary',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {key === 'clear' ? 'Clear' : key === 'back' ? '←' : key}
          </button>
        ))}
      </div>
    </div>
  );
}
