import { Bell, Mail, PackageCheck, Trash2, Truck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { deleteOrder, getAdminDashboard } from '../lib/api';
import type { AdminDashboardData, OrderStatus } from '../types';

const statusLabel: Record<OrderStatus, string> = {
  payment_confirmed: 'Payment Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out For Delivery',
  delivered: 'Delivered',
};

const statusColor: Record<OrderStatus, string> = {
  payment_confirmed: 'bg-sky-500/20 text-sky-300',
  packed: 'bg-indigo-500/20 text-indigo-300',
  shipped: 'bg-amber-500/20 text-amber-300',
  out_for_delivery: 'bg-orange-500/20 text-orange-300',
  delivered: 'bg-emerald-500/20 text-emerald-300',
};

const initialData: AdminDashboardData = {
  summary: {
    totalOrders: 0,
    totalContacts: 0,
    shippedLike: 0,
    delivered: 0,
  },
  statusBreakdown: {
    payment_confirmed: 0,
    packed: 0,
    shipped: 0,
    out_for_delivery: 0,
    delivered: 0,
  },
  recentOrders: [],
  recentContacts: [],
};

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  const loadDashboard = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError('');
    }

    try {
      const response = await getAdminDashboard();
      setData(response);
      setError('');
    } catch (dashboardError) {
      const message = dashboardError instanceof Error ? dashboardError.message : 'Failed to load admin dashboard';
      setError(message);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const confirmed = window.confirm('Delete this order from the database?');
    if (!confirmed) return;

    setDeleteError('');
    setDeletingOrderId(orderId);

    try {
      await deleteOrder(orderId);
      await loadDashboard(true);
    } catch (deleteOrderError) {
      const message = deleteOrderError instanceof Error ? deleteOrderError.message : 'Failed to delete order';
      setDeleteError(message);
    } finally {
      setDeletingOrderId(null);
    }
  };

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard(true);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const progressPercent = useMemo(() => {
    const total = Object.values(data.statusBreakdown).reduce((sum, count) => sum + count, 0);
    if (total === 0) return 0;
    return Math.round((data.statusBreakdown.delivered / total) * 100);
  }, [data.statusBreakdown]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black">Admin Dashboard</h1>
            <p className="mt-2 text-[var(--text-muted)]">Live order flow, shipment movement, and contact inbox from backend DB.</p>
          </div>
          <button
            onClick={() => loadDashboard()}
            className="rounded-lg bg-[var(--brand-primary)] px-4 py-2 font-semibold text-[var(--bg-base)] transition hover:brightness-95"
          >
            Refresh
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        {deleteError && <p className="mt-2 text-sm text-red-500">{deleteError}</p>}

        <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Orders', value: data.summary.totalOrders, icon: PackageCheck },
            { label: 'Delivered', value: data.summary.delivered, icon: Truck },
            { label: 'In Shipment', value: data.summary.shippedLike, icon: Bell },
            { label: 'Contact Messages', value: data.summary.totalContacts, icon: Mail },
          ].map((card, index) => (
            <motion.div
              key={card.label}
              className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-md"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--text-muted)]">{card.label}</p>
                <card.icon className="h-4 w-4 text-[var(--brand-secondary)]" />
              </div>
              <p className="mt-2 text-3xl font-black text-[var(--brand-primary)]">{card.value}</p>
            </motion.div>
          ))}
        </div>

        <motion.section
          className="mt-6 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between text-sm">
            <p className="font-semibold">Delivered Ratio</p>
            <p className="text-[var(--text-muted)]">{progressPercent}% delivered</p>
          </div>
          <div className="mt-2 h-2.5 rounded-full bg-[var(--surface-elevated)]">
            <motion.div
              className="h-2.5 rounded-full bg-[var(--brand-cta)]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </motion.section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
          <section className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">Recent Orders</h2>
              <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Auto updates</p>
            </div>

            {loading ? (
              <p className="mt-4 text-[var(--text-muted)]">Loading orders...</p>
            ) : data.recentOrders.length === 0 ? (
              <p className="mt-4 text-[var(--text-muted)]">No orders yet.</p>
            ) : (
              <div className="mt-4 max-h-[560px] space-y-3 overflow-auto pr-1">
                <AnimatePresence>
                  {data.recentOrders.map((order) => (
                    <motion.article
                      key={order.id}
                      className="rounded-xl border border-[var(--border-soft)] bg-[linear-gradient(135deg,var(--surface-elevated)_0%,var(--surface)_100%)] p-3 shadow-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Order</p>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{order.id}</p>
                          <p className="mt-0.5 text-xs text-[var(--brand-secondary)]">{order.trackingId}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor[order.status]}`}>
                            {statusLabel[order.status]}
                          </span>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            disabled={deletingOrderId === order.id}
                            className="inline-flex items-center gap-1 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {deletingOrderId === order.id ? 'Deleting' : 'Delete'}
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-[var(--text-muted)]">
                        {order.deliveryAddress.city}, {order.deliveryAddress.state} • {new Date(order.createdAt).toLocaleString()}
                      </p>
                      <div className="mt-2 grid grid-cols-5 gap-1.5">
                        {order.timeline.map((point) => (
                          <span key={point.step} className={`h-1.5 rounded-full ${point.status === 'done' ? 'bg-[var(--brand-primary)]' : 'bg-[var(--surface)]'}`} />
                        ))}
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">Contact Inbox</h2>
              <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Latest</p>
            </div>

            {loading ? (
              <p className="mt-4 text-[var(--text-muted)]">Loading messages...</p>
            ) : data.recentContacts.length === 0 ? (
              <p className="mt-4 text-[var(--text-muted)]">No contact messages yet.</p>
            ) : (
              <div className="mt-4 max-h-[380px] space-y-2 overflow-auto pr-1">
                {data.recentContacts.map((message) => (
                  <motion.article
                    key={message.id}
                    className="rounded-2xl border border-[var(--border-soft)] bg-[linear-gradient(135deg,var(--surface-elevated)_0%,var(--surface)_100%)] p-3 shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{message.name}</p>
                        <p className="mt-0.5 text-[11px] uppercase tracking-wider text-[var(--text-muted)]">Customer Message</p>
                      </div>
                      <span className="rounded-full bg-[var(--brand-primary)]/15 px-2.5 py-1 text-[11px] font-semibold text-[var(--brand-primary)]">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--brand-secondary)]">{message.email}</p>
                    <p className="mt-2 text-sm leading-5 text-[var(--text-muted)] line-clamp-3">{message.message}</p>
                  </motion.article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
