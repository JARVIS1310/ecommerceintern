export interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  image: string;
  category: string;
  description: string;
  quantity?: number;
  liveViewers?: number;
  recommendationReason?: string;
  trust?: {
    material: string;
    origin: string;
    carbonKg: number;
    warrantyMonths: number;
  };
}

export interface HomeFeature {
  name: string;
  description: string;
  icon: 'TrendingUp' | 'ShoppingBag' | 'Users';
  color: string;
}

export interface HomeStat {
  value: string;
  label: string;
}

export interface HomeTestimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
}

export interface HomeData {
  hero: {
    heading: string;
    highlighted: string;
    subheading: string;
  };
  stats: HomeStat[];
  features: HomeFeature[];
  testimonials: HomeTestimonial[];
}

export interface IconStat {
  name: string;
  value: string;
  icon: 'Users' | 'Globe' | 'Award' | 'Shield';
}

export interface LiveFeedData {
  activeNow: number;
  pulse: Array<{ id: string; message: string; at: string }>;
}

export interface DropData {
  title: string;
  description: string;
  startsAt: string;
}

export interface CreatorCollection {
  id: string;
  creator: string;
  title: string;
  highlight: string;
  products: Product[];
}

export interface LoyaltyMission {
  id: string;
  title: string;
  reward: string;
  progress: number;
}

export interface CartSuggestionsResponse {
  message: string;
  recommendations: Product[];
}

export interface OrderTimelinePoint {
  step: string;
  at: string;
  status: 'done' | 'pending';
}

export type OrderStatus =
  | 'payment_confirmed'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered';

export interface DeliveryAddress {
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderSummary {
  id: string;
  status: OrderStatus;
  trackingId: string;
  createdAt: string;
  amount: number;
  deliveryAddress: DeliveryAddress;
  timeline: OrderTimelinePoint[];
}

export interface ContactConfig {
  adminEmail: string;
}

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  message: string;
  deliveredTo: string;
  createdAt: string;
}

export interface AdminDashboardData {
  summary: {
    totalOrders: number;
    totalContacts: number;
    shippedLike: number;
    delivered: number;
  };
  statusBreakdown: Record<OrderStatus, number>;
  recentOrders: OrderSummary[];
  recentContacts: ContactSubmission[];
}
