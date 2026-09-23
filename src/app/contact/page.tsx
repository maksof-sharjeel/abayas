'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const message = [
      'Hello SK Hand Embroidery, I have an inquiry.',
      '',
      `Name: ${formData.name}`,
      `Phone: ${formData.phone}`,
      `Message: ${formData.message}`,
    ].join('\n');
    window.open(`https://wa.me/923198271315?text=${encodeURIComponent(message)}`, '_blank');

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Unable to save inquiry');
      setSubmitted(true);
      setFormData({ name: '', phone: '', message: '' });
      window.setTimeout(() => setSubmitted(false), 4000);
    } catch (error) {
      console.error('Error saving inquiry:', error);
      alert('WhatsApp opened, but we could not save your inquiry. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-plum-dark text-cream">
          <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-center px-5 py-16 sm:px-8 md:py-24 lg:px-16">
              <p className="motion-rise text-xs font-semibold uppercase tracking-[0.28em] text-gold">Come say hello</p>
              <h1 className="motion-rise motion-rise-1 mt-4 max-w-xl font-serif text-4xl leading-[0.98] sm:text-5xl md:text-7xl">Let&apos;s find your next favourite piece.</h1>
              <p className="motion-rise motion-rise-2 mt-7 max-w-lg text-base leading-7 text-cream/70 md:text-lg">Whether you need help choosing a size, want to customise a detail, or simply want to see what is new, our studio team is here for you.</p>
              <div className="motion-rise motion-rise-3 mt-9 flex flex-wrap gap-3">
                <a href="https://wa.me/923198271315" target="_blank" rel="noopener noreferrer" className="button-sheen rounded-full bg-gold px-6 py-3 text-sm font-semibold text-plum-dark transition-colors hover:bg-gold-light">Chat on WhatsApp</a>
                <a href="https://wa.me/923198271315?text=Hi%2C%20I%20would%20like%20to%20speak%20with%20the%20studio%20team." target="_blank" rel="noopener noreferrer" className="rounded-full border border-cream/35 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-cream/10">WhatsApp Call</a>
              </div>
            </div>
            <div className="relative min-h-90 overflow-hidden lg:min-h-125">
              <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1100&q=85" alt="Textured fabric and clothing details in a boutique studio" className="motion-image absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-plum-dark/55 via-transparent to-transparent" />
              <p className="absolute bottom-7 left-7 text-xs font-semibold uppercase tracking-[0.22em] text-cream/80">Lahore • Pakistan</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <a href="https://wa.me/923198271315" target="_blank" rel="noopener noreferrer" className="interactive-lift group border border-plum-dark/10 bg-cream p-6 transition-colors hover:bg-rose-light"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-plum">Fastest reply</p><h2 className="mt-4 font-serif text-2xl text-plum-dark">WhatsApp</h2><p className="mt-2 text-sm text-foreground/60">0319 8271315</p><span className="mt-6 block text-sm font-semibold text-plum">Start a conversation →</span></a>
            <a href="https://wa.me/923198271315?text=Hi%2C%20I%20would%20like%20to%20speak%20with%20the%20studio%20team." target="_blank" rel="noopener noreferrer" className="interactive-lift group border border-plum-dark/10 bg-cream p-6 transition-colors hover:bg-rose-light"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-plum">Speak with us</p><h2 className="mt-4 font-serif text-2xl text-plum-dark">WhatsApp call</h2><p className="mt-2 text-sm text-foreground/60">Mon–Sat, 11:00–19:00</p><span className="mt-6 block text-sm font-semibold text-plum">Start WhatsApp →</span></a>
            <div className="border border-plum-dark/10 bg-cream p-6"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-plum">Studio details</p><h2 className="mt-4 font-serif text-2xl text-plum-dark">Visit us</h2><p className="mt-2 text-sm leading-6 text-foreground/60">Lahore, Pakistan<br />Private appointments available</p><span className="mt-6 block text-sm font-semibold text-plum">By appointment</span></div>
          </div>
        </section>

        <section className="bg-rose-light/60 py-14 md:py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:items-start">
            <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-plum">Personal service</p><h2 className="mt-4 font-serif text-3xl leading-tight text-plum-dark sm:text-4xl md:text-5xl">Tell us what you&apos;re looking for.</h2><p className="mt-5 max-w-md text-sm leading-7 text-foreground/65">Share your question below and we&apos;ll open a WhatsApp conversation with your details already prepared.</p><div className="mt-8 border-l-2 border-gold pl-4 text-sm leading-6 text-foreground/65"><p>Size guidance</p><p>Custom colour requests</p><p>Order and delivery help</p></div></div>
            <form onSubmit={handleSubmit} className="motion-rise border border-plum-dark/10 bg-cream p-6 md:p-8">
              {submitted && <div className="mb-5 border border-green-200 bg-green-50 p-3 text-sm text-green-800">Your WhatsApp message is ready to send.</div>}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="text-sm font-medium text-foreground">Your name<input type="text" name="name" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} required className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-background px-4 py-3 outline-none transition-colors focus:border-plum" /></label>
                <label className="text-sm font-medium text-foreground">Phone number<input type="tel" name="phone" value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} required className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-background px-4 py-3 outline-none transition-colors focus:border-plum" /></label>
              </div>
              <label className="mt-5 block text-sm font-medium text-foreground">How can we help?<textarea name="message" value={formData.message} onChange={(event) => setFormData({ ...formData, message: event.target.value })} required rows={5} placeholder="Tell us about the piece, size or occasion..." className="mt-2 w-full rounded-lg border border-plum-dark/15 bg-background px-4 py-3 outline-none transition-colors focus:border-plum" /></label>
              <button type="submit" className="button-sheen mt-6 w-full rounded-full bg-plum-dark px-5 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-plum">Continue on WhatsApp →</button>
            </form>
          </div>
        </section>

        <section className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 py-10 sm:px-8 md:flex-row md:items-center md:py-14"><p className="font-serif text-2xl text-plum-dark">Looking for something specific?</p><Link href="/shop" className="text-sm font-semibold text-plum underline-offset-4 hover:underline">Explore the collection →</Link></section>
      </main>
      <Footer />
    </div>
  );
}
