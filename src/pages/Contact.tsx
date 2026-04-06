import { Mail, MapPin, Phone, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getContactConfig, submitContact } from '../lib/api';

export default function Contact() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [adminEmail, setAdminEmail] = useState('admin-inbox@vendorhub.demo');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  useEffect(() => {
    getContactConfig()
      .then((config) => setAdminEmail(config.adminEmail))
      .catch(() => undefined);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const result = await submitContact(formData);
      setStatus('success');
      setMessage(result.message);
      setFormData({ name: '', email: '', message: '' });
      setAdminEmail(result.deliveredTo || adminEmail);
    } catch (submitError) {
      const errorText = submitError instanceof Error ? submitError.message : 'Failed to submit message';
      setStatus('error');
      setMessage(errorText);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(120deg,var(--bg-accent)_0%,var(--bg-base)_45%,#151f35_100%)] text-[var(--text-primary)]">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-black sm:text-5xl">Get in Touch</h1>
          <p className="mt-4 text-xl text-[var(--text-muted)]">
            Reach out to our team and we will get back quickly.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-xl">
              <h2 className="text-2xl font-bold">Contact Information</h2>
              <div className="mt-6 space-y-6">
                <div className="flex items-center">
                  <Phone className="h-6 w-6 text-[var(--brand-secondary)]" />
                  <div className="ml-4">
                    <p className="text-lg font-medium">+91 (800) 123-4567</p>
                    <p className="text-[var(--text-muted)]">Mon-Fri 9:30am to 6:30pm IST</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-6 w-6 text-[var(--brand-secondary)]" />
                  <div className="ml-4">
                    <p className="text-lg font-medium">{adminEmail}</p>
                    <p className="text-[var(--text-muted)]">Admin inbox (demo)</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-6 w-6 text-[var(--brand-secondary)]" />
                  <div className="ml-4">
                    <p className="text-lg font-medium">Cyber City, DLF Phase 2</p>
                    <p className="text-[var(--text-muted)]">Gurugram, Haryana 122002</p>
                    <p className="text-[var(--text-muted)]">India</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-xl">
              <h2 className="text-2xl font-bold">Send us a message</h2>
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  required
                  className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--input-bg)] px-4 py-3 text-[var(--text-primary)] focus:border-[var(--brand-secondary)] focus:outline-none"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--input-bg)] px-4 py-3 text-[var(--text-primary)] focus:border-[var(--brand-secondary)] focus:outline-none"
                />
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Your message"
                  required
                  className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--input-bg)] px-4 py-3 text-[var(--text-primary)] focus:border-[var(--brand-secondary)] focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--brand-primary)] px-6 py-3 font-semibold text-[var(--bg-base)] transition hover:brightness-95 disabled:opacity-60"
                >
                  <Send className="mr-2 h-5 w-5" />
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                </button>

                {message && (
                  <p
                    className={`flex items-center justify-center text-sm ${
                      status === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {status === 'success' ? (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    ) : (
                      <AlertCircle className="mr-2 h-4 w-4" />
                    )}
                    {message}
                  </p>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
