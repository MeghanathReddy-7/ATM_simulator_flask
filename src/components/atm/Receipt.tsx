import React, { useRef } from 'react';
import { Receipt as ReceiptIcon, Printer, Download, X } from 'lucide-react';
import { Transaction, Receipt as ReceiptType } from '@/types/atm';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

interface ReceiptProps {
  transaction: Transaction;
  receipt: ReceiptType;
  onClose: () => void;
}

export function Receipt({ transaction, receipt, onClose }: ReceiptProps) {
  const { user, account } = useAuth();
  const receiptRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const blob = await api.downloadReceiptPdf(receipt.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receipt.receipt_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      // fallback to text download
      const content = receiptRef.current?.innerText || '';
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receipt.receipt_number}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const { date, time } = formatDate(transaction.created_at);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="w-full max-w-sm bg-card rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-foreground">
            <ReceiptIcon className="w-5 h-5" />
            <span className="font-semibold">Transaction Receipt</span>
          </div>
          <button
            onClick={onClose}
            className="text-primary-foreground/80 hover:text-primary-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Content */}
        <div ref={receiptRef} className="p-6 font-mono text-sm">
          <div className="text-center mb-6">
            <p className="text-lg font-bold text-foreground">ATM SIMULATOR</p>
            <p className="text-muted-foreground text-xs">SECURE BANKING</p>
          </div>

          <div className="border-t border-dashed border-border py-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Receipt No:</span>
              <span className="text-foreground">{receipt.receipt_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="text-foreground">{date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span className="text-foreground">{time}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-border py-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account:</span>
              <span className="text-foreground">
                ****{account?.account_number.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="text-foreground">{user?.name}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-border py-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction:</span>
              <span className="text-foreground uppercase">{transaction.type}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span className="text-muted-foreground">Amount:</span>
              <span className={transaction.type === 'deposit' ? 'text-success' : 'text-foreground'}>
                {formatCurrency(transaction.amount)}
              </span>
            </div>
          </div>

          <div className="border-t border-dashed border-border py-4">
            <div className="flex justify-between font-bold">
              <span className="text-muted-foreground">Balance:</span>
              <span className="text-foreground">{formatCurrency(transaction.balance_after)}</span>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground mt-4">
            <p>Thank you for banking with us!</p>
            <p>Please retain this receipt for your records.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-secondary/50 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
