import React from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface BalanceDisplayProps {
  showDetails?: boolean;
}

export function BalanceDisplay({ showDetails = true }: BalanceDisplayProps) {
  const { account } = useAuth();

  if (!account) return null;

  const remainingLimit = account.daily_limit - account.daily_withdrawn;
  const limitUsedPercent = (account.daily_withdrawn / account.daily_limit) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="atm-card animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Available Balance</p>
          <p className="text-2xl font-bold text-foreground font-mono">
            {formatCurrency(account.balance)}
          </p>
        </div>
      </div>

      {showDetails && (
        <div className="space-y-4 pt-4 border-t border-border">
          {/* Daily Limit Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Daily Withdrawal Limit</span>
              <span className="font-medium text-foreground">
                {formatCurrency(remainingLimit)} remaining
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  limitUsedPercent > 80 ? 'bg-destructive' : 
                  limitUsedPercent > 50 ? 'bg-warning' : 'bg-success'
                )}
                style={{ width: `${limitUsedPercent}%` }}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-destructive" />
                <span className="text-xs text-muted-foreground">Today's Withdrawals</span>
              </div>
              <p className="text-sm font-semibold mt-1 font-mono">
                {formatCurrency(account.daily_withdrawn)}
              </p>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-xs text-muted-foreground">Daily Limit</span>
              </div>
              <p className="text-sm font-semibold mt-1 font-mono">
                {formatCurrency(account.daily_limit)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
