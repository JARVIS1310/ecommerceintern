import { CreditCard, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkout, getOrderDetails } from '../lib/api';
import type { OrderSummary, Product } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export default function PaymentModal({ isOpen, onClose, product }: PaymentModalProps) {
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success'>('details');
  const [error, setError] = useState('');
  const [orderInfo, setOrderInfo] = useState<OrderSummary | null>(null);
  const celebrationDots = [
    { top: '10%', left: '18%', delay: 0 },
    { top: '16%', left: '76%', delay: 0.2 },
    { top: '28%', left: '10%', delay: 0.4 },
    { top: '34%', left: '84%', delay: 0.6 },
    { top: '62%', left: '16%', delay: 0.8 },
    { top: '68%', left: '80%', delay: 1 },
  ];
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  useEffect(() => {
    if (paymentStep !== 'success' || !orderInfo?.id) return;

    const interval = setInterval(() => {
      getOrderDetails(orderInfo.id)
        .then((response) => setOrderInfo(response.order))
        .catch(() => undefined);
    }, 6000);

    return () => clearInterval(interval);
  }, [paymentStep, orderInfo?.id]);

  const handleClose = () => {
    setPaymentStep('details');
    setOrderInfo(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPaymentStep('processing');

    try {
      const response = await checkout({
        productId: product.id,
        cardName: formData.cardName,
        deliveryAddress: {
          line1: formData.line1,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
      });
      setOrderInfo(response.order);
      setPaymentStep('success');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Payment failed';
      setError(message);
      setPaymentStep('details');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }
    // Format expiry date
    if (name === 'expiry') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .slice(0, 5);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 p-0 sm:items-center sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full rounded-t-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-2xl sm:max-w-md sm:rounded-lg sm:p-6"
          initial={{ scale: 0.94, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.94, y: 20, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <X className="h-6 w-6" />
        </button>

        {paymentStep === 'details' && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Complete Purchase</h2>
              <p className="mt-2 text-[var(--text-muted)]">Enter your payment details to continue</p>
            </div>

            <div className="mb-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-medium text-[var(--text-primary)]">{product.name}</h3>
                  <p className="text-[var(--text-muted)]">Total Amount: ${product.price}</p>
                </div>
                <img src={product.image} alt={product.name} className="h-16 w-16 flex-none rounded object-cover sm:h-20 sm:w-20" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)]">Card Number</label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="block w-full rounded-md border border-[var(--border-soft)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)] shadow-sm focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                    required
                  />
                  <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-[var(--text-muted)]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)]">Cardholder Name</label>
                <input
                  type="text"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="mt-1 block w-full rounded-md border border-[var(--border-soft)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)] shadow-sm focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)]">Expiry Date</label>
                  <input
                    type="text"
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="mt-1 block w-full rounded-md border border-[var(--border-soft)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)] shadow-sm focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)]">CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength={3}
                    className="mt-1 block w-full rounded-md border border-[var(--border-soft)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)] shadow-sm focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                    required
                  />
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-3">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Delivery Address</p>
                <div className="mt-3 space-y-3">
                  <input
                    type="text"
                    name="line1"
                    value={formData.line1}
                    onChange={handleInputChange}
                    placeholder="Street address"
                    className="block w-full rounded-md border border-[var(--border-soft)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)]"
                    required
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="block w-full rounded-md border border-[var(--border-soft)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)]"
                      required
                    />
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="block w-full rounded-md border border-[var(--border-soft)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)]"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="Postal code"
                      className="block w-full rounded-md border border-[var(--border-soft)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)]"
                      required
                    />
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Country"
                      className="block w-full rounded-md border border-[var(--border-soft)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)]"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-[var(--brand-primary)] px-4 py-2 text-[var(--bg-base)] hover:brightness-95 focus:outline-none"
              >
                Pay ${product.price}
              </button>
              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}
            </form>
          </>
        )}

        {paymentStep === 'processing' && (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--brand-primary)]"></div>
            <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">Processing your payment...</p>
            <p className="mt-2 text-[var(--text-muted)]">Please don't close this window</p>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="relative overflow-hidden py-8 text-center">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              {celebrationDots.map((dot, index) => (
                <motion.span
                  key={index}
                  className="absolute h-2.5 w-2.5 rounded-full"
                  style={{ top: dot.top, left: dot.left, backgroundColor: index % 2 === 0 ? 'var(--brand-primary)' : 'var(--brand-cta)' }}
                  initial={{ opacity: 0, scale: 0.2, y: 16 }}
                  animate={{ opacity: [0, 1, 0.8, 0], scale: [0.2, 1.1, 0.9, 0.2], y: [16, -10, -24, -34] }}
                  transition={{ duration: 1.9, delay: dot.delay, repeat: Infinity, repeatDelay: 0.8, ease: 'easeOut' }}
                />
              ))}
              <motion.div
                className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--brand-primary)]/20"
                animate={{ scale: [0.75, 1.1, 0.75], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--brand-cta)]/20"
                animate={{ scale: [0.85, 1.2, 0.85], opacity: [0.15, 0.35, 0.15] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            <motion.div
              className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 14 }}
            >
              <motion.svg
                className="h-8 w-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                initial={{ pathLength: 0, rotate: -10 }}
                animate={{ pathLength: 1, rotate: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <motion.path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </motion.svg>
            </motion.div>

            <motion.p
              className="mt-4 text-xl font-black text-[var(--text-primary)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
            >
              Payment Successful!
            </motion.p>
            <motion.p
              className="mt-2 text-[var(--text-muted)]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.25 }}
            >
              Thank you for your purchase
            </motion.p>

            {orderInfo && (
              <motion.div
                className="mt-4 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4 text-left"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Tracking ID</p>
                  <motion.span
                    className="rounded-full bg-[var(--brand-primary)]/20 px-2.5 py-1 text-xs font-semibold text-[var(--brand-primary)]"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {orderInfo.status.replaceAll('_', ' ')}
                  </motion.span>
                </div>
                <p className="mt-1 text-sm font-bold text-[var(--brand-secondary)]">{orderInfo.trackingId}</p>

                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Delivery Address</p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {orderInfo.deliveryAddress.line1}, {orderInfo.deliveryAddress.city}, {orderInfo.deliveryAddress.state} {orderInfo.deliveryAddress.postalCode}, {orderInfo.deliveryAddress.country}
                  </p>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Live Status Timeline</p>
                  <ul className="mt-2 space-y-1.5">
                    {orderInfo.timeline.map((point) => (
                      <li key={point.step} className="text-xs text-[var(--text-muted)]">
                        <span className={`mr-2 inline-block h-2 w-2 rounded-full ${point.status === 'done' ? 'bg-green-400' : 'bg-slate-500'}`} />
                        {point.step} - {new Date(point.at).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            <button
              onClick={handleClose}
              className="mt-6 w-full rounded-md bg-[var(--brand-primary)] px-4 py-2 text-[var(--bg-base)] hover:brightness-95 sm:w-auto"
            >
              Close
            </button>
          </div>
        )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}