import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';
import Home from './pages/Home';
import OrderHistory from './pages/OrderHistory';
import Products from './pages/Products';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <CartProvider>
          <AnimatedRoutes />
        </CartProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;