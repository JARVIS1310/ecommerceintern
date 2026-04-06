import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSONFilePreset } from 'lowdb/node';
import { aboutStats, creatorCollections, homeData, loyaltyMissions, products } from './data.js';

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const ADMIN_CONTACT_EMAIL = 'admin-inbox@vendorhub.demo';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATABASE_PATH = path.join(__dirname, 'database.json');
const DIST_PATH = path.join(__dirname, '..', 'dist');

app.use(cors());
app.use(express.json());

function createDefaultDatabase() {
  return {
    contactSubmissions: [],
    orders: [],
  };
}
const database = await JSONFilePreset(DATABASE_PATH, createDefaultDatabase());
database.data ||= createDefaultDatabase();
database.data.contactSubmissions ||= [];
database.data.orders ||= [];

const contactSubmissions = database.data.contactSubmissions;
const orders = database.data.orders;

async function persistDatabase() {
  await database.write();
}

function nextNumericId(items) {
  return items.reduce((maxId, item) => Math.max(maxId, Number(item.id) || 0), 0) + 1;
}

function sanitizeAddress(address = {}) {
  return {
    line1: String(address.line1 || '').trim(),
    city: String(address.city || '').trim(),
    state: String(address.state || '').trim(),
    postalCode: String(address.postalCode || '').trim(),
    country: String(address.country || '').trim(),
  };
}

function isValidAddress(address = {}) {
  const candidate = sanitizeAddress(address);
  return Boolean(
    candidate.line1 && candidate.city && candidate.state && candidate.postalCode && candidate.country
  );
}

function createTrackingId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.floor(Math.random() * 900 + 100);
  return `TRK-${stamp}-${randomPart}`;
}

function createOrderProgressPlan() {
  const packedAfterMs = (4 + Math.floor(Math.random() * 3)) * 1000;
  const shippedAfterMs = packedAfterMs + (5 + Math.floor(Math.random() * 4)) * 1000;
  const outForDeliveryAfterMs = shippedAfterMs + (6 + Math.floor(Math.random() * 4)) * 1000;
  const deliveredAfterMs = outForDeliveryAfterMs + (10 + Math.floor(Math.random() * 5)) * 1000;

  return {
    packedAfterMs,
    shippedAfterMs,
    outForDeliveryAfterMs,
    deliveredAfterMs,
  };
}

function getOrderProgressPlan(order) {
  const plan = order?.progressPlan;
  if (
    plan &&
    Number.isFinite(plan.packedAfterMs) &&
    Number.isFinite(plan.shippedAfterMs) &&
    Number.isFinite(plan.outForDeliveryAfterMs) &&
    Number.isFinite(plan.deliveredAfterMs)
  ) {
    return plan;
  }

  return {
    packedAfterMs: 4 * 1000,
    shippedAfterMs: 10 * 1000,
    outForDeliveryAfterMs: 16 * 1000,
    deliveredAfterMs: 28 * 1000,
  };
}

function getOrderTimeline(order) {
  const placedAt = new Date(order.createdAt).getTime();
  const plan = getOrderProgressPlan(order);
  const checkpoints = [
    { key: 'Payment Confirmed', at: placedAt },
    { key: 'Packed by Vendor', at: placedAt + plan.packedAfterMs },
    { key: 'Shipped', at: placedAt + plan.shippedAfterMs },
    { key: 'Out for Delivery', at: placedAt + plan.outForDeliveryAfterMs },
    { key: 'Delivered', at: placedAt + plan.deliveredAfterMs },
  ];

  const now = Date.now();
  return checkpoints.map((point) => ({
    step: point.key,
    at: new Date(point.at).toISOString(),
    status: now >= point.at ? 'done' : 'pending',
  }));
}

function getOrderStatus(order) {
  const placedAt = new Date(order.createdAt).getTime();
  const plan = getOrderProgressPlan(order);
  const elapsed = Date.now() - placedAt;

  if (elapsed >= plan.deliveredAfterMs) return 'delivered';
  if (elapsed >= plan.outForDeliveryAfterMs) return 'out_for_delivery';
  if (elapsed >= plan.shippedAfterMs) return 'shipped';
  if (elapsed >= plan.packedAfterMs) return 'packed';
  return 'payment_confirmed';
}

function enrichOrder(order) {
  return {
    ...order,
    status: getOrderStatus(order),
    timeline: getOrderTimeline(order),
  };
}

const trustByCategory = {
  electronics: {
    material: 'Recycled aluminum and certified components',
    origin: 'Assembled in India with globally sourced parts',
    carbonKg: 12.4,
    warrantyMonths: 24,
  },
  home: {
    material: 'Mixed sustainable wood, ceramic, and cotton blends',
    origin: 'Crafted by partner studios in Jaipur and Pune',
    carbonKg: 8.1,
    warrantyMonths: 18,
  },
  accessories: {
    material: 'Premium leather and recycled travel textiles',
    origin: 'Hand-finished in small-batch workshops',
    carbonKg: 6.7,
    warrantyMonths: 12,
  },
  fashion: {
    material: 'Organic cotton and low-impact dyes',
    origin: 'Ethical manufacturing partner network in India',
    carbonKg: 4.3,
    warrantyMonths: 6,
  },
};

function inferIntent(prompt = '') {
  const text = prompt.toLowerCase();
  if (text.includes('travel')) return 'travel';
  if (text.includes('home') || text.includes('cozy')) return 'home';
  if (text.includes('gift')) return 'gift';
  if (text.includes('work') || text.includes('setup') || text.includes('desk')) return 'work';
  return 'general';
}

function tokenizePrompt(prompt = '') {
  return prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function inferBudget(prompt = '', explicitBudget) {
  if (Number.isFinite(Number(explicitBudget)) && Number(explicitBudget) > 0) {
    return Number(explicitBudget);
  }

  const match = prompt.match(/(?:under|below|upto|up to|within)\s*\$?(\d{2,5})/i);
  if (match) {
    return Number(match[1]);
  }

  return Number.MAX_SAFE_INTEGER;
}

function categoryAffinity(tokens, category) {
  const categoryKeywords = {
    electronics: ['tech', 'gaming', 'audio', 'camera', 'device', 'productivity'],
    home: ['home', 'cozy', 'kitchen', 'coffee', 'desk', 'office', 'furniture'],
    accessories: ['travel', 'bag', 'carry', 'portable', 'style'],
    fashion: ['fashion', 'hoodie', 'wear', 'outfit', 'clothing'],
  };

  const hints = categoryKeywords[category] || [];
  return hints.some((hint) => tokens.includes(hint)) ? 1 : 0;
}

function recommendationReason(product, scoreDetails) {
  if (scoreDetails.keywordScore >= 2) {
    return 'Directly matches your prompt keywords and shopping intent.';
  }
  if (scoreDetails.budgetScore > 0) {
    return 'Fits your target budget while keeping quality high.';
  }
  if (product.rating >= 4.8) {
    return 'Top-rated pick in this category for reliable customer satisfaction.';
  }
  return 'Balanced recommendation for value, relevance, and product quality.';
}

function dynamicViewers() {
  return 8 + Math.floor((Date.now() / 1000) % 37);
}

function randomPulseMessages() {
  const messages = [
    '17 shoppers are exploring creator collections right now.',
    'New eco-friendly picks just became available in Home.',
    'Trending now: Workspace essentials and ergonomic upgrades.',
    'Smart cart users are saving an average of 11% per order.',
  ];

  return messages.map((message, index) => ({
    id: `pulse-${index + 1}`,
    message,
    at: new Date(Date.now() - index * 2 * 60 * 1000).toISOString(),
  }));
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'vendorhub-api', now: new Date().toISOString() });
});

app.get('/api/home', (_req, res) => {
  res.json(homeData);
});

app.get('/api/about/stats', (_req, res) => {
  res.json(aboutStats);
});

app.get('/api/products', (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category : 'all';
  const search = typeof req.query.search === 'string' ? req.query.search.toLowerCase() : '';

  const filtered = products.filter((product) => {
    const categoryMatch = category === 'all' || product.category === category;
    const searchMatch =
      product.name.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search);

    return categoryMatch && searchMatch;
  });

  const enriched = filtered.map((product) => ({
    ...product,
    trust: trustByCategory[product.category] || {
      material: 'Verified partner materials',
      origin: 'Multiple certified regional vendors',
      carbonKg: 5,
      warrantyMonths: 12,
    },
    liveViewers: dynamicViewers(),
  }));

  res.json({
    categories: ['all', ...new Set(products.map((product) => product.category))],
    items: enriched,
  });
});

app.get('/api/live-feed', (_req, res) => {
  res.json({
    activeNow: 180 + Math.floor((Date.now() / 1000) % 60),
    pulse: randomPulseMessages(),
  });
});

app.get('/api/drops/next', (_req, res) => {
  const now = Date.now();
  const nextDropAt = now + 1000 * 60 * 37;
  res.json({
    title: 'Midnight Creator Drop',
    description: 'Limited run bundles curated by top creators.',
    startsAt: new Date(nextDropAt).toISOString(),
  });
});

app.get('/api/creator-collections', (_req, res) => {
  const collections = creatorCollections.map((collection) => ({
    ...collection,
    products: collection.productIds
      .map((id) => products.find((product) => product.id === id))
      .filter(Boolean),
  }));

  res.json(collections);
});

app.get('/api/loyalty/missions', (_req, res) => {
  res.json(loyaltyMissions);
});

app.get('/api/contact/config', (_req, res) => {
  res.json({ adminEmail: ADMIN_CONTACT_EMAIL });
});

app.get('/api/contact/admin-inbox', (req, res) => {
  const rawLimit = Number(req.query.limit);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 50) : 8;
  const items = [...contactSubmissions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  res.json({
    adminEmail: ADMIN_CONTACT_EMAIL,
    items,
  });
});

app.get('/api/admin/database', (_req, res) => {
  res.json({
    counts: {
      contacts: contactSubmissions.length,
      orders: orders.length,
    },
    database: database.data,
  });
});

app.get('/api/admin/dashboard', (_req, res) => {
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20)
    .map((order) => enrichOrder(order));

  const recentContacts = [...contactSubmissions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  const statusBreakdown = {
    payment_confirmed: 0,
    packed: 0,
    shipped: 0,
    out_for_delivery: 0,
    delivered: 0,
  };

  recentOrders.forEach((order) => {
    statusBreakdown[order.status] += 1;
  });

  res.json({
    summary: {
      totalOrders: orders.length,
      totalContacts: contactSubmissions.length,
      shippedLike: statusBreakdown.shipped + statusBreakdown.out_for_delivery,
      delivered: statusBreakdown.delivered,
    },
    statusBreakdown,
    recentOrders,
    recentContacts,
  });
});

app.post('/api/concierge/recommend', (req, res) => {
  const { prompt = '', budget } = req.body || {};
  const intent = inferIntent(prompt);
  const numericBudget = inferBudget(prompt, budget);
  const tokens = tokenizePrompt(prompt);

  const byIntent = products.filter((product) => {
    if (intent === 'travel') return ['accessories', 'electronics'].includes(product.category);
    if (intent === 'home') return product.category === 'home';
    if (intent === 'work') return ['electronics', 'home'].includes(product.category);
    return true;
  });

  const rankedPool = (byIntent.length ? byIntent : products)
    .map((product) => {
      const text = `${product.name} ${product.description} ${product.category}`.toLowerCase();
      const keywordScore = tokens.reduce((score, token) => (text.includes(token) ? score + 1 : score), 0);
      const affinityScore = categoryAffinity(tokens, product.category);
      const ratingScore = product.rating * 8;
      const budgetScore =
        numericBudget === Number.MAX_SAFE_INTEGER
          ? 0
          : product.price <= numericBudget
            ? Math.max(0, 18 - (product.price / numericBudget) * 18)
            : -30;

      const totalScore = keywordScore * 18 + affinityScore * 12 + ratingScore + budgetScore;

      return {
        ...product,
        _score: totalScore,
        _scoreDetails: { keywordScore, budgetScore },
      };
    })
    .sort((a, b) => b._score - a._score);

  const ranked = [];
  const categoryCount = new Map();

  for (const item of rankedPool) {
    const currentCategoryCount = categoryCount.get(item.category) || 0;
    if (currentCategoryCount >= 2) continue;

    ranked.push({
      ...item,
      recommendationReason: recommendationReason(item, item._scoreDetails),
    });
    categoryCount.set(item.category, currentCategoryCount + 1);

    if (ranked.length === 4) break;
  }

  if (ranked.length < 4) {
    for (const item of rankedPool) {
      if (ranked.some((picked) => picked.id === item.id)) continue;
      ranked.push({
        ...item,
        recommendationReason: recommendationReason(item, item._scoreDetails),
      });
      if (ranked.length === 4) break;
    }
  }

  const bundle = ranked.slice(0, 2);
  const cleanRecommendations = ranked.map(({ _score, _scoreDetails, ...product }) => product);
  const cleanBundle = bundle.map(({ _score, _scoreDetails, ...product }) => product);
  const bundlePrice = Number(cleanBundle.reduce((sum, product) => sum + product.price, 0).toFixed(2));

  res.json({
    intent,
    recommendations: cleanRecommendations,
    bundle: {
      title: 'Suggested Smart Bundle',
      savingsHint: 'Bundle these picks and save up to 8% at checkout.',
      items: cleanBundle,
      estimatedPrice: bundlePrice,
    },
  });
});

app.post('/api/cart-suggestions', (req, res) => {
  const { items = [] } = req.body || {};

  const inCartIds = new Set(items.map((item) => Number(item.productId)));
  const inCartProducts = products.filter((product) => inCartIds.has(product.id));
  const categories = new Set(inCartProducts.map((product) => product.category));

  const recommendations = products
    .filter((product) => !inCartIds.has(product.id))
    .filter((product) => !categories.has(product.category) || product.rating >= 4.7)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  const total = Number(items.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0).toFixed(2));
  const freeShippingThreshold = 800;

  res.json({
    message:
      total < freeShippingThreshold
        ? `Add $${(freeShippingThreshold - total).toFixed(2)} more to unlock free shipping.`
        : 'You have unlocked free shipping.',
    recommendations,
  });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    res.status(400).json({ message: 'Name, email, and message are required.' });
    return;
  }

  const record = {
    id: nextNumericId(contactSubmissions),
    name,
    email,
    message,
    deliveredTo: ADMIN_CONTACT_EMAIL,
    createdAt: new Date().toISOString(),
  };

  contactSubmissions.push(record);
  await persistDatabase();
  res.status(201).json({
    message: `Message received by ${ADMIN_CONTACT_EMAIL}. We will get back to you soon.`,
    deliveredTo: ADMIN_CONTACT_EMAIL,
  });
});

app.post('/api/checkout', async (req, res) => {
  const { productId, cardName, deliveryAddress } = req.body || {};
  const product = products.find((item) => item.id === productId);

  if (!product) {
    res.status(404).json({ message: 'Product not found.' });
    return;
  }

  if (!isValidAddress(deliveryAddress)) {
    res.status(400).json({ message: 'Valid delivery address is required.' });
    return;
  }

  const order = {
    id: `ORD-${Date.now()}`,
    trackingId: createTrackingId(),
    progressPlan: createOrderProgressPlan(),
    productId,
    amount: product.price,
    cardName: cardName || 'Customer',
    deliveryAddress: sanitizeAddress(deliveryAddress),
    createdAt: new Date().toISOString(),
  };

  orders.push(order);
  await persistDatabase();
  res.status(201).json({
    message: 'Payment successful',
    order: enrichOrder(order),
  });
});

app.post('/api/checkout/cart', async (req, res) => {
  const { items, cardName, deliveryAddress } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: 'Cart items are required.' });
    return;
  }

  if (!isValidAddress(deliveryAddress)) {
    res.status(400).json({ message: 'Valid delivery address is required.' });
    return;
  }

  const normalizedItems = items
    .map((item) => ({
      productId: Number(item.productId),
      quantity: Math.max(1, Number(item.quantity) || 1),
    }))
    .filter((item) => Number.isFinite(item.productId));

  if (normalizedItems.length === 0) {
    res.status(400).json({ message: 'No valid cart items found.' });
    return;
  }

  const orderItems = normalizedItems
    .map((item) => {
      const product = products.find((productEntry) => productEntry.id === item.productId);
      if (!product) return null;

      return {
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        lineTotal: Number((product.price * item.quantity).toFixed(2)),
      };
    })
    .filter(Boolean);

  if (orderItems.length === 0) {
    res.status(404).json({ message: 'Products in cart were not found.' });
    return;
  }

  const amount = Number(
    orderItems.reduce((total, item) => total + item.lineTotal, 0).toFixed(2)
  );

  const order = {
    id: `ORD-${Date.now()}`,
    trackingId: createTrackingId(),
    progressPlan: createOrderProgressPlan(),
    cardName: cardName || 'Customer',
    itemCount: orderItems.reduce((total, item) => total + item.quantity, 0),
    amount,
    items: orderItems,
    deliveryAddress: sanitizeAddress(deliveryAddress),
    createdAt: new Date().toISOString(),
  };

  orders.push(order);
  await persistDatabase();
  res.status(201).json({
    message: 'Cart checkout successful',
    order: enrichOrder(order),
  });
});

app.get('/api/orders', (req, res) => {
  const rawLimit = Number(req.query.limit);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 30;
  const items = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map((order) => enrichOrder(order));

  res.json({ items });
});

app.get('/api/orders/track/:trackingId', (req, res) => {
  const trackingId = String(req.params.trackingId || '');
  const order = orders.find((entry) => entry.trackingId === trackingId);

  if (!order) {
    res.status(404).json({ message: 'Order with this tracking ID was not found.' });
    return;
  }

  res.json({ order: enrichOrder(order) });
});

app.get('/api/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const order = orders.find((entry) => entry.id === orderId);

  if (!order) {
    res.status(404).json({ message: 'Order not found.' });
    return;
  }

  res.json({ order: enrichOrder(order) });
});

app.delete('/api/orders/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const orderIndex = orders.findIndex((entry) => entry.id === orderId);

  if (orderIndex === -1) {
    res.status(404).json({ message: 'Order not found.' });
    return;
  }

  orders.splice(orderIndex, 1);
  await persistDatabase();

  res.json({
    message: 'Order deleted successfully.',
    orderId,
  });
});

app.get('/api/orders/:orderId/timeline', (req, res) => {
  const { orderId } = req.params;
  const order = orders.find((entry) => entry.id === orderId);

  if (!order) {
    res.status(404).json({ message: 'Order not found.' });
    return;
  }

  res.json({
    orderId,
    timeline: getOrderTimeline(order),
  });
});

app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'API endpoint not found.' });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(DIST_PATH));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ message: 'API endpoint not found.' });
      return;
    }

    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`VendorHub API running on http://localhost:${PORT}`);
});
