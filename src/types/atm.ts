export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface Account {
  id: number;
  user_id: number;
  account_number: string;
  balance: number;
  daily_limit: number;
  daily_withdrawn: number;
  created_at: string;
}

export interface Transaction {
  id: number;
  account_id: number;
  type: 'withdrawal' | 'deposit' | 'transfer';
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export interface Receipt {
  id: number;
  transaction_id: number;
  receipt_number: string;
  content: string;
  created_at: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  account?: Account;
  message?: string;
}

export interface TransactionResponse {
  success: boolean;
  transaction?: Transaction;
  receipt?: Receipt;
  new_balance?: number;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}
