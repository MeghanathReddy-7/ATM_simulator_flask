import React, { useState } from 'react';
import { PiggyBank, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { Receipt as ReceiptModal } from '@/components/atm/Receipt';
import type { Transaction, Receipt } from '@/types/atm';

export function DepositForm() {
  const { account, updateAccount } = useAuth();
  const [amount, setAmount] = useState<string>(''); // State for deposit amount
  const [isLoading, setIsLoading] = useState<boolean>(false); // State for loading state
  const [error, setError] = useState<string>(''); // State for error messages
  const [showReceipt, setShowReceipt] = useState(false);
  const [recentTx, setRecentTx] = useState<Transaction | null>(null);
  const [recentReceipt, setRecentReceipt] = useState<Receipt | null>(null);

  // If account is not available, return nothing
  if (!account) return null;

  // Convert the entered amount to a number
  const numericAmount = parseFloat(amount) || 0;

  // Validate the deposit amount
  const validateAmount = (value: number): string | null => {
    if (value <= 0) return 'Please enter a valid amount';
    if (value % 100 !== 0) return 'Amount must be in multiples of ₹100';
    if (value < 100) return 'Minimum deposit is ₹100';
    if (value > 200000) return 'Maximum single deposit is ₹2,00,000';
    return null;
  };

  // Handle deposit action
  const handleDeposit = async () => {
    const validationError = validateAmount(numericAmount);

    if (validationError) {
      setError(validationError); // Show validation error
      return;
    }

    setIsLoading(true); // Set loading state to true
    setError(''); // Reset error message

    try {
      // Call the deposit API function
      const response = await api.deposit(numericAmount);
      console.log(response); // Log the response to check its structure

      if (response.success && response.new_balance !== undefined) {
        console.log('Old balance:', account.balance);
        console.log('New balance:', response.new_balance);

        // Update the account balance if the deposit was successful
        updateAccount({
          ...account,
          balance: response.new_balance,
        });

        // Show success message
        toast({
          title: 'Deposit Successful',
          description: `₹${numericAmount.toLocaleString()} has been deposited to your account.`,
        });

        // Reset the amount field after successful deposit
        setAmount('');
        if (response.transaction && response.receipt) {
          setRecentTx(response.transaction);
          setRecentReceipt(response.receipt);
          setShowReceipt(true);
        }
      } else {
        console.log('Deposit failed', response.message);
        setError(response.message || 'Deposit failed'); // Handle failure
      }
    } catch (err) {
      console.log('Transaction error:', err);
      setError(err instanceof Error ? err.message : 'Transaction failed'); // Handle errors
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // Check if there's an amount error
  const amountError = numericAmount > 0 ? validateAmount(numericAmount) : null;

  return (
    <div className="atm-card animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
          <PiggyBank className="w-5 h-5 text-success" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Cash Deposit</h2>
          <p className="text-sm text-muted-foreground">Enter amount to deposit</p>
        </div>
      </div>

      {/* Amount Input Field */}
      <div className="space-y-2 mb-4">
        <label className="text-sm text-muted-foreground">Deposit Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
          <Input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value); // Update the amount as user types
              setError(''); // Clear any existing error
            }}
            placeholder="0"
            className="pl-8 text-lg font-mono"
            step="100"
            min="100"
          />
        </div>
      </div>

      {/* Validation Error Messages */}
      {(error || amountError) && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg mb-4 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error || amountError}</p>
        </div>
      )}

      {/* Success Indicator */}
      {numericAmount > 0 && !amountError && !error && (
        <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg mb-4 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
          <p className="text-sm text-success">Ready to deposit</p>
        </div>
      )}

      {/* Deposit Button */}
     <Button
          onClick={handleDeposit} // Trigger deposit function
          disabled={isLoading || !!amountError || numericAmount <= 0} // Disable if loading, error or invalid amount
          className="w-full bg-blue-500 text-white hover:bg-blue-600" // Blue background with white text, and darker blue on hover
        >
          {isLoading ? 'Processing...' : `Deposit ₹${numericAmount.toLocaleString() || 0}`} {/* Show loading text or formatted amount */}
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
