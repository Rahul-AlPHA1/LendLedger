/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { storage } from './lib/storage';
import { ThemeProvider } from './lib/ThemeContext';

// Pages
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import ContactDetail from './pages/ContactDetail';
import AddTransaction from './pages/AddTransaction';
import AIAssistant from './pages/AIAssistant';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ContactUs from './pages/ContactUs';
import TransactionHistory from './pages/TransactionHistory';

// Components
import NavBar from './components/NavBar';

function PageWrapper({ children, pageKey }: { children: React.ReactNode, pageKey?: string }) {
  return (
    <motion.div
      key={pageKey}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-full flex flex-col"
    >
      <div className="flex-1">
        {children}
      </div>
      <footer className="mt-12 py-6 text-center border-t border-white/10">
        <p className="text-sm text-text-muted">
          Developed by <Link to="/developer" className="text-accent hover:underline font-medium">Rahool Gir</Link>
        </p>
      </footer>
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<PageWrapper pageKey="dash"><Dashboard /></PageWrapper>} />
        <Route path="/contacts" element={<PageWrapper pageKey="contacts"><Contacts /></PageWrapper>} />
        <Route path="/contacts/:id" element={<PageWrapper pageKey="contact"><ContactDetail /></PageWrapper>} />
        <Route path="/add" element={<PageWrapper pageKey="add"><AddTransaction /></PageWrapper>} />
        <Route path="/ai" element={<PageWrapper pageKey="ai"><AIAssistant /></PageWrapper>} />
        <Route path="/history" element={<PageWrapper pageKey="history"><TransactionHistory /></PageWrapper>} />
        <Route path="/reports" element={<PageWrapper pageKey="reports"><Reports /></PageWrapper>} />
        <Route path="/settings" element={<PageWrapper pageKey="settings"><Settings /></PageWrapper>} />
        <Route path="/developer" element={<PageWrapper pageKey="developer"><ContactUs /></PageWrapper>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  useEffect(() => {
    storage.initializeStorage();
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col md:flex-row bg-background text-text transition-colors duration-300">
          <NavBar />
          <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto max-w-7xl mx-auto w-full">
            <AnimatedRoutes />
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}
