import React, { useState } from 'react';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { PinInput } from './PinInput';

type Step = 'current' | 'new' | 'confirm';

export function ChangePinForm() {
  const [step, setStep] = useState<Step>('current');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCurrentPin = (pin: string) => {
    setCurrentPin(pin);
    setError('');
    setStep('new');
  };

  const handleNewPin = (pin: string) => {
    setNewPin(pin);
    setError('');
    setStep('confirm');
  };

  const handleConfirmPin = async (pin: string) => {
    if (pin !== newPin) {
      setError('PINs do not match. Please try again.');
      setStep('new');
      setNewPin('');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.changePin(currentPin, newPin);
      
      if (response.success) {
        toast({
          title: 'PIN Changed Successfully',
          description: 'Your PIN has been updated. Please use your new PIN for future transactions.',
        });
        
        // Reset form
        setStep('current');
        setCurrentPin('');
        setNewPin('');
      } else {
        setError(response.message || 'Failed to change PIN');
        setStep('current');
        setCurrentPin('');
        setNewPin('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change PIN');
      setStep('current');
      setCurrentPin('');
      setNewPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepInfo = () => {
    switch (step) {
      case 'current':
        return { title: 'Enter Current PIN', subtitle: 'Verify your identity' };
      case 'new':
        return { title: 'Enter New PIN', subtitle: 'Choose a 4-digit PIN' };
      case 'confirm':
        return { title: 'Confirm New PIN', subtitle: 'Re-enter your new PIN' };
    }
  };

  const { title, subtitle } = getStepInfo();

  return (
    <div className="atm-card animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Change PIN</h2>
          <p className="text-sm text-muted-foreground">Update your security PIN</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {(['current', 'new', 'confirm'] as Step[]).map((s, i) => (
          <React.Fragment key={s}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                step === s
                  ? 'bg-primary text-primary-foreground'
                  : s === 'current' || (s === 'new' && step !== 'current') || step === 'confirm'
                  ? 'bg-success text-success-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {s === 'current' && step !== 'current' ? '✓' : 
               s === 'new' && step === 'confirm' ? '✓' : i + 1}
            </div>
            {i < 2 && <div className="w-8 h-0.5 bg-muted" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="text-center mb-6">
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg mb-4 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <PinInput
        onComplete={
          step === 'current'
            ? handleCurrentPin
            : step === 'new'
            ? handleNewPin
            : handleConfirmPin
        }
        disabled={isLoading}
      />

      {step !== 'current' && (
        <button
          type="button"
          onClick={() => {
            if (step === 'new') {
              setStep('current');
              setCurrentPin('');
            } else {
              setStep('new');
              setNewPin('');
            }
            setError('');
          }}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
        >
          ← Go back
        </button>
      )}
    </div>
  );
}
