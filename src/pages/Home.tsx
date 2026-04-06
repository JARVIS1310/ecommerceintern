import { ArrowRight, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  getCreatorCollections,
  getHomeData,
  getLiveFeed,
  getLoyaltyMissions,
  getNextDrop,
} from '../lib/api';
import type { CreatorCollection, DropData, HomeData, LiveFeedData, LoyaltyMission } from '../types';

const iconMap = {
  TrendingUp,
  ShoppingBag,
  Users,
};

const defaultHomeData: HomeData = {
  hero: {
    heading: 'Transform Your Business',
    highlighted: 'With Online Selling',
    subheading:
      'Join thousands of vendors who have successfully grown their business online. Start selling today and reach customers worldwide.',
  },
  stats: [],
  features: [],
  testimonials: [],
};

function secondsLeft(startsAt: string) {
  return Math.max(0, Math.floor((new Date(startsAt).getTime() - Date.now()) / 1000));
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [activePulsePage, setActivePulsePage] = useState(0);
  const [homeData, setHomeData] = useState<HomeData>(defaultHomeData);
  const [liveFeed, setLiveFeed] = useState<LiveFeedData | null>(null);
  const [nextDrop, setNextDrop] = useState<DropData | null>(null);
  const [dropCountdown, setDropCountdown] = useState(0);
  const [collections, setCollections] = useState<CreatorCollection[]>([]);
  const [missions, setMissions] = useState<LoyaltyMission[]>([]);

  useEffect(() => {
    getHomeData().then(setHomeData).catch(() => setHomeData(defaultHomeData));
    getLiveFeed().then(setLiveFeed).catch(() => setLiveFeed(null));
    getNextDrop().then(setNextDrop).catch(() => setNextDrop(null));
    getCreatorCollections().then(setCollections).catch(() => setCollections([]));
    getLoyaltyMissions().then(setMissions).catch(() => setMissions([]));
  }, []);

  useEffect(() => {
    if (homeData.features.length === 0) return;

    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % homeData.features.length);
    }, 2800);

    return () => clearInterval(interval);
  }, [homeData.features.length]);

  useEffect(() => {
    if (!nextDrop?.startsAt) return;

    setDropCountdown(secondsLeft(nextDrop.startsAt));

    const interval = setInterval(() => {
      setDropCountdown(secondsLeft(nextDrop.startsAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [nextDrop?.startsAt]);

  useEffect(() => {
    const pulseItems = liveFeed?.pulse ?? [];
    if (pulseItems.length <= 3) {
      setActivePulsePage(0);
      return;
    }

    const totalPages = Math.ceil(pulseItems.length / 3);
    const interval = setInterval(() => {
      setActivePulsePage((prev) => (prev + 1) % totalPages);
    }, 2800);

    return () => clearInterval(interval);
  }, [liveFeed?.pulse]);

  const features = useMemo(() => homeData.features, [homeData.features]);
  const pulseItems = liveFeed?.pulse ?? [];
  const pulsePages = useMemo(() => {
    if (pulseItems.length === 0) return [] as typeof pulseItems[];

    const pages: typeof pulseItems[] = [];
    for (let i = 0; i < pulseItems.length; i += 3) {
      pages.push(pulseItems.slice(i, i + 3));
    }

    return pages;
  }, [pulseItems]);
  const displayedPulseItems = pulsePages[activePulsePage] ?? pulseItems.slice(0, 3);
  const primaryPulseItem = displayedPulseItems[0];
  const secondaryPulseItems = displayedPulseItems.slice(1);

  return (
    <div className="bg-[var(--bg-base)] text-[var(--text-primary)]">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_20%_20%,var(--hero-glow-a)_0%,transparent_40%),radial-gradient(circle_at_80%_10%,var(--hero-glow-b)_0%,transparent_35%),linear-gradient(135deg,var(--hero-start)_0%,var(--hero-end)_100%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block">{homeData.hero.heading}</span>
              <span className="block text-[#f4d58d]">{homeData.hero.highlighted}</span>
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-base text-[#f9fafb] sm:text-lg md:text-xl">
              {homeData.hero.subheading}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-full bg-[#f4d58d] px-8 py-3 text-base font-semibold text-[#1f2937] transition-transform hover:scale-105"
              >
                Explore Catalog
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/50 bg-white/10 px-8 py-3 text-base font-semibold text-white transition-transform hover:scale-105"
              >
                Join Creator Program
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-[var(--border-soft)] bg-[var(--bg-accent)] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-3 shadow-lg md:grid-cols-[300px_1fr] md:items-stretch">
            <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-3.5">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Live Commerce Floor</p>
              <div className="mt-3 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-[var(--brand-cta)]" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Live</span>
                </div>
                <span className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Shoppers Online</span>
              </div>
              <p className="mt-3 text-3xl font-black leading-none text-[var(--brand-primary)]">{liveFeed?.activeNow ?? '--'}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Updated in real time from current sessions</p>
            </div>

            <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-accent)] px-3.5 py-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Live Pulse</p>
                <span className="text-xs text-[var(--text-muted)]">{activePulsePage + 1}/{Math.max(1, pulsePages.length)}</span>
              </div>
              <div className="mt-2.5 min-h-[108px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePulsePage}
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                  >
                    {primaryPulseItem ? (
                      <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[var(--brand-secondary)]" />
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Latest activity</span>
                        </div>
                        <p className="mt-1.5 text-sm font-medium text-[var(--text-primary)]">{primaryPulseItem.message}</p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-muted)]">
                        Waiting for activity updates...
                      </div>
                    )}

                    {secondaryPulseItems.length > 0 && (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {secondaryPulseItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-muted)]"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-secondary)]" />
                            <span className="truncate">{item.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {nextDrop && (
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-lg"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Live Commerce Drop</p>
              <h3 className="mt-1 text-2xl font-black">{nextDrop.title}</h3>
              <p className="mt-2 text-[var(--text-muted)]">{nextDrop.description}</p>
              <div className="mt-4 inline-flex rounded-full bg-[var(--brand-primary)] px-4 py-2 text-white">
                Starts in {formatCountdown(dropCountdown)}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {homeData.stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-lg text-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
            >
              <div className="text-3xl font-black text-[var(--brand-secondary)]">{stat.value}</div>
              <div className="mt-1 text-[var(--text-muted)]">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-accent)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">Built for modern online sellers</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-[var(--text-muted)]">
              Live data, powerful workflows, and customer-ready storefront experiences.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = iconMap[feature.icon];
              const isActive = activeFeature === index;

              return (
                <motion.article
                  key={feature.name}
                  className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-lg"
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -6 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45 }}
                  animate={{ scale: isActive ? 1.03 : 1 }}
                >
                  <div className={`inline-flex rounded-xl bg-gradient-to-r ${feature.color} p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[var(--text-primary)]">{feature.name}</h3>
                  <p className="mt-3 text-[var(--text-muted)]">{feature.description}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">Creator Collections</h2>
            <Link to="/products" className="text-sm font-semibold text-[var(--brand-primary)]">View all</Link>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {collections.map((collection) => (
              <motion.div
                key={collection.id}
                className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-md"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{collection.creator}</p>
                <h3 className="mt-2 text-lg font-bold">{collection.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{collection.highlight}</p>
                <p className="mt-4 text-sm font-semibold text-[var(--brand-primary)]">
                  Includes {collection.products.length} picks
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border-soft)] bg-[var(--surface-elevated)] py-16 text-[var(--text-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black">Loyalty Missions</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {missions.map((mission) => (
              <motion.div
                key={mission.id}
                className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-md"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="font-semibold">{mission.title}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{mission.reward}</p>
                <div className="mt-4 h-2 rounded-full bg-[var(--bg-base)]/70">
                  <div
                    className="h-2 rounded-full bg-[var(--brand-cta)]"
                    style={{ width: `${mission.progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[var(--text-muted)]">Progress: {mission.progress}%</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border-soft)] bg-[var(--surface)] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {homeData.testimonials.map((item, index) => (
              <motion.blockquote
                key={item.id}
                className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-6 text-[var(--text-primary)] shadow-md"
                initial={{ opacity: 0, x: index % 2 === 0 ? -18 : 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
              >
                <p className="text-lg">"{item.quote}"</p>
                <footer className="mt-4">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-[var(--brand-secondary)]">{item.role}</p>
                </footer>
              </motion.blockquote>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/contact"
              className="inline-flex items-center rounded-full bg-[var(--brand-cta)] px-8 py-3 font-semibold text-white transition-transform hover:scale-105"
            >
              Start Selling Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
