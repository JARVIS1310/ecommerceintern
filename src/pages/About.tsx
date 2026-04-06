import { Award, Globe, Shield, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAboutStats } from '../lib/api';
import type { IconStat } from '../types';

const iconMap = {
  Users,
  Globe,
  Award,
  Shield,
};

export default function About() {
  const [stats, setStats] = useState<IconStat[]>([]);

  useEffect(() => {
    getAboutStats()
      .then((result) => setStats(result))
      .catch(() => setStats([]));
  }, []);

  return (
    <div className="bg-[var(--bg-base)] min-h-screen text-[var(--text-primary)]">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h1 className="text-4xl font-black sm:text-5xl">
            About VendorHub
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-[var(--text-muted)]">
            We build practical commerce tools for ambitious sellers, with a focus on speed,
            trust, and growth.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = iconMap[stat.icon];
            return (
              <motion.div
                key={stat.name}
                className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Icon className="h-6 w-6 text-[var(--brand-secondary)]" />
                <p className="mt-4 text-sm text-[var(--text-muted)]">{stat.name}</p>
                <p className="text-2xl font-bold text-[var(--brand-primary)]">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-16 rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-lg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-extrabold">Our Story</h2>
          <p className="mt-4 text-lg leading-8 text-[var(--text-muted)]">
            Founded in 2025, VendorHub has grown from a small startup into a trusted platform for
            thousands of merchants. We listen deeply to our users and ship features that help them
            launch faster, convert better, and scale reliably.
          </p>
          <p className="mt-4 text-lg leading-8 text-[var(--text-muted)]">
            Our product approach is simple: make complex commerce workflows feel effortless through
            dynamic UI, meaningful data, and dependable backend systems.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
