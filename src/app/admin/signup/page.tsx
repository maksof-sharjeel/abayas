'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create admin account');
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
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
        <h1 className="font-serif text-3xl text-plum-dark mb-6 text-center">Admin Signup</h1>
        
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
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
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
            {loading ? 'Creating Account...' : 'Create Admin Account'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-foreground/70">
          Already have an account?{' '}
          <Link href="/admin/login" className="text-plum hover:text-plum-dark">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
