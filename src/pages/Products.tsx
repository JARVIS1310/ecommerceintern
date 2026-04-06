import { Compass, Heart, Search, ShoppingCart, Star, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import PaymentModal from '../components/PaymentModal';
import { useCart } from '../context/CartContext';
import { getProducts } from '../lib/api';
import type { Product } from '../types';

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studioMode, setStudioMode] = useState<'speed' | 'gift' | 'setup'>('speed');

  const { addToCart, likedProducts, toggleLike } = useCart();
  const [showAddedAnimation, setShowAddedAnimation] = useState<number | null>(null);
  const [showWishAnimation, setShowWishAnimation] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setError('');

    getProducts(selectedCategory, searchText)
      .then((response) => {
        setProducts(response.items);
        setCategories(response.categories);
      })
      .catch((fetchError) => {
        const message = fetchError instanceof Error ? fetchError.message : 'Unable to load products';
        setError(message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedCategory, searchText]);

  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product);
    setIsPaymentModalOpen(true);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setShowAddedAnimation(product.id);
    setTimeout(() => setShowAddedAnimation(null), 900);
  };

  const handleWishlistToggle = (productId: number) => {
    toggleLike(productId);
    setShowWishAnimation(productId);
    setTimeout(() => setShowWishAnimation(null), 700);
  };

  const safeProducts = useMemo(() => products, [products]);

  const studioPicks = useMemo(() => {
    const source = products;
    if (source.length === 0) return [];

    const byMode =
      studioMode === 'speed'
        ? source.filter((item) => item.price <= 220).sort((a, b) => b.rating - a.rating)
        : studioMode === 'gift'
          ? source
              .filter((item) => item.price <= 350 && item.rating >= 4.5)
              .sort((a, b) => a.price - b.price)
          : source
              .filter((item) => ['electronics', 'home'].includes(item.category))
              .sort((a, b) => b.rating - a.rating);

    return byMode.slice(0, 3);
  }, [products, studioMode]);

  const studioMeta = {
    speed: {
      title: 'Quick Win Deck',
      subtitle: 'Fast-moving products with high ratings and accessible pricing.',
      icon: Zap,
    },
    gift: {
      title: 'Gift-Ready Deck',
      subtitle: 'Premium looking picks that work for birthdays, events, and celebrations.',
      icon: Compass,
    },
    setup: {
      title: 'Complete Setup Deck',
      subtitle: 'Build a practical workspace or home setup with coordinated essentials.',
      icon: ShoppingCart,
    },
  } as const;

  const ActiveStudioIcon = studioMeta[studioMode].icon;

  return (
    <div className="bg-[var(--bg-base)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-black text-[var(--text-primary)]">Featured Products</h2>
          <p className="mt-4 text-lg text-[var(--text-muted)]">Dynamic catalog powered by your backend API</p>
        </motion.div>

        <motion.section
          className="mt-10 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-lg"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[var(--brand-primary)]">
                <Compass className="h-5 w-5" />
                <h3 className="text-xl font-black">Commerce Studio</h3>
              </div>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Switch curated decks to instantly explore premium combinations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-2 sm:rounded-full sm:p-1">
              {[
                { key: 'speed', label: 'Quick Win' },
                { key: 'gift', label: 'Gift Ready' },
                { key: 'setup', label: 'Full Setup' },
              ].map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setStudioMode(mode.key as 'speed' | 'gift' | 'setup')}
                  className={`min-w-[7rem] rounded-full px-3 py-2 text-xs font-semibold transition sm:px-3 sm:py-1.5 ${
                    studioMode === mode.key
                      ? 'bg-[var(--brand-primary)] text-[var(--bg-base)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-accent)]'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-accent)] p-4">
            <div className="flex items-center gap-2">
              <ActiveStudioIcon className="h-4 w-4 text-[var(--brand-primary)]" />
              <p className="font-semibold">{studioMeta[studioMode].title}</p>
            </div>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{studioMeta[studioMode].subtitle}</p>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {studioPicks.map((item) => (
                <div key={item.id} className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-3">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{item.category} • ${item.price}</p>
                  <p className="mt-2 text-xs text-[var(--brand-secondary)]">Rated {item.rating}/5 by shoppers</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-[var(--brand-primary)] text-[var(--bg-base)]'
                    : 'bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--bg-accent)]'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          <label className="relative block w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[var(--text-muted)]" />
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-[var(--border-soft)] bg-[var(--surface)] py-2.5 pl-9 pr-4 text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-secondary)]"
            />
          </label>
        </div>

        <div className="mt-4 flex justify-start sm:justify-end">
          <motion.div
            key={likedProducts.size}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)]"
          >
            Wishlist: {likedProducts.size} item{likedProducts.size === 1 ? '' : 's'}
          </motion.div>
        </div>

        {loading && <p className="mt-10 text-center text-[var(--text-muted)]">Loading products...</p>}
        {error && <p className="mt-10 text-center text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {safeProducts.map((product, index) => (
              <motion.article
                key={product.id}
                className="group rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-md"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                whileHover={{ y: -8 }}
              >
                <div className="relative overflow-hidden rounded-xl bg-[var(--surface-elevated)]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 right-3 rounded-full bg-[var(--surface)] p-2 shadow-md">
                    <Heart
                      className={`h-5 w-5 ${
                        likedProducts.has(product.id) ? 'fill-current text-red-500' : 'text-[var(--text-muted)]'
                      }`}
                    />
                  </div>
                  <p className="absolute left-3 top-3 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                    {product.liveViewers ?? 0} viewing now
                  </p>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between gap-3">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{product.name}</h3>
                    <p className="text-lg font-semibold text-[var(--brand-secondary)]">${product.price}</p>
                  </div>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{product.description}</p>

                  <div className="mt-2 flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-amber-400' : 'text-slate-700'}`}
                        fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                      />
                    ))}
                    <span className="ml-2 text-sm text-[var(--text-muted)]">{product.rating}/5</span>
                  </div>

                  {product.trust && (
                    <div className="mt-3 rounded-lg border border-[var(--border-soft)] bg-[var(--bg-accent)] p-3 text-xs text-[var(--text-muted)]">
                      <p>Material: {product.trust.material}</p>
                      <p>Origin: {product.trust.origin}</p>
                      <p>Carbon: {product.trust.carbonKg} kg CO2e</p>
                      <p>Warranty: {product.trust.warrantyMonths} months</p>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleWishlistToggle(product.id)}
                      className={`flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        likedProducts.has(product.id)
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                          : 'bg-[var(--surface-elevated)] text-[var(--text-muted)] border border-[var(--border-soft)]'
                      } ${showWishAnimation === product.id ? 'scale-105' : ''}`}
                    >
                      <Heart className={`mr-1.5 h-4 w-4 ${likedProducts.has(product.id) ? 'fill-current' : ''}`} />
                      {likedProducts.has(product.id) ? 'Saved' : 'Wishlist'}
                    </motion.button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`col-span-1 flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        showAddedAnimation === product.id
                          ? 'bg-[var(--brand-secondary)] scale-105 text-[var(--bg-base)]'
                          : 'bg-[var(--brand-primary)] text-[var(--bg-base)]'
                      }`}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {showAddedAnimation === product.id ? 'Added!' : 'Add'}
                    </button>
                    <button
                      onClick={() => handleBuyNow(product)}
                      className="col-span-1 rounded-lg bg-[var(--brand-cta)] px-3 py-2 text-sm font-medium text-white transition hover:brightness-95"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          product={selectedProduct}
        />
      )}
    </div>
  );
}
