import React, { useState } from 'react';
import { Banknote, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Receipt as ReceiptModal } from '@/components/atm/Receipt';
import type { Transaction, Receipt } from '@/types/atm';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export function WithdrawForm() {
  const { account, updateAccount } = useAuth();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [recentTx, setRecentTx] = useState<Transaction | null>(null);
  const [recentReceipt, setRecentReceipt] = useState<Receipt | null>(null);

  if (!account) return null;

  const numericAmount = parseFloat(amount) || 0;
  const remainingLimit = account.daily_limit - account.daily_withdrawn;

  const validateAmount = (value: number): string | null => {
    if (value <= 0) return 'Please enter a valid amount';
    if (value > account.balance) return 'Insufficient balance';
    if (value > remainingLimit) return `Exceeds daily limit. Max: ₹${remainingLimit.toLocaleString()}`;
    if (value % 100 !== 0) return 'Amount must be in multiples of ₹100';
    if (value < 100) return 'Minimum withdrawal is ₹100';
    if (value > 25000) return 'Maximum single withdrawal is ₹25,000';
    return null;
  };

  const handleWithdraw = async () => {
    const validationError = validateAmount(numericAmount);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.withdraw(numericAmount);
      
      if (response.success && response.new_balance !== undefined) {
        updateAccount({
          ...account,
          balance: response.new_balance,
          daily_withdrawn: account.daily_withdrawn + numericAmount,
        });
        
        toast({
          title: 'Withdrawal Successful',
          description: `₹${numericAmount.toLocaleString()} has been withdrawn. Please collect your cash.`,
        });
        
        setAmount('');
        if (response.transaction && response.receipt) {
          setRecentTx(response.transaction);
          setRecentReceipt(response.receipt);
          setShowReceipt(true);
        }
      } else {
        setError(response.message || 'Withdrawal failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const amountError = numericAmount > 0 ? validateAmount(numericAmount) : null;

  return (
    <div className="atm-card animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Banknote className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Cash Withdrawal</h2>
          <p className="text-sm text-muted-foreground">Select or enter amount</p>
        </div>
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {QUICK_AMOUNTS.map((quickAmount) => {
          const isDisabled = quickAmount > account.balance || quickAmount > remainingLimit;
          return (
            <button
              key={quickAmount}
              onClick={() => !isDisabled && setAmount(quickAmount.toString())}
              disabled={isDisabled}
              className={cn(
                'py-3 rounded-lg text-sm font-medium transition-all',
                numericAmount === quickAmount
                  ? 'bg-primary text-primary-foreground'
                  : isDisabled
                  ? 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                  : 'bg-secondary text-secondary-foreground hover:bg-muted'
              )}
            >
              ₹{quickAmount.toLocaleString()}
            </button>
          );
        })}
      </div>

      {/* Custom Amount Input */}
      <div className="space-y-2 mb-4">
        <label className="text-sm text-muted-foreground">Or enter custom amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
          <Input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError('');
            }}
            placeholder="0"
            className="pl-8 text-lg font-mono"
            step="100"
            min="100"
          />
        </div>
      </div>

      {/* Validation Message */}
      {(error || amountError) && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg mb-4 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error || amountError}</p>
        </div>
      )}

      {/* Valid Amount Indicator */}
      {numericAmount > 0 && !amountError && !error && (
        <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg mb-4 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
          <p className="text-sm text-success">Amount is valid for withdrawal</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleWithdraw}
        disabled={isLoading || !!amountError || numericAmount <= 0}
        className="w-full"
      >
        {isLoading ? 'Processing...' : `Withdraw ₹${numericAmount.toLocaleString() || 0}`}
      </Button>
      {showReceipt && recentTx && recentReceipt && (
        <ReceiptModal
          transaction={recentTx}
          receipt={recentReceipt}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
