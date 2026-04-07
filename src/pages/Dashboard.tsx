/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Users, Wallet, ArrowUpRight, ArrowDownLeft, Sparkles, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { storage, Contact, Transaction } from '../lib/storage';
import { formatCurrency, cn } from '../lib/utils';
import { gemini } from '../lib/gemini';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [aiSummary, setAiSummary] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const data = storage.getContacts();
    const txs = storage.getTransactions();
    setContacts(data);
    setTransactions(txs);

    const cache = storage.getAICache();
    if (cache.monthlySummary) {
      setAiSummary(cache.monthlySummary);
    } else {
      handleRefreshAI();
    }
  }, []);

  const handleRefreshAI = async () => {
    setLoadingAI(true);
    const summary = await gemini.generateMonthlySummary(
      storage.getTransactions(),
      storage.getContacts(),
      new Date().toLocaleString('default', { month: 'long' })
    );
    setAiSummary(summary);
    setLoadingAI(false);
  };

  const totalGiven = contacts.reduce((sum, c) => sum + Math.max(0, c.netBalance), 0);
  const totalReceived = contacts.reduce((sum, c) => sum + Math.min(0, c.netBalance), 0) * -1;
  const netBalance = totalGiven - totalReceived;

  const topDebtors = [...contacts]
    .filter(c => c.netBalance > 0)
    .sort((a, b) => b.netBalance - a.netBalance)
    .slice(0, 5);

  const iOwe = [...contacts]
    .filter(c => c.netBalance < 0)
    .sort((a, b) => a.netBalance - b.netBalance)
    .slice(0, 5);

  const chartData = transactions
    .slice(-10)
    .map(t => ({
      date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: t.type === 'GIVEN' ? t.amount : -t.amount
    }));

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <header className="flex justify-between items-center">
        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-black tracking-tight">Dashboard</h2>
          <p className="text-text-muted">Welcome back, here's your financial summary.</p>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Link to="/add" className="hidden md:flex items-center gap-2 bg-accent text-white hover:bg-accent/90 px-6 py-3 rounded-2xl font-bold transition-all shadow-[0_8px_20px_rgba(233,69,96,0.3)] hover:scale-105 active:scale-95">
            <Plus size={20} />
            Add Transaction
          </Link>
        </motion.div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Total I Gave" 
          amount={totalGiven} 
          icon={ArrowUpRight} 
          color="text-accent" 
          bg="bg-accent/10" 
        />
        <SummaryCard 
          title="Total I Received" 
          amount={totalReceived} 
          icon={ArrowDownLeft} 
          color="text-success" 
          bg="bg-success/10" 
        />
        <SummaryCard 
          title="Net Balance" 
          amount={netBalance} 
          icon={Wallet} 
          color={netBalance >= 0 ? "text-blue-500" : "text-accent"} 
          bg="bg-blue-500/10" 
        />
        <SummaryCard 
          title="Active Contacts" 
          amount={contacts.length} 
          icon={Users} 
          color="text-purple-500" 
          bg="bg-purple-500/10" 
          isCurrency={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass glass-hover rounded-3xl p-6 md:p-8 space-y-4">
          <h3 className="text-xl font-bold">Balance Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e94560" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#e94560" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '16px', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                  itemStyle={{ color: '#e94560', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#e94560" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Insight Card */}
        <motion.div variants={itemVariants} className="glass glass-hover rounded-3xl p-6 md:p-8 space-y-4 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex justify-between items-center relative z-10">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles size={24} className="text-warning" />
              AI Insights
            </h3>
            <button 
              onClick={handleRefreshAI}
              disabled={loadingAI}
              className="text-xs font-bold text-accent hover:underline disabled:opacity-50"
            >
              {loadingAI ? 'Generating...' : 'Refresh'}
            </button>
          </div>
          <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-2xl p-5 border border-border relative z-10">
            <div className="text-sm text-text leading-relaxed whitespace-pre-wrap font-medium">
              {aiSummary || "AI summary generate ho rahi hai..."}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Debtors */}
        <motion.div variants={itemVariants} className="glass glass-hover rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ArrowUpRight className="text-accent" /> Top Debtors (They Owe Me)
          </h3>
          <div className="space-y-3">
            {topDebtors.length > 0 ? topDebtors.map(contact => (
              <ContactRow key={contact.id} contact={contact} />
            )) : <p className="text-text-muted text-sm italic bg-black/5 dark:bg-white/5 p-4 rounded-xl text-center">No active debtors.</p>}
          </div>
        </motion.div>

        {/* I Owe */}
        <motion.div variants={itemVariants} className="glass glass-hover rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ArrowDownLeft className="text-success" /> I Owe (Pay Them Back)
          </h3>
          <div className="space-y-3">
            {iOwe.length > 0 ? iOwe.map(contact => (
              <ContactRow key={contact.id} contact={contact} />
            )) : <p className="text-text-muted text-sm italic bg-black/5 dark:bg-white/5 p-4 rounded-xl text-center">You don't owe anyone. Great!</p>}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function SummaryCard({ title, amount, icon: Icon, color, bg, isCurrency = true }: any) {
  return (
    <motion.div 
      variants={itemVariants}
      className="glass glass-hover rounded-3xl p-6 space-y-3"
    >
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", bg)}>
        <Icon className={color} size={24} />
      </div>
      <div>
        <p className="text-text-muted text-sm font-semibold">{title}</p>
        <h4 className={cn("text-3xl font-black tracking-tight", color)}>
          {isCurrency ? formatCurrency(amount) : amount}
        </h4>
      </div>
    </motion.div>
  );
}

const ContactRow: React.FC<{ contact: Contact }> = ({ contact }) => {
  return (
    <Link to={`/contacts/${contact.id}`} className="flex items-center justify-between p-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-border transition-all group">
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-inner", contact.colorCode)}>
          {contact.avatarInitials}
        </div>
        <div>
          <p className="font-bold group-hover:text-accent transition-colors">{contact.name}</p>
          <p className="text-xs text-text-muted font-medium">{contact.phone}</p>
        </div>
      </div>
      <p className={cn("font-black text-lg", contact.netBalance > 0 ? "text-accent" : "text-success")}>
        {formatCurrency(Math.abs(contact.netBalance))}
      </p>
    </Link>
  );
};
