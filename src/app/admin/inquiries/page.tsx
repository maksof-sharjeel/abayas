'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import LoadingState from '@/components/LoadingState';

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInquiries() {
      try {
        const response = await fetch('/api/inquiries');
        if (response.ok) setInquiries(await response.json());
      } catch (error) {
        console.error('Error loading inquiries:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchInquiries();
  }, []);

  if (loading) return <AdminLayout><LoadingState label="Loading inquiries" fullScreen={false} /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl p-5 md:p-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-plum">Customer conversations</p>
          <h1 className="mt-2 font-serif text-4xl text-plum-dark">Inquiries</h1>
          <p className="mt-2 text-sm text-foreground/60">Questions and requests submitted from the contact page.</p>
        </div>

        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <div className="border border-dashed border-plum/30 bg-cream p-10 text-center text-sm text-foreground/55">No customer inquiries yet.</div>
          ) : inquiries.map((inquiry) => (
            <article key={inquiry.id} className="border border-plum-dark/10 bg-cream p-5 md:p-6">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div><h2 className="font-serif text-2xl text-plum-dark">{inquiry.name}</h2><p className="mt-1 text-sm text-foreground/55">{inquiry.phone}</p></div>
                <div className="text-left md:text-right"><span className="inline-block bg-gold-light px-2.5 py-1 text-xs font-semibold text-plum-dark">{inquiry.status}</span><p className="mt-2 text-xs text-foreground/50">{new Date(inquiry.createdAt).toLocaleString()}</p></div>
              </div>
              <p className="mt-5 whitespace-pre-line border-t border-plum-dark/10 pt-4 text-sm leading-7 text-foreground/75">{inquiry.message}</p>
              <a href={`https://wa.me/${inquiry.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-semibold text-plum hover:underline">Reply on WhatsApp →</a>
            </article>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}