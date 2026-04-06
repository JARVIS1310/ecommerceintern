import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { deleteOrder, getOrderHistory, trackOrderByTrackingId } from '../lib/api';
import type { OrderSummary } from '../types';

const statusLabelMap: Record<OrderSummary['status'], string> = {
  payment_confirmed: 'Payment Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out For Delivery',
  delivered: 'Delivered',
};

export default function OrderHistory() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trackingIdInput, setTrackingIdInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<OrderSummary | null>(null);
  const [trackState, setTrackState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [deleteError, setDeleteError] = useState('');
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getOrderHistory(40);
      setOrders(response.items);
    } catch (historyError) {
      const message = historyError instanceof Error ? historyError.message : 'Failed to load order history';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();

    const interval = setInterval(() => {
      getOrderHistory(40)
        .then((response) => setOrders(response.items))
        .catch(() => undefined);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const handleTrack = async () => {
    if (!trackingIdInput.trim()) return;

    setTrackState('loading');
    setError('');

    try {
      const response = await trackOrderByTrackingId(trackingIdInput.trim());
      setTrackedOrder(response.order);
      setTrackState('idle');
    } catch (trackError) {
      const message = trackError instanceof Error ? trackError.message : 'Tracking failed';
      setTrackedOrder(null);
      setTrackState('error');
      setError(message);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const confirmed = window.confirm('Delete this order from the database?');
    if (!confirmed) return;

    setDeleteError('');
    setDeletingOrderId(orderId);

    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      setTrackedOrder((current) => (current?.id === orderId ? null : current));
    } catch (deleteOrderError) {
      const message = deleteOrderError instanceof Error ? deleteOrderError.message : 'Failed to delete order';
      setDeleteError(message);
    } finally {
      setDeletingOrderId(null);
    }
  };

  const displayedOrders = useMemo(() => {
    if (!trackedOrder) return orders;

    const exists = orders.some((order) => order.id === trackedOrder.id);
    return exists ? orders : [trackedOrder, ...orders];
  }, [orders, trackedOrder]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black">Order History</h1>
          <p className="mt-3 text-[var(--text-muted)]">Track every order with backend-powered live status.</p>
        </motion.div>

        <motion.section
          className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-lg"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="relative block flex-1">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[var(--text-muted)]" />
              <input
                value={trackingIdInput}
                onChange={(event) => setTrackingIdInput(event.target.value)}
                placeholder="Enter tracking ID (example: TRK-...)"
                className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--input-bg)] py-2.5 pl-9 pr-3 text-[var(--text-primary)] outline-none focus:border-[var(--brand-secondary)]"
              />
            </label>
            <button
              onClick={handleTrack}
              disabled={trackState === 'loading'}
              className="rounded-lg bg-[var(--brand-primary)] px-4 py-2.5 font-semibold text-[var(--bg-base)] transition hover:brightness-95 disabled:opacity-60"
            >
              {trackState === 'loading' ? 'Tracking...' : 'Track Order'}
            </button>
            <button
              onClick={loadHistory}
              className="rounded-lg bg-[var(--surface-elevated)] px-4 py-2.5 font-semibold text-[var(--text-primary)] transition hover:brightness-110"
            >
              Refresh History
            </button>
          </div>
        </motion.section>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        {deleteError && <p className="mt-2 text-sm text-red-500">{deleteError}</p>}

        {loading ? (
          <p className="mt-8 text-[var(--text-muted)]">Loading order history...</p>
        ) : displayedOrders.length === 0 ? (
          <p className="mt-8 text-[var(--text-muted)]">No orders found yet.</p>
        ) : (
          <div className="mt-8 grid gap-4">
            <AnimatePresence>
              {displayedOrders.map((order, index) => (
                <motion.article
                  key={order.id}
                  className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-md"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Order ID</p>
                      <p className="text-sm font-semibold">{order.id}</p>
                      <p className="mt-1 text-xs text-[var(--brand-secondary)]">Tracking: {order.trackingId}</p>
                    </div>
                      <div className="flex items-center gap-2">
                        <motion.span
                          className="rounded-full bg-[var(--brand-primary)]/20 px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]"
                          animate={{ scale: [1, 1.04, 1] }}
                          transition={{ duration: 1.4, repeat: Infinity }}
                        >
                          {statusLabelMap[order.status]}
                        </motion.span>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          disabled={deletingOrderId === order.id}
                          className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
                        >
                          {deletingOrderId === order.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                  </div>

                  <div className="mt-3 text-sm text-[var(--text-muted)]">
                    {order.deliveryAddress.line1}, {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.postalCode}, {order.deliveryAddress.country}
                  </div>

                  <div className="mt-4 grid gap-2 md:grid-cols-5">
                    {order.timeline.map((point) => (
                      <div key={point.step} className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-elevated)] px-3 py-2">
                        <p className="text-xs font-semibold text-[var(--text-primary)]">{point.step}</p>
                        <p className="mt-1 text-[11px] text-[var(--text-muted)]">{new Date(point.at).toLocaleString()}</p>
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                          <span className={`inline-block h-2 w-2 rounded-full ${point.status === 'done' ? 'bg-green-400' : 'bg-slate-500'}`} />
                          {point.status === 'done' ? 'Completed' : 'Pending'}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
