import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { useNavigate } from 'react-router-dom';

const RegisterUser = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!name || !email || !phone || !accountNumber || !pin || !confirmPin) return 'All fields are required';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Invalid email';
    if (!/^\d{10}$/.test(phone)) return 'Invalid phone';
    if (!/^\d{10,16}$/.test(accountNumber)) return 'Invalid account number';
    if (!/^\d{4,6}$/.test(pin)) return 'PIN must be 4-6 digits';
    if (pin !== confirmPin) return 'PINs do not match';
    return '';
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setIsLoading(true);
    setError('');
    try {
      const res = await api.createUser({ name, email, phone, account_number: accountNumber, pin });
      if (res.success) {
        toast({ title: 'User created', description: 'You can now log in.' });
        navigate('/');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="atm-card w-full max-w-md space-y-4">
        <h1 className="text-xl font-semibold">Create New User</h1>
        <Input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
        <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <Input placeholder="Phone (10 digits)" value={phone} onChange={e => setPhone(e.target.value)} />
        <Input placeholder="Account Number" value={accountNumber} onChange={e => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 16))} />
        <Input placeholder="PIN" type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} />
        <Input placeholder="Confirm PIN" type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading} className="flex-1">Register</Button>
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/')}>Cancel</Button>
        </div>
         <a href="/" className="w-full block text-center text-sm text-primary hover:text-primary/90">
              Back to Login
        </a>
      </form>
       
    </div>
  );
};

export default RegisterUser;
