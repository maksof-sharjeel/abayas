'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-light to-cream flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-cream rounded-lg shadow-lg p-8">
        <h1 className="font-serif text-3xl text-plum-dark mb-6 text-center">Admin Login</h1>
        
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-plum text-cream py-3 rounded-full font-semibold hover:bg-plum-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-foreground/70">
          <Link href="/admin/forgot-password" className="text-plum hover:text-plum-dark">
            Forgot password?
          </Link>
        </p>
        <p className="mt-3 text-center text-sm text-foreground/70">
          First time?{' '}
          <Link href="/admin/signup" className="text-plum hover:text-plum-dark">
            Create admin account
          </Link>
        </p>
      </div>
    </div>
  );
}
