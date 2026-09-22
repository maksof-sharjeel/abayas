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
        <section className="bg-gradient-to-b from-rose-light to-cream py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-serif text-4xl md:text-6xl text-plum-dark mb-6">
              SK Hand Embroidery Boutique
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
              Discover exquisite hand-embroidered abayas and modest wear crafted with love and care
            </p>
            <Link
              href="/shop"
              className="inline-block bg-plum text-cream px-8 py-3 rounded-full font-semibold hover:bg-plum-dark transition-colors"
            >
              Shop Collection
            </Link>
          </div>
        </section>

        {/* Category Preview */}
        <section className="py-16 bg-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl text-plum-dark mb-8 text-center">Browse by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.length > 0 ? (
                categories.map((category: any) => (
                  <Link
                    key={category._id}
                    href={`/shop?category=${category.slug}`}
                    className="bg-rose-light rounded-lg p-8 text-center hover:bg-rose transition-colors"
                  >
                    <h3 className="font-serif text-2xl text-plum-dark mb-2">{category.name}</h3>
                    <p className="text-foreground/70 text-sm">{category.description || 'View collection'}</p>
                  </Link>
                ))
              ) : (
                <>
                  <Link
                    href="/shop?category=Plain"
                    className="bg-rose-light rounded-lg p-8 text-center hover:bg-rose transition-colors"
                  >
                    <h3 className="font-serif text-2xl text-plum-dark mb-2">Plain</h3>
                    <p className="text-foreground/70 text-sm">Elegant simplicity</p>
                  </Link>
                  <Link
                    href="/shop?category=Design"
                    className="bg-rose-light rounded-lg p-8 text-center hover:bg-rose transition-colors"
                  >
                    <h3 className="font-serif text-2xl text-plum-dark mb-2">Design</h3>
                    <p className="text-foreground/70 text-sm">Embroidered elegance</p>
                  </Link>
                  <Link
                    href="/shop?category=Simple"
                    className="bg-rose-light rounded-lg p-8 text-center hover:bg-rose transition-colors"
                  >
                    <h3 className="font-serif text-2xl text-plum-dark mb-2">Simple</h3>
                    <p className="text-foreground/70 text-sm">Everyday comfort</p>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl text-plum-dark mb-8 text-center">Featured Collection</h2>
            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product: any) => (
                  <Link
                    key={product._id}
                    href={`/product/${product._id}`}
                    className="bg-cream rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square bg-rose-light relative">
                      {product.images && product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                      <p className="text-plum font-bold">PKR {product.price.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-foreground/60">No featured products yet</p>
            )}
            <div className="text-center mt-8">
              <Link
                href="/shop"
                className="inline-block border-2 border-plum text-plum px-8 py-3 rounded-full font-semibold hover:bg-plum hover:text-cream transition-colors"
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
