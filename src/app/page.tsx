import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/products?featured=true`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/categories`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  const categories = await getCategories();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-rose-light via-rose to-mauve py-12 md:py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-5 left-5 w-32 h-32 md:w-64 md:h-64 bg-gold rounded-full blur-3xl"></div>
            <div className="absolute bottom-5 right-5 w-48 h-48 md:w-96 md:h-96 bg-plum rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl text-plum-dark mb-4 md:mb-6">
              SK Hand Embroidery Boutique
            </h1>
            <p className="text-sm md:text-base lg:text-lg xl:text-xl text-foreground/90 mb-6 md:mb-8 max-w-xl md:max-w-2xl mx-auto leading-relaxed px-4">
              Discover exquisite hand-embroidered abayas and modest wear crafted with love and care
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
              <Link
                href="/shop"
                className="inline-block bg-plum text-cream px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold hover:bg-plum-dark transition-all transform hover:scale-105 shadow-lg text-sm md:text-base"
              >
                Shop Collection
              </Link>
              <Link
                href="/contact"
                className="inline-block border-2 border-plum text-plum px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold hover:bg-plum hover:text-cream transition-all text-sm md:text-base"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>

        {/* Category Preview */}
        <section className="py-10 md:py-12 lg:py-16 bg-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-2xl md:text-3xl text-plum-dark mb-6 md:mb-8 text-center">Browse by Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {categories.length > 0 ? (
                categories.map((category: any) => (
                  <Link
                    key={category.id}
                    href={`/shop?category=${category.slug}`}
                    className="group bg-gradient-to-br from-rose-light to-rose rounded-lg p-6 md:p-8 text-center hover:shadow-xl transition-all transform hover:-translate-y-2 border border-rose/30"
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-plum/20 rounded-full flex items-center justify-center group-hover:bg-plum/30 transition-colors">
                      <span className="text-2xl md:text-3xl">✨</span>
                    </div>
                    <h3 className="font-serif text-xl md:text-2xl text-plum-dark mb-2 group-hover:text-plum transition-colors">{category.name}</h3>
                    <p className="text-foreground/70 text-xs md:text-sm">{category.description || 'View collection'}</p>
                  </Link>
                ))
              ) : (
                <>
                  <Link
                    href="/shop?category=Plain"
                    className="group bg-gradient-to-br from-rose-light to-rose rounded-lg p-6 md:p-8 text-center hover:shadow-xl transition-all transform hover:-translate-y-2 border border-rose/30"
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-plum/20 rounded-full flex items-center justify-center group-hover:bg-plum/30 transition-colors">
                      <span className="text-2xl md:text-3xl">🌸</span>
                    </div>
                    <h3 className="font-serif text-xl md:text-2xl text-plum-dark mb-2 group-hover:text-plum transition-colors">Plain</h3>
                    <p className="text-foreground/70 text-xs md:text-sm">Elegant simplicity</p>
                  </Link>
                  <Link
                    href="/shop?category=Design"
                    className="group bg-gradient-to-br from-rose-light to-rose rounded-lg p-6 md:p-8 text-center hover:shadow-xl transition-all transform hover:-translate-y-2 border border-rose/30"
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-plum/20 rounded-full flex items-center justify-center group-hover:bg-plum/30 transition-colors">
                      <span className="text-2xl md:text-3xl">🎨</span>
                    </div>
                    <h3 className="font-serif text-xl md:text-2xl text-plum-dark mb-2 group-hover:text-plum transition-colors">Design</h3>
                    <p className="text-foreground/70 text-xs md:text-sm">Embroidered elegance</p>
                  </Link>
                  <Link
                    href="/shop?category=Simple"
                    className="group bg-gradient-to-br from-rose-light to-rose rounded-lg p-6 md:p-8 text-center hover:shadow-xl transition-all transform hover:-translate-y-2 border border-rose/30"
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-plum/20 rounded-full flex items-center justify-center group-hover:bg-plum/30 transition-colors">
                      <span className="text-2xl md:text-3xl">💫</span>
                    </div>
                    <h3 className="font-serif text-xl md:text-2xl text-plum-dark mb-2 group-hover:text-plum transition-colors">Simple</h3>
                    <p className="text-foreground/70 text-xs md:text-sm">Everyday comfort</p>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-10 md:py-12 lg:py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-2xl md:text-3xl text-plum-dark mb-6 md:mb-8 text-center">Featured Collection</h2>
            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                {featuredProducts.map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="group bg-cream rounded-lg md:rounded-xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-rose/20"
                  >
                    <div className="aspect-square bg-rose-light relative overflow-hidden">
                      {product.images && product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      )}
                      <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-gold text-plum-dark px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-semibold">
                        Featured
                      </div>
                    </div>
                    <div className="p-3 md:p-5">
                      <p className="text-[10px] md:text-sm text-plum mb-1 font-medium">{product.category}</p>
                      <h3 className="font-semibold text-foreground mb-1 md:mb-2 line-clamp-2 text-xs md:text-base group-hover:text-plum transition-colors">{product.name}</h3>
                      <div className="flex items-center justify-between mb-2 md:mb-3">
                        <p className="text-plum font-bold text-sm md:text-lg">PKR {product.price.toLocaleString()}</p>
                        <span className="text-[10px] md:text-xs text-foreground/60">View →</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <a
                          href={`tel:+923122789939`}
                          className="flex items-center justify-center gap-1.5 py-2 rounded-full bg-blue-600 text-white text-[10px] md:text-xs font-semibold hover:bg-blue-700 transition-colors"
                        >
                          <span>📞</span> Call
                        </a>
                        <a
                          href={`https://wa.me/923122789939?text=${encodeURIComponent(`Hi, I'm interested in: ${product.name} (PKR ${product.price.toLocaleString()})`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 py-2 rounded-full bg-green-600 text-white text-[10px] md:text-xs font-semibold hover:bg-green-700 transition-colors"
                        >
                          <span>💬</span> WhatsApp
                        </a>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-foreground/60 text-sm md:text-base">No featured products yet</p>
            )}
            <div className="text-center mt-6 md:mt-8">
              <Link
                href="/shop"
                className="inline-block border-2 border-plum text-plum px-6 py-3 md:px-8 md:py-3 rounded-full font-semibold hover:bg-plum hover:text-cream transition-colors text-sm md:text-base"
              >
                View All Products
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
