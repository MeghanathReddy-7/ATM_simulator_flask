import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // Assuming you have an auth context
import { api } from "@/services/api"; // Assuming you have an API service
import { User, Account, Transaction } from "@/types/atm"; // Adjust based on your types

const Admin = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/"); // Redirect to login if not authenticated
    }

    // Fetch data for admin (users, accounts, transactions)
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const userList = await api.listUsers();
        const accountList = await api.listAccounts();
        const transactionList = await api.listTransactions();

        setUsers(userList);
        setAccounts(accountList);
        setTransactions(transactionList);
      } catch (error) {
        console.error("Error fetching admin data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      <div className="section">
        <h2>Users</h2>
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section">
        <h2>Accounts</h2>
        <table>
          <thead>
            <tr>
              <th>Account Number</th>
              <th>User ID</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.account_number}>
                <td>{account.account_number}</td>
                <td>{account.user_id}</td>
                <td>{account.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section">
        <h2>Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>{transaction.type}</td>
                <td>{transaction.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
