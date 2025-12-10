import React, { useEffect, useState } from 'react';
import { History, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { Transaction } from '@/types/atm';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await api.getTransactionHistory(10);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="atm-card animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <History className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Transaction History</h2>
            <p className="text-sm text-muted-foreground">Last 10 transactions</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchTransactions}
          disabled={isLoading}
        >
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
        </Button>
      </div>

      {error && (
        <div className="text-center py-8">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="link" onClick={fetchTransactions} className="mt-2">
            Try again
          </Button>
        </div>
      )}

      {isLoading && !transactions.length && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg animate-pulse">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
              <div className="h-5 bg-muted rounded w-20" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && transactions.length === 0 && (
        <div className="text-center py-8">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No transactions yet</p>
        </div>
      )}

      {!error && transactions.length > 0 && (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center gap-3 p-3 bg-secondary/30 hover:bg-secondary/50 rounded-lg transition-colors"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  tx.type === 'deposit' ? 'bg-success/10' : 'bg-destructive/10'
                )}
              >
                {tx.type === 'deposit' ? (
                  <ArrowDownLeft className="w-5 h-5 text-success" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-destructive" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground capitalize">{tx.type}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {formatDate(tx.created_at)}
                </p>
              </div>
              
              <div className="text-right">
                <p
                  className={cn(
                    'font-semibold font-mono',
                    tx.type === 'deposit' ? 'text-success' : 'text-destructive'
                  )}
                >
                  {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  Bal: {formatCurrency(tx.balance_after)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
