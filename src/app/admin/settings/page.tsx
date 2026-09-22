'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Settings {
  id: string;
  whatsappNumber: string;
  boutiqueDescription: string;
  instagram: string;
  facebook: string;
  tiktok: string;
}

export default function AdminSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    id: '',
    whatsappNumber: '923122789939',
    boutiqueDescription: '',
    instagram: '',
    facebook: '',
    tiktok: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings({
            id: data.id,
            whatsappNumber: data.whatsappNumber,
            boutiqueDescription: data.boutiqueDescription,
            instagram: data.instagram || '',
            facebook: data.facebook || '',
            tiktok: data.tiktok || '',
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    }
    if (session) fetchSettings();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-plum-dark text-cream px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/admin/dashboard" className="font-serif text-2xl hover:text-gold">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm">{session.user?.email}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="font-serif text-3xl text-plum-dark mb-8">Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-cream rounded-lg p-6 border border-rose/20">
            <h2 className="font-serif text-xl text-plum-dark mb-4">Contact Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">WhatsApp Number (with country code)</label>
                <input
                  type="text"
                  name="whatsappNumber"
                  value={settings.whatsappNumber}
                  onChange={handleChange}
                  required
                  placeholder="923122789939"
                  className="w-full px-4 py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum"
                />
                <p className="mt-1 text-xs text-foreground/60">Format: 923122789939 (no spaces or dashes)</p>
              </div>
            </div>
          </div>

          <div className="bg-cream rounded-lg p-6 border border-rose/20">
            <h2 className="font-serif text-xl text-plum-dark mb-4">Boutique Description</h2>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">About Text</label>
              <textarea
                name="boutiqueDescription"
                value={settings.boutiqueDescription}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum"
              />
            </div>
          </div>

          <div className="bg-cream rounded-lg p-6 border border-rose/20">
            <h2 className="font-serif text-xl text-plum-dark mb-4">Social Media Links</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Instagram</label>
                <input
                  type="url"
                  name="instagram"
                  value={settings.instagram || ''}
                  onChange={handleChange}
                  placeholder="https://instagram.com/yourboutique"
                  className="w-full px-4 py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Facebook</label>
                <input
                  type="url"
                  name="facebook"
                  value={settings.facebook || ''}
                  onChange={handleChange}
                  placeholder="https://facebook.com/yourboutique"
                  className="w-full px-4 py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">TikTok</label>
                <input
                  type="url"
                  name="tiktok"
                  value={settings.tiktok || ''}
                  onChange={handleChange}
                  placeholder="https://tiktok.com/@yourboutique"
                  className="w-full px-4 py-3 border border-rose/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-plum"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-plum text-cream py-3 rounded-full font-semibold hover:bg-plum-dark transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            <Link
              href="/admin/dashboard"
              className="flex-1 bg-rose-light text-plum-dark py-3 rounded-full font-semibold hover:bg-rose transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
