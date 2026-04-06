import { Menu, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useThemeMood } from '../context/ThemeContext';
import CartSidebar from './CartSidebar';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartCount } = useCart();
  const { mood, setMood } = useThemeMood();

  const moodLabelMap = {
    focus: 'Focus Mode',
    adventure: 'Adventure Mode',
    cozy: 'Cozy Mode',
  } as const;

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-black/10 bg-[var(--surface)]/90 shadow-lg backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <ShoppingBag className="h-7 w-7 text-[var(--brand-primary)] transform transition-transform group-hover:scale-110 sm:h-8 sm:w-8" />
                <span className="ml-2 text-lg font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--brand-primary)] sm:text-xl">VendorHub</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden items-center space-x-4 md:flex lg:space-x-8">
              <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors">
                Home
              </Link>
              <Link to="/products" className="px-3 py-2 rounded-md text-sm font-medium text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors">
                Products
              </Link>
              <Link to="/orders" className="px-3 py-2 rounded-md text-sm font-medium text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors">
                Orders
              </Link>
              <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-medium text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors">
                Admin
              </Link>
              <Link to="/about" className="px-3 py-2 rounded-md text-sm font-medium text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors">
                About
              </Link>
              <Link to="/contact" className="px-3 py-2 rounded-md text-sm font-medium text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors">
                Contact
              </Link>
              <div className="flex items-center gap-2 rounded-full border border-black/10 bg-[var(--surface-elevated)] px-2 py-1">
                <span className="px-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  {moodLabelMap[mood]}
                </span>
                <select
                  value={mood}
                  onChange={(event) => setMood(event.target.value as 'focus' | 'adventure' | 'cozy')}
                  className="rounded-full border border-transparent bg-[var(--brand-primary)] px-3 py-1.5 text-sm font-semibold text-white outline-none transition hover:brightness-110"
                >
                  <option value="focus">Focus</option>
                  <option value="adventure">Adventure</option>
                  <option value="cozy">Cozy</option>
                </select>
              </div>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative rounded-full p-2 transition-colors hover:bg-[var(--bg-accent)]"
              >
                <ShoppingBag className="h-6 w-6 text-[var(--text-muted)] transition-colors hover:text-[var(--brand-primary)]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center space-x-2 md:hidden">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative rounded-full p-2 transition-colors hover:bg-[var(--bg-accent)]"
              >
                <ShoppingBag className="h-6 w-6 text-[var(--text-muted)]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-accent)] hover:text-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--brand-primary)]"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="animate-slideDown border-t border-black/10 bg-[var(--surface)] md:hidden">
            <div className="space-y-1 px-3 pb-4 pt-2 sm:px-4">
              <Link
                to="/"
                className="block rounded-md px-3 py-2.5 text-base font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-accent)] hover:text-[var(--brand-primary)]"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="block rounded-md px-3 py-2.5 text-base font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-accent)] hover:text-[var(--brand-primary)]"
                onClick={() => setIsOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/about"
                className="block rounded-md px-3 py-2.5 text-base font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-accent)] hover:text-[var(--brand-primary)]"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                to="/orders"
                className="block rounded-md px-3 py-2.5 text-base font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-accent)] hover:text-[var(--brand-primary)]"
                onClick={() => setIsOpen(false)}
              >
                Orders
              </Link>
              <Link
                to="/admin"
                className="block rounded-md px-3 py-2.5 text-base font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-accent)] hover:text-[var(--brand-primary)]"
                onClick={() => setIsOpen(false)}
              >
                Admin
              </Link>
              <Link
                to="/contact"
                className="block rounded-md px-3 py-2 text-base font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--brand-primary)]"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              <div className="px-3 py-2">
                <label className="sr-only" htmlFor="mood-selector">Store mood</label>
                <select
                  id="mood-selector"
                  value={mood}
                  onChange={(event) => setMood(event.target.value as 'focus' | 'adventure' | 'cozy')}
                  className="w-full rounded-full border border-transparent bg-[var(--brand-primary)] px-3 py-2.5 text-sm font-semibold text-white"
                >
                  <option value="focus">Focus</option>
                  <option value="adventure">Adventure</option>
                  <option value="cozy">Cozy</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}