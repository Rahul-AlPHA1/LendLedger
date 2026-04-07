/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, UserPlus, Filter, ArrowUpDown, Phone, MessageSquare, Users } from 'lucide-react';
import { storage, Contact } from '../lib/storage';
import { formatCurrency, cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'I_OWE' | 'THEY_OWE' | 'SETTLED'>('ALL');
  const [sortBy, setSortBy] = useState<'NAME' | 'BALANCE' | 'ACTIVITY'>('NAME');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setContacts(storage.getContacts());
  }, []);

  const filteredContacts = contacts
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
      if (filter === 'I_OWE') return matchesSearch && c.netBalance < 0;
      if (filter === 'THEY_OWE') return matchesSearch && c.netBalance > 0;
      if (filter === 'SETTLED') return matchesSearch && c.netBalance === 0;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'NAME') return a.name.localeCompare(b.name);
      if (sortBy === 'BALANCE') return Math.abs(b.netBalance) - Math.abs(a.netBalance);
      if (sortBy === 'ACTIVITY') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return 0;
    });

  const handleAddContact = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    if (name && phone) {
      storage.addContact(name, phone);
      setContacts(storage.getContacts());
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contacts</h2>
          <p className="text-text-muted">Manage your debtors and creditors.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-accent/20"
        >
          <UserPlus size={20} />
          Add New Contact
        </button>
      </header>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search name or phone..." 
            className="w-full glass rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-accent outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 md:col-span-2">
          <FilterButton active={filter === 'ALL'} onClick={() => setFilter('ALL')}>All</FilterButton>
          <FilterButton active={filter === 'THEY_OWE'} onClick={() => setFilter('THEY_OWE')}>They Owe Me</FilterButton>
          <FilterButton active={filter === 'I_OWE'} onClick={() => setFilter('I_OWE')}>I Owe Them</FilterButton>
          <FilterButton active={filter === 'SETTLED'} onClick={() => setFilter('SETTLED')}>Settled</FilterButton>
          <div className="flex-1" />
          <select 
            className="glass rounded-2xl px-4 py-2 text-sm outline-none cursor-pointer"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="NAME">Sort by Name</option>
            <option value="BALANCE">Sort by Balance</option>
            <option value="ACTIVITY">Sort by Activity</option>
          </select>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
        {filteredContacts.length === 0 && (
          <div className="col-span-full py-20 text-center glass rounded-3xl">
            <Users size={48} className="mx-auto text-text-muted mb-4 opacity-20" />
            <p className="text-text-muted">No contacts found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass w-full max-w-md rounded-3xl p-8 space-y-6 shadow-2xl"
          >
            <h3 className="text-2xl font-bold">Add New Contact</h3>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Full Name</label>
                <input 
                  name="name" 
                  required 
                  placeholder="e.g. Ahmed Bhai" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Phone Number</label>
                <input 
                  name="phone" 
                  required 
                  placeholder="+92 300 1234567" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 rounded-xl hover:bg-white/5 transition-all font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-accent py-3 rounded-xl font-bold shadow-lg shadow-accent/20"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function FilterButton({ children, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
        active ? "bg-accent text-white" : "glass text-text-muted hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

const ContactCard: React.FC<{ contact: Contact }> = ({ contact }) => {
  const riskColor = {
    LOW: 'bg-success/20 text-success',
    MEDIUM: 'bg-warning/20 text-warning',
    HIGH: 'bg-accent/20 text-accent',
  }[contact.riskLevel];

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass rounded-3xl p-6 space-y-6 relative overflow-hidden"
    >
      <Link to={`/contacts/${contact.id}`} className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl", contact.colorCode)}>
            {contact.avatarInitials}
          </div>
          <div>
            <h4 className="text-lg font-bold">{contact.name}</h4>
            <p className="text-sm text-text-muted flex items-center gap-1">
              <Phone size={12} /> {contact.phone}
            </p>
          </div>
        </div>
        <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider", riskColor)}>
          {contact.riskLevel} Risk
        </span>
      </Link>

      <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
        <div>
          <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Net Balance</p>
          <p className={cn("text-xl font-black", contact.netBalance >= 0 ? "text-accent" : "text-success")}>
            {formatCurrency(Math.abs(contact.netBalance))}
          </p>
        </div>
        <div className="flex justify-end items-end gap-2">
          <a href={`tel:${contact.phone}`} className="p-2 glass rounded-xl text-text-muted hover:text-white transition-all">
            <Phone size={18} />
          </a>
          <a href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="p-2 glass rounded-xl text-success hover:bg-success/10 transition-all">
            <MessageSquare size={18} />
          </a>
        </div>
      </div>
    </motion.div>
  );
};
