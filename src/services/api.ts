import { LoginResponse, TransactionResponse, Transaction } from '@/types/atm';

// Configure this to your Flask backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private token: string | null = null;
  private refreshToken: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('atm_token', token);
    } else {
      localStorage.removeItem('atm_token');
    }
  }

  setRefreshToken(token: string | null) {
    this.refreshToken = token;
    if (token) {
      localStorage.setItem('atm_refresh_token', token);
    } else {
      localStorage.removeItem('atm_refresh_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('atm_token');
    }
    return this.token;
  }

  getRefreshToken(): string | null {
    if (!this.refreshToken) {
      this.refreshToken = localStorage.getItem('atm_refresh_token');
    }
    return this.refreshToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If unauthorized, try to refresh token once and retry
    if (response.status === 401) {
      const refreshed = await this.tryRefreshAccessToken();
      if (refreshed) {
        const retryHeaders: HeadersInit = {
          'Content-Type': 'application/json',
          ...(this.token && { Authorization: `Bearer ${this.token}` }),
          ...options.headers,
        };
        response = await fetch(url, { ...options, headers: retryHeaders });
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  private async tryRefreshAccessToken(): Promise<boolean> {
    const refresh = this.getRefreshToken();
    if (!refresh) return false;
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${refresh}` },
    });
    if (!res.ok) return false;
    try {
      const data = await res.json();
      if (data?.success && data?.token && data?.refresh_token) {
        this.setToken(data.token);
        this.setRefreshToken(data.refresh_token);
        return true;
      }
    } catch {}
    return false;
  }

  // Authentication
  async login(accountNumber: string, pin: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ account_number: accountNumber, pin }),
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
      this.setRefreshToken(null);
    }
  }

  async validateSession(): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/validate');
  }

  // Transactions
  async withdraw(amount: number): Promise<TransactionResponse> {
    return this.request<TransactionResponse>('/transactions/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async deposit(amount: number): Promise<TransactionResponse> {
    return this.request<TransactionResponse>('/transactions/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async getTransactionHistory(limit: number = 10): Promise<Transaction[]> {
    return this.request<Transaction[]>(`/transactions/history?limit=${limit}`);
  }

  async getBalance(): Promise<{ balance: number; daily_limit: number; daily_withdrawn: number }> {
    return this.request('/account/balance');
  }

  // Change PIN
  async changePin(currentPin: string, newPin: string): Promise<{ success: boolean; message: string }> {
    return this.request('/auth/change-pin', {
      method: 'POST',
      body: JSON.stringify({ current_pin: currentPin, new_pin: newPin }),
    });
  }

  // User Registration
  async createUser(payload: { name: string; email: string; phone: string; account_number: string; pin: string }): Promise<LoginResponse> {
    return this.request<LoginResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Admin listings
  async listUsers(limit = 20, offset = 0): Promise<import('@/types/atm').User[]> {
    return this.request(`/admin/users?limit=${limit}&offset=${offset}`);
  }
  async listAccounts(limit = 20, offset = 0): Promise<import('@/types/atm').Account[]> {
    return this.request(`/admin/accounts?limit=${limit}&offset=${offset}`);
  }
  async listTransactions(limit = 20, offset = 0): Promise<import('@/types/atm').Transaction[]> {
    return this.request(`/admin/transactions?limit=${limit}&offset=${offset}`);
  }
  async listReceipts(limit = 20, offset = 0): Promise<import('@/types/atm').Receipt[]> {
    return this.request(`/admin/receipts?limit=${limit}&offset=${offset}`);
  }

  async downloadReceiptPdf(receiptId: number): Promise<Blob> {
    const token = this.getToken();
    const headers: Record<string, string> = { Accept: 'application/pdf' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    let res = await fetch(`${API_BASE_URL}/receipts/${receiptId}/pdf`, { headers });
    if (res.status === 401 && await this.tryRefreshAccessToken()) {
      const retryHeaders: Record<string, string> = { Accept: 'application/pdf' };
      if (this.token) retryHeaders['Authorization'] = `Bearer ${this.token}`;
      res = await fetch(`${API_BASE_URL}/receipts/${receiptId}/pdf`, { headers: retryHeaders });
    }
    if (!res.ok) {
      throw new Error(`Failed to download receipt PDF (${res.status})`);
    }
    return await res.blob();
  }

  async downloadLatestReceiptPdf(): Promise<Blob> {
    const token = this.getToken();
    const headers: Record<string, string> = { Accept: 'application/pdf' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    let res = await fetch(`${API_BASE_URL}/receipts/latest/pdf`, { headers });
    if (res.status === 401 && await this.tryRefreshAccessToken()) {
      const retryHeaders: Record<string, string> = { Accept: 'application/pdf' };
      if (this.token) retryHeaders['Authorization'] = `Bearer ${this.token}`;
      res = await fetch(`${API_BASE_URL}/receipts/latest/pdf`, { headers: retryHeaders });
    }
    if (!res.ok) {
      throw new Error(`No latest receipt available (${res.status})`);
    }
    return await res.blob();
  }
}

export const api = new ApiService();
