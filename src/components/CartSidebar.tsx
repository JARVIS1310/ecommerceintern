import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { checkoutCart, getCartSuggestions, getOrderDetails } from '../lib/api';
import type { OrderSummary, Product } from '../types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [cardName, setCardName] = useState('');
  const [checkoutState, setCheckoutState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [copilotMessage, setCopilotMessage] = useState('');
  const [copilotProducts, setCopilotProducts] = useState<Product[]>([]);
  const [orderInfo, setOrderInfo] = useState<OrderSummary | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState({
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const celebrationDots = [
    { top: '12%', left: '16%', delay: 0 },
    { top: '20%', left: '78%', delay: 0.25 },
    { top: '35%', left: '10%', delay: 0.45 },
    { top: '42%', left: '84%', delay: 0.65 },
    { top: '66%', left: '18%', delay: 0.85 },
    { top: '74%', left: '80%', delay: 1.05 },
  ];

  useEffect(() => {
    if (cart.length === 0) {
      setCopilotMessage('');
      setCopilotProducts([]);
      return;
    }

    getCartSuggestions({
      items: cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity || 1,
        lineTotal: (item.quantity || 1) * item.price,
      })),
    })
      .then((response) => {
        setCopilotMessage(response.message);
        setCopilotProducts(response.recommendations);
      })
      .catch(() => {
        setCopilotMessage('');
        setCopilotProducts([]);
      });
  }, [cart]);

  useEffect(() => {
    if (checkoutState !== 'success' || !orderInfo?.id) return;

    const interval = setInterval(() => {
      getOrderDetails(orderInfo.id)
        .then((response) => setOrderInfo(response.order))
        .catch(() => undefined);
    }, 6000);

    return () => clearInterval(interval);
  }, [checkoutState, orderInfo?.id]);

  const handleCartCheckout = async () => {
    if (!cardName.trim()) {
      setCheckoutState('error');
      setCheckoutMessage('Please enter cardholder name.');
      return;
    }

    const hasAddress =
      deliveryAddress.line1.trim() &&
      deliveryAddress.city.trim() &&
      deliveryAddress.state.trim() &&
      deliveryAddress.postalCode.trim() &&
      deliveryAddress.country.trim();

    if (!hasAddress) {
      setCheckoutState('error');
      setCheckoutMessage('Please fill complete delivery address.');
      return;
    }

    setCheckoutState('loading');
    setCheckoutMessage('');

    try {
      const response = await checkoutCart({
        cardName: cardName.trim(),
        deliveryAddress: {
          line1: deliveryAddress.line1.trim(),
          city: deliveryAddress.city.trim(),
          state: deliveryAddress.state.trim(),
          postalCode: deliveryAddress.postalCode.trim(),
          country: deliveryAddress.country.trim(),
        },
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity || 1,
        })),
      });

      setOrderInfo(response.order);
      setCheckoutState('success');
      setCheckoutMessage(response.message);
      clearCart();
      setCardName('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkout failed';
      setCheckoutState('error');
      setCheckoutMessage(message);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed right-0 top-0 z-50 h-full w-full max-w-full border-l border-[var(--border-soft)] bg-[var(--surface)] shadow-xl transform transition-transform duration-300 sm:w-[26rem] sm:max-w-[26rem] ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-soft)] p-4 sm:p-6">
            <div className="flex items-center">
              <ShoppingBag className="mr-2 h-6 w-6 text-[var(--brand-primary)]" />
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Shopping Cart</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 transition-colors hover:bg-[var(--bg-accent)]"
            >
              <X className="h-5 w-5 text-[var(--text-muted)]" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-[var(--text-muted)]/60" />
                <p className="text-lg text-[var(--text-muted)]">Your cart is empty</p>
                <p className="mt-2 text-sm text-[var(--text-muted)]/80">Add some products to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {copilotMessage && (
                  <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--bg-accent)] p-3">
                    <p className="text-xs uppercase tracking-wider text-[var(--brand-primary)]">Smart Cart Co-Pilot</p>
                    <p className="mt-1 text-sm text-[var(--text-primary)]">{copilotMessage}</p>
                    {copilotProducts.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {copilotProducts.map((product) => (
                          <span key={product.id} className="rounded-full bg-[var(--surface-elevated)] px-2 py-1 text-xs text-[var(--text-muted)]">
                            {product.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-3 transition-colors hover:bg-[var(--bg-accent)] sm:gap-4 sm:p-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-14 w-14 flex-none rounded-md object-cover sm:h-16 sm:w-16"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-[var(--text-primary)]">
                        {item.name}
                      </h3>
                      <p className="text-sm text-[var(--text-muted)]">${item.price}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                          className="rounded-full p-1 transition-colors hover:bg-[var(--surface)]"
                          disabled={(item.quantity || 1) <= 1}
                        >
                          <Minus className="h-4 w-4 text-[var(--text-muted)]" />
                        </button>
                        <span className="text-sm font-medium px-2">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                          className="rounded-full p-1 transition-colors hover:bg-[var(--surface)]"
                        >
                          <Plus className="h-4 w-4 text-[var(--text-muted)]" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        ${((item.quantity || 1) * item.price).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="mt-2 rounded-full p-1 text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="space-y-4 border-t border-[var(--border-soft)] p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-[var(--text-primary)]">Total:</span>
                <span className="text-xl font-bold text-[var(--brand-primary)]">${cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={() => {
                  setCheckoutState('idle');
                  setCheckoutMessage('');
                  setIsCheckoutOpen(true);
                }}
                className="w-full rounded-lg bg-[var(--brand-primary)] px-4 py-3 font-medium text-[var(--bg-base)] transition-colors hover:brightness-95 focus:outline-none"
              >
                Proceed to Checkout
              </button>
              <button 
                onClick={onClose}
                className="w-full rounded-lg bg-[var(--surface-elevated)] px-4 py-3 font-medium text-[var(--text-primary)] transition-colors hover:brightness-110"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>

      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <motion.div
            className="w-full rounded-t-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-2xl sm:max-w-md sm:rounded-xl sm:p-6"
            initial={{ scale: 0.96, y: 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">Complete Cart Checkout</h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Pay ${cartTotal.toFixed(2)} for {cart.length} item(s)</p>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-[var(--text-muted)]">Cardholder Name</label>
              <input
                value={cardName}
                onChange={(event) => setCardName(event.target.value)}
                placeholder="John Doe"
                className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div className="mt-4 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-3">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Delivery Address</p>
              <div className="mt-2 space-y-2">
                <input
                  value={deliveryAddress.line1}
                  onChange={(event) => setDeliveryAddress((prev) => ({ ...prev, line1: event.target.value }))}
                  placeholder="Street address"
                  className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)] outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={deliveryAddress.city}
                    onChange={(event) => setDeliveryAddress((prev) => ({ ...prev, city: event.target.value }))}
                    placeholder="City"
                    className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)] outline-none"
                  />
                  <input
                    value={deliveryAddress.state}
                    onChange={(event) => setDeliveryAddress((prev) => ({ ...prev, state: event.target.value }))}
                    placeholder="State"
                    className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={deliveryAddress.postalCode}
                    onChange={(event) => setDeliveryAddress((prev) => ({ ...prev, postalCode: event.target.value }))}
                    placeholder="Postal code"
                    className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)] outline-none"
                  />
                  <input
                    value={deliveryAddress.country}
                    onChange={(event) => setDeliveryAddress((prev) => ({ ...prev, country: event.target.value }))}
                    placeholder="Country"
                    className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>
            </div>

            {checkoutMessage && (
              <p className={`mt-3 text-sm ${checkoutState === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {checkoutMessage}
              </p>
            )}

            {orderInfo && (
              <motion.div
                className="relative mt-4 overflow-hidden rounded-lg border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  {celebrationDots.map((dot, index) => (
                    <motion.span
                      key={index}
                      className="absolute h-2 w-2 rounded-full"
                      style={{ top: dot.top, left: dot.left, backgroundColor: index % 2 === 0 ? 'var(--brand-primary)' : 'var(--brand-cta)' }}
                      initial={{ opacity: 0, scale: 0.2, y: 12 }}
                      animate={{ opacity: [0, 1, 0.8, 0], scale: [0.2, 1.05, 0.9, 0.2], y: [12, -8, -18, -28] }}
                      transition={{ duration: 1.8, delay: dot.delay, repeat: Infinity, repeatDelay: 0.8, ease: 'easeOut' }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Tracking ID</p>
                  <motion.span
                    className="rounded-full bg-[var(--brand-primary)]/20 px-2 py-1 text-xs font-semibold text-[var(--brand-primary)]"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {orderInfo.status.replaceAll('_', ' ')}
                  </motion.span>
                </div>
                <p className="mt-1 text-sm font-bold text-[var(--brand-secondary)]">{orderInfo.trackingId}</p>

                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  {orderInfo.deliveryAddress.line1}, {orderInfo.deliveryAddress.city}, {orderInfo.deliveryAddress.state} {orderInfo.deliveryAddress.postalCode}, {orderInfo.deliveryAddress.country}
                </p>

                <ul className="mt-3 space-y-1.5">
                  {orderInfo.timeline.map((point) => (
                    <li key={point.step} className="text-xs text-[var(--text-muted)]">
                      <span className={`mr-2 inline-block h-2 w-2 rounded-full ${point.status === 'done' ? 'bg-green-400' : 'bg-slate-500'}`} />
                      {point.step} - {new Date(point.at).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={handleCartCheckout}
                disabled={checkoutState === 'loading' || checkoutState === 'success'}
                className="rounded-lg bg-[var(--brand-primary)] px-4 py-2 font-medium text-[var(--bg-base)] transition hover:brightness-95 disabled:opacity-70"
              >
                {checkoutState === 'loading' ? 'Processing...' : checkoutState === 'success' ? 'Paid' : 'Confirm Payment'}
              </button>
              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setCheckoutState('idle');
                  setCheckoutMessage('');
                  setOrderInfo(null);
                }}
                className="rounded-lg bg-[var(--surface-elevated)] px-4 py-2 font-medium text-[var(--text-primary)] transition hover:brightness-110"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}