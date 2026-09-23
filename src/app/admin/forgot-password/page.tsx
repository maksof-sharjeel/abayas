'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to send reset email');
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md border border-plum-dark/10 bg-cream p-7 shadow-xl md:p-9">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-plum">Account recovery</p>
        <h1 className="mt-3 text-center font-serif text-3xl text-plum-dark">Forgot password?</h1>
        <p className="mt-3 text-center text-sm leading-6 text-foreground/60">Enter your admin email and we&apos;ll send a secure reset link.</p>
        {error && <div className="mt-5 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        {message && <div className="mt-5 bg-green-50 p-3 text-sm text-green-800">{message}</div>}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <label className="block text-sm font-medium text-foreground">Admin email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-background px-4 py-3 outline-none focus:border-plum" /></label>
          <button type="submit" disabled={loading} className="w-full rounded-full bg-plum-dark py-3 font-semibold text-cream hover:bg-plum disabled:opacity-50">{loading ? 'Sending...' : 'Send reset link'}</button>
        </form>
        <Link href="/admin/login" className="mt-6 block text-center text-sm font-semibold text-plum hover:underline">← Back to login</Link>
      </div>
    </div>
  );
}