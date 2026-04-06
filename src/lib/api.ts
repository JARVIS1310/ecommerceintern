import type {
  AdminDashboardData,
  CartSuggestionsResponse,
  ContactConfig,
  ContactSubmission,
  CreatorCollection,
  DeliveryAddress,
  DropData,
  HomeData,
  IconStat,
  LiveFeedData,
  OrderSummary,
  LoyaltyMission,
  OrderTimelinePoint,
  Product,
} from '../types';

const API_BASE = '/api';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  });

  if (!response.ok) {
    const fallbackMessage = 'Request failed';
    const payload = await response.json().catch(() => ({ message: fallbackMessage }));
    throw new Error(payload.message || fallbackMessage);
  }

  return response.json() as Promise<T>;
}

export function getHomeData() {
  return apiFetch<HomeData>('/home');
}

export function getLiveFeed() {
  return apiFetch<LiveFeedData>('/live-feed');
}

export function getNextDrop() {
  return apiFetch<DropData>('/drops/next');
}

export function getCreatorCollections() {
  return apiFetch<CreatorCollection[]>('/creator-collections');
}

export function getLoyaltyMissions() {
  return apiFetch<LoyaltyMission[]>('/loyalty/missions');
}

export function getAboutStats() {
  return apiFetch<IconStat[]>('/about/stats');
}

export function getProducts(category = 'all', search = '') {
  const params = new URLSearchParams();
  params.set('category', category);
  if (search) params.set('search', search);
  return apiFetch<{ categories: string[]; items: Product[] }>(`/products?${params.toString()}`);
}

export function submitContact(payload: { name: string; email: string; message: string }) {
  return apiFetch<{ message: string; deliveredTo: string }>('/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getContactConfig() {
  return apiFetch<ContactConfig>('/contact/config');
}

export function getContactInbox(limit = 8) {
  return apiFetch<{ adminEmail: string; items: ContactSubmission[] }>(`/contact/admin-inbox?limit=${limit}`);
}

export function checkout(payload: { productId: number; cardName: string; deliveryAddress: DeliveryAddress }) {
  return apiFetch<{ message: string; order: OrderSummary }>('/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function checkoutCart(payload: {
  cardName: string;
  deliveryAddress: DeliveryAddress;
  items: Array<{ productId: number; quantity: number }>;
}) {
  return apiFetch<{ message: string; order: OrderSummary }>('/checkout/cart', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getOrderTimeline(orderId: string) {
  return apiFetch<{ orderId: string; timeline: OrderTimelinePoint[] }>(`/orders/${orderId}/timeline`);
}

export function getOrderDetails(orderId: string) {
  return apiFetch<{ order: OrderSummary }>(`/orders/${orderId}`);
}

export function trackOrderByTrackingId(trackingId: string) {
  return apiFetch<{ order: OrderSummary }>(`/orders/track/${encodeURIComponent(trackingId)}`);
}

export function getOrderHistory(limit = 30) {
  return apiFetch<{ items: OrderSummary[] }>(`/orders?limit=${limit}`);
}

export function deleteOrder(orderId: string) {
  return apiFetch<{ message: string; orderId: string }>(`/orders/${encodeURIComponent(orderId)}`, {
    method: 'DELETE',
  });
}

export function getAdminDashboard() {
  return apiFetch<AdminDashboardData>('/admin/dashboard');
}

export function getCartSuggestions(payload: {
  items: Array<{ productId: number; quantity: number; lineTotal: number }>;
}) {
  return apiFetch<CartSuggestionsResponse>('/cart-suggestions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
