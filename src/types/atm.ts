export interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  roles?: string[];
}

export interface Account {
  id: number;
  user_id: number;
  account_number: string;
  balance: number;
  daily_limit: number;
  daily_withdrawn: number;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  refresh_token?: string;
  user: User;
  account?: Account;
}

export interface Transaction {
  id: number;
  account_id: number;
  type: 'withdraw' | 'deposit' | 'withdrawal';
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export interface TransactionResponse {
  success: boolean;
  message?: string;
  balance: number;
  receipt_id?: number;
}

export interface Receipt {
  id: number;
  transaction_id: number;
  receipt_number: string;
  content: string;
  created_at: string;
}
