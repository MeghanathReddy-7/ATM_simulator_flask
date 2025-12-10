import React, { useState } from 'react';
import { 
  CreditCard, 
  Banknote, 
  PiggyBank, 
  History, 
  Settings, 
  LogOut,
  User,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BalanceDisplay } from './BalanceDisplay';
import { WithdrawForm } from './WithdrawForm';
import { DepositForm } from './DepositForm';
import { TransactionHistory } from './TransactionHistory';
import { ChangePinForm } from './ChangePinForm';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';

type View = 'home' | 'withdraw' | 'deposit' | 'history' | 'settings';

interface MenuItem {
  id: View;
  icon: React.ReactNode;
  label: string;
  description: string;
}

export function Dashboard() {
  const { user, account, logout } = useAuth();
  const [activeView, setActiveView] = useState<View>('home');

  const menuItems: MenuItem[] = [
    { id: 'withdraw', icon: <Banknote className="w-5 h-5" />, label: 'Withdraw', description: 'Cash withdrawal' },
    { id: 'deposit', icon: <PiggyBank className="w-5 h-5" />, label: 'Deposit', description: 'Add funds' },
    { id: 'history', icon: <History className="w-5 h-5" />, label: 'History', description: 'View transactions' },
    { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Settings', description: 'Change PIN' },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const renderContent = () => {
    switch (activeView) {
      case 'withdraw':
        return <WithdrawForm />;
      case 'deposit':
        return <DepositForm />;
      case 'history':
        return <TransactionHistory />;
      case 'settings':
        return <ChangePinForm />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">ATM Simulator</h1>
                <p className="text-xs text-muted-foreground">
                  Account: •••• {account?.account_number.slice(-4)}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* User Welcome */}
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <p className="font-semibold text-foreground">{user?.name}</p>
          </div>
        </div>

        {/* Balance Card */}
        <BalanceDisplay showDetails={activeView === 'home'} />

        {/* Quick Receipt Download */}
        {activeView === 'home' && (
          <div className="atm-card flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Need a receipt?</p>
              <p className="text-foreground text-sm">Download the latest transaction receipt</p>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const blob = await api.downloadLatestReceiptPdf();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `latest-receipt.pdf`;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch (e) { console.error(e); }
              }}
            >
              Download PDF
            </Button>
          </div>
        )}

        {/* Navigation Menu (Home View) */}
        {activeView === 'home' && (
          <div className="grid grid-cols-2 gap-3 animate-slide-up">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className="atm-card flex flex-col items-start gap-2 hover:border-primary/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Active View Content */}
        {activeView !== 'home' && (
          <>
            {/* Back Button */}
            <button
              onClick={() => setActiveView('home')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to menu
            </button>
            
            {/* Content */}
            {renderContent()}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border py-3">
        <p className="text-center text-xs text-muted-foreground">
          Secure Banking • All transactions are encrypted
        </p>
      </footer>
    </div>
  );
}
