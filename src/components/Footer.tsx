import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-plum-dark text-cream py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-xl mb-4">SK Hand Embroidery</h3>
            <p className="text-cream/80 text-sm">
              Exquisite hand-embroidered abayas and modest wear crafted with love and care.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-gold transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <p className="text-sm text-cream/80">
              WhatsApp: 0312 2789939
            </p>
          </div>
        </div>
        
        <div className="border-t border-cream/20 mt-8 pt-8 text-center text-sm text-cream/60">
          <p>&copy; {new Date().getFullYear()} SK Hand Embroidery Boutique. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
