'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to reset password');
      setMessage(data.message);
      setPassword('');
      setConfirmPassword('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md border border-plum-dark/10 bg-cream p-7 shadow-xl md:p-9">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-plum">Account recovery</p>
        <h1 className="mt-3 text-center font-serif text-3xl text-plum-dark">Set a new password</h1>
        {error && <div className="mt-5 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        {message ? <div className="mt-5"><div className="bg-green-50 p-3 text-sm text-green-800">{message}</div><Link href="/admin/login" className="mt-5 block text-center text-sm font-semibold text-plum hover:underline">Continue to login →</Link></div> : <form onSubmit={handleSubmit} className="mt-6 space-y-5"><label className="block text-sm font-medium text-foreground">New password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-background px-4 py-3 outline-none focus:border-plum" /></label><label className="block text-sm font-medium text-foreground">Confirm password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-background px-4 py-3 outline-none focus:border-plum" /></label><button type="submit" disabled={loading || !token} className="w-full rounded-full bg-plum-dark py-3 font-semibold text-cream hover:bg-plum disabled:opacity-50">{loading ? 'Updating...' : 'Update password'}</button></form>}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-sm text-foreground/60">Opening reset form...</div>}><ResetPasswordForm /></Suspense>;
}