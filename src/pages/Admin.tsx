import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { User, Account, Transaction, Receipt } from "@/types/atm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const PAGE_SIZE = 20;

const Admin: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Auth gating (allow only logged-in admins; fallback to API errors)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const isAdmin = useMemo(() => {
    // Types don’t include role; rely on login payload or API errors.
    return (user as any)?.role === "admin";
  }, [user]);

  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state per section
  const [usersOffset, setUsersOffset] = useState(0);
  const [accountsOffset, setAccountsOffset] = useState(0);
  const [transactionsOffset, setTransactionsOffset] = useState(0);
  const [receiptsOffset, setReceiptsOffset] = useState(0);

  const fetchUsers = async (offset = 0) => {
    try {
      setError(null);
      const list = await api.listUsers(PAGE_SIZE, offset);
      setUsers(list);
      setUsersOffset(offset);
    } catch (e: any) {
      setError(e?.message || "Failed to load users");
    }
  };

  const fetchAccounts = async (offset = 0) => {
    try {
      setError(null);
      const list = await api.listAccounts(PAGE_SIZE, offset);
      setAccounts(list);
      setAccountsOffset(offset);
    } catch (e: any) {
      setError(e?.message || "Failed to load accounts");
    }
  };

  const fetchTransactions = async (offset = 0) => {
    try {
      setError(null);
      const list = await api.listTransactions(PAGE_SIZE, offset);
      setTransactions(list);
      setTransactionsOffset(offset);
    } catch (e: any) {
      setError(e?.message || "Failed to load transactions");
    }
  };

  const fetchReceipts = async (offset = 0) => {
    try {
      setError(null);
      const list = await api.listReceipts(PAGE_SIZE, offset);
      setReceipts(list);
      setReceiptsOffset(offset);
    } catch (e: any) {
      setError(e?.message || "Failed to load receipts");
    }
  };

  const initialLoad = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(0),
        fetchAccounts(0),
        fetchTransactions(0),
        fetchReceipts(0),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDownloadReceipt = async (receiptId: number) => {
    try {
      const blob = await api.downloadReceiptPdf(receiptId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${receiptId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message || "Failed to download receipt PDF");
    }
  };

  const formatLocal = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading) {
    return <div className="p-6">Loading admin data…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          {!isAdmin && (
            <div className="mb-4 text-sm text-red-600">
              Admin role required. Some actions may be restricted.
            </div>
          )}
          {error && (
            <div className="mb-4 text-sm text-red-600">{error}</div>
          )}
          <Tabs defaultValue="users">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="receipts">Receipts</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Users</h3>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => fetchUsers(usersOffset)}>Refresh</Button>
                  <Button onClick={() => fetchUsers(Math.max(0, usersOffset - PAGE_SIZE))}>Prev</Button>
                  <Button onClick={() => fetchUsers(usersOffset + PAGE_SIZE)}>Next</Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.id}</TableCell>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.phone}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="accounts">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Accounts</h3>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => fetchAccounts(accountsOffset)}>Refresh</Button>
                  <Button onClick={() => fetchAccounts(Math.max(0, accountsOffset - PAGE_SIZE))}>Prev</Button>
                  <Button onClick={() => fetchAccounts(accountsOffset + PAGE_SIZE)}>Next</Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Account #</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Daily Limit</TableHead>
                    <TableHead>Daily Withdrawn</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.id}</TableCell>
                      <TableCell>{a.user_id}</TableCell>
                      <TableCell>{a.account_number}</TableCell>
                      <TableCell>{a.balance}</TableCell>
                      <TableCell>{a.daily_limit}</TableCell>
                      <TableCell>{a.daily_withdrawn}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="transactions">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Transactions</h3>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => fetchTransactions(transactionsOffset)}>Refresh</Button>
                  <Button onClick={() => fetchTransactions(Math.max(0, transactionsOffset - PAGE_SIZE))}>Prev</Button>
                  <Button onClick={() => fetchTransactions(transactionsOffset + PAGE_SIZE)}>Next</Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Account ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance After</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.id}</TableCell>
                      <TableCell>{t.type}</TableCell>
                      <TableCell>{t.amount}</TableCell>
                      <TableCell>{formatLocal(t.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="receipts">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Receipts</h3>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => fetchReceipts(receiptsOffset)}>Refresh</Button>
                  <Button onClick={() => fetchReceipts(Math.max(0, receiptsOffset - PAGE_SIZE))}>Prev</Button>
                  <Button onClick={() => fetchReceipts(receiptsOffset + PAGE_SIZE)}>Next</Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.id}</TableCell>
                      <TableCell>{r.transaction_id}</TableCell>
                      <TableCell>{formatLocal(r.created_at)}</TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => onDownloadReceipt(r.id)}>Download PDF</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
