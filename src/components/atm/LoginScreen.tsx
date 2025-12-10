import React, { useState } from 'react';
import { CreditCard, Shield } from 'lucide-react';
import { PinInput } from './PinInput';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function LoginScreen() {
  const { login } = useAuth();
  const [step, setStep] = useState<'account' | 'pin'>('account');
  const [accountNumber, setAccountNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountNumber.length >= 10) {
      setStep('pin');
      setError('');
    } else {
      setError('Please enter a valid account number');
    }
  };

  const handlePinComplete = async (pin: string) => {
    setIsLoading(true);
    setError('');
    
    const result = await login(accountNumber, pin);
    
    if (!result.success) {
      setError(result.message || 'Invalid PIN');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">ATM Simulator</h1>
          <p className="text-muted-foreground mt-1">Secure Banking Access</p>
        </div>

        {/* Card */}
        <div className="atm-card animate-slide-up">
          {step === 'account' ? (
            <form onSubmit={handleAccountSubmit} className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-foreground">Enter Account Number</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Please enter your 10-digit account number
                </p>
              </div>

              <div className="space-y-2">
                <Input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                    setAccountNumber(value);
                    setError('');
                  }}
                  placeholder="Account Number"
                  className="text-center text-lg tracking-wider font-mono"
                  autoFocus
                />
                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={accountNumber.length < 10}
              >
                Continue
              </Button>
              <a href="/register" className="w-full block text-center text-sm text-primary hover:text-primary/90">
                Create a new user
              </a>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Enter Your PIN</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Account: •••• {accountNumber.slice(-4)}
                </p>
              </div>

              <PinInput
                onComplete={handlePinComplete}
                disabled={isLoading}
                error={error}
              />

              <button
                type="button"
                onClick={() => {
                  setStep('account');
                  setError('');
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to account entry
              </button>
              <a href="/register" className="w-full block text-center text-sm text-primary hover:text-primary/90">
                Create a new user
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Secure connection • Your data is encrypted
        </p>
      </div>
    </div>
  );
}
