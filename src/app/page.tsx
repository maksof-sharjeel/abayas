import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Product {
  id: string;
  productCode?: string;
  name: string;
  category: string;
  price: number;
  images: string[];
  stockStatus: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/products?featured=true`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Home() {
  const [featuredProducts, categories] = await Promise.all([getFeaturedProducts(), getCategories()]);
  const visibleCategories = categories.length > 0 ? categories.slice(0, 4) : [
    { id: 'plain', name: 'Everyday Edit', slug: 'plain', description: 'Quiet, effortless layers' },
    { id: 'design', name: 'Embroidered', slug: 'design', description: 'Hand-finished statement pieces' },
    { id: 'simple', name: 'Minimal', slug: 'simple', description: 'Refined silhouettes for every day' },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-plum-dark text-cream">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col justify-center px-6 py-20 sm:px-10 md:py-28 lg:px-16">
              <p className="motion-rise mb-6 text-xs font-semibold uppercase tracking-[0.28em] text-gold">Handcrafted modest wear</p>
              <h1 className="motion-rise motion-rise-1 max-w-xl font-serif text-4xl leading-[0.98] sm:text-6xl md:text-7xl">The art of feeling beautifully covered.</h1>
              <p className="motion-rise motion-rise-2 mt-7 max-w-md text-base leading-7 text-cream/70 md:text-lg">Thoughtfully made abayas with hand embroidery, fluid fabrics and a distinctly Lahore point of view.</p>
              <div className="motion-rise motion-rise-3 mt-9 flex flex-wrap gap-3">
                <Link href="/shop" className="button-sheen rounded-full bg-gold px-6 py-3 text-sm font-semibold text-plum-dark transition-colors hover:bg-gold-light">Shop the collection</Link>
                <Link href="/contact" className="rounded-full border border-cream/35 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-cream/10">Visit the studio</Link>
              </div>
              <div className="motion-rise motion-rise-4 mt-14 flex gap-8 border-t border-cream/15 pt-5 text-xs text-cream/55">
                <span><strong className="block text-lg font-normal text-cream">01</strong>Small-batch pieces</span>
                <span><strong className="block text-lg font-normal text-cream">02</strong>Made to order</span>
              </div>
            </div>
            <div className="relative min-h-105 overflow-hidden lg:min-h-155">
              <img src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=85" alt="Woman wearing an elegant black abaya" className="motion-image absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-r from-plum-dark/20 via-transparent to-plum-dark/10" />
              <div className="motion-drift absolute bottom-7 left-7 border border-cream/40 bg-plum-dark/35 px-4 py-3 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-[0.22em] text-gold">The new edit</p>
                <p className="mt-1 font-serif text-xl text-cream">Noor / 2026</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-plum-dark/10 bg-cream">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-plum-dark/10 px-5 py-7 text-center md:grid-cols-4 md:px-8">
            <div className="motion-rise px-3 py-2"><p className="text-sm font-semibold text-plum-dark">Hand finished</p><p className="mt-1 text-xs text-foreground/55">Every detail matters</p></div>
            <div className="motion-rise motion-rise-1 px-3 py-2"><p className="text-sm font-semibold text-plum-dark">Premium fabrics</p><p className="mt-1 text-xs text-foreground/55">Chosen for comfort</p></div>
            <div className="motion-rise motion-rise-2 px-3 py-2"><p className="text-sm font-semibold text-plum-dark">Nationwide delivery</p><p className="mt-1 text-xs text-foreground/55">Across Pakistan</p></div>
            <div className="motion-rise motion-rise-3 px-3 py-2"><p className="text-sm font-semibold text-plum-dark">Personal service</p><p className="mt-1 text-xs text-foreground/55">Here on WhatsApp</p></div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-plum">Curated for you</p><h2 className="mt-3 font-serif text-4xl text-plum-dark md:text-5xl">Shop by mood</h2></div>
            <Link href="/shop" className="hidden text-sm font-semibold text-plum underline-offset-4 hover:underline sm:block">View all pieces →</Link>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden border border-plum-dark/10 bg-plum-dark/10 sm:grid-cols-2 lg:grid-cols-4">
            {visibleCategories.map((category, index) => (
              <Link key={category.id} href={`/shop?category=${category.slug}`} className={`group interactive-lift motion-rise motion-rise-${index + 1} bg-cream p-7 transition-colors hover:bg-rose-light`}>
                <span className="text-xs text-plum/70">0{index + 1}</span>
                <h3 className="mt-16 font-serif text-2xl text-plum-dark group-hover:text-plum">{category.name}</h3>
                <p className="mt-2 text-sm text-foreground/60">{category.description || 'Explore the collection'}</p>
                <span className="mt-7 block text-sm font-semibold text-plum">Explore <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-rose-light/60 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-plum">Just in</p><h2 className="mt-3 font-serif text-4xl text-plum-dark md:text-5xl">The edit</h2></div>
              <Link href="/shop" className="text-sm font-semibold text-plum underline-offset-4 hover:underline">Shop all →</Link>
            </div>
            {featuredProducts.length > 0 ? (
              <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-6">
                {featuredProducts.slice(0, 4).map((product) => (
                  <article key={product.id} className="group motion-rise min-w-0">
                    <Link href={`/product/${product.id}`} className="relative block aspect-3/4 overflow-hidden bg-rose">
                      {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="image-zoom h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-foreground/50">No image</div>}
                      <span className="absolute left-3 top-3 bg-cream px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-plum-dark">{product.category}</span>
                    </Link>
                    <div className="pt-4"><p className="text-xs text-foreground/50">{product.productCode || 'SK EDIT'}</p><Link href={`/product/${product.id}`} className="mt-1 block font-serif text-lg text-plum-dark hover:text-plum">{product.name}</Link><p className="mt-2 text-sm font-semibold text-plum">PKR {product.price.toLocaleString()}</p></div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-10 border border-dashed border-plum/30 bg-cream/50 p-12 text-center"><p className="font-serif text-2xl text-plum-dark">Your first edit is almost here.</p><Link href="/admin/products" className="mt-4 inline-block text-sm font-semibold text-plum underline">Add products from admin</Link></div>
            )}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-24">
          <div className="group relative aspect-4/3 overflow-hidden"><img src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1000&q=85" alt="Detail of premium flowing fabric" className="image-zoom h-full w-full object-cover" /></div>
          <div className="motion-rise max-w-lg"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-plum">The SK standard</p><h2 className="mt-4 font-serif text-4xl leading-tight text-plum-dark md:text-5xl">Quiet luxury, made personal.</h2><p className="mt-5 leading-7 text-foreground/65">We believe modest dressing can be expressive. Each piece is finished in our studio with considered details, honest fabrics and the kind of fit you reach for again and again.</p><Link href="/contact" className="mt-7 inline-block border-b border-plum pb-1 text-sm font-semibold text-plum">Meet the atelier →</Link></div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
