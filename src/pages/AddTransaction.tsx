/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Camera, Tag } from 'lucide-react';
import { storage, Contact } from '../lib/storage';
import { cn } from '../lib/utils';

const TAG_OPTIONS = ['rent', 'food', 'emergency', 'business', 'fuel', 'other'];

export default function AddTransaction() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const contactIdParam = searchParams.get('contactId');

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [type, setType] = useState<'GIVEN' | 'RECEIVED'>('GIVEN');
  const [amount, setAmount] = useState('');
  const [contactId, setContactId] = useState(contactIdParam || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);

  useEffect(() => {
    setContacts(storage.getContacts());
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactId || !amount || parseFloat(amount) <= 0) {
      alert('Please select a contact and enter a valid amount.');
      return;
    }

    storage.addTransaction({
      contactId,
      type,
      amount: parseFloat(amount),
      currency: storage.getUser().currency || 'PKR',
      date,
      note,
      receiptPhoto,
      isSettled: false,
      settledAt: null,
      tags: selectedTags,
    });

    navigate(contactIdParam ? `/contacts/${contactIdParam}` : '/');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 glass rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold">Add Transaction</h2>
      </header>

      <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 space-y-8 shadow-2xl">
        {/* Type Toggle */}
        <div className="flex p-1 glass rounded-2xl">
          <button
            type="button"
            onClick={() => setType('GIVEN')}
            className={cn(
              "flex-1 py-4 rounded-xl font-bold transition-all",
              type === 'GIVEN' ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-text-muted hover:text-text"
            )}
          >
            I GAVE (Diya)
          </button>
          <button
            type="button"
            onClick={() => setType('RECEIVED')}
            className={cn(
              "flex-1 py-4 rounded-xl font-bold transition-all",
              type === 'RECEIVED' ? "bg-success text-white shadow-lg shadow-success/20" : "text-text-muted hover:text-text"
            )}
          >
            I RECEIVED (Liya)
          </button>
        </div>

        <div className="space-y-6">
          {/* Contact Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Select Contact</label>
            <select
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              required
              className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent appearance-none transition-colors"
            >
              <option value="" className="bg-card">Choose a person...</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id} className="bg-card">{c.name} ({c.phone})</option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-text-muted">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl pl-10 pr-4 py-4 text-3xl font-black outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Note (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What was this for?"
                className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-text-muted flex items-center gap-2">
              <Tag size={14} /> Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                    selectedTags.includes(tag) 
                      ? "bg-accent/20 border-accent text-accent" 
                      : "bg-black/5 dark:bg-white/5 border-border text-text-muted hover:border-accent/50"
                  )}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-text-muted flex items-center gap-2">
              <Camera size={14} /> Receipt Photo
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-6 hover:border-accent/50 cursor-pointer transition-all">
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                <Camera className="text-text-muted mb-2" size={32} />
                <span className="text-xs text-text-muted">Upload Receipt</span>
              </label>
              {receiptPhoto && (
                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-border relative group">
                  <img src={receiptPhoto} alt="Receipt" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setReceiptPhoto(null)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                  >
                    <ArrowLeft className="rotate-45 text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-accent text-white hover:bg-accent/90 py-5 rounded-2xl font-black text-xl shadow-xl shadow-accent/20 flex items-center justify-center gap-3 transition-all"
        >
          <Save size={24} />
          Save Transaction
        </button>
      </form>
    </div>
  );
}
