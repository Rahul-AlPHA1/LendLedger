/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, Globe, Cloud, Download, Upload, Trash2, 
  Shield, Info, Github, LogIn, Save, RefreshCw, Moon, Sun, Palette
} from 'lucide-react';
import { storage, User as UserType } from '../lib/storage';
import { cn } from '../lib/utils';
import { useTheme } from '../lib/ThemeContext';

export default function Settings() {
  const [user, setUser] = useState<UserType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setUser(storage.getUser());
  }, []);

  const handleUpdateUser = (updates: Partial<UserType>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    storage.setUser(updatedUser);
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Profile updated successfully!');
    }, 800);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const success = storage.importFromJSON(event.target?.result as string);
        if (success) {
          alert('Data imported successfully!');
          window.location.reload();
        } else {
          alert('Failed to import data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you absolutely sure? This will delete ALL your contacts and transactions forever.')) {
      storage.clearAllData();
      window.location.reload();
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-text-muted">Configure your profile and data preferences.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Section */}
        <section className="glass rounded-3xl p-8 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <User size={20} className="text-accent" />
            Profile Setup
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Your Name</label>
              <input 
                type="text" 
                value={user.name}
                onChange={(e) => handleUpdateUser({ name: e.target.value })}
                className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Currency</label>
                <select 
                  value={user.currency}
                  onChange={(e) => handleUpdateUser({ currency: e.target.value as any })}
                  className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                >
                  <option value="PKR" className="bg-card">PKR (₨)</option>
                  <option value="INR" className="bg-card">INR (₹)</option>
                  <option value="USD" className="bg-card">USD ($)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Language</label>
                <select 
                  value={user.language}
                  onChange={(e) => handleUpdateUser({ language: e.target.value as any })}
                  className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                >
                  <option value="en" className="bg-card">English</option>
                  <option value="ur" className="bg-card">Urdu</option>
                  <option value="hi" className="bg-card">Hindi</option>
                </select>
              </div>
            </div>
            <button 
              onClick={handleSaveProfile}
              className="w-full bg-accent text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all"
            >
              {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
              Save Changes
            </button>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="glass rounded-3xl p-8 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Palette size={20} className="text-success" />
            Appearance
          </h3>
          <div className="p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Theme</p>
                <p className="text-xs text-text-muted">Toggle Light/Dark mode.</p>
              </div>
              <button 
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {theme === 'dark' ? <><Sun size={16} /> Light</> : <><Moon size={16} /> Dark</>}
              </button>
            </div>
          </div>
        </section>

        {/* Cloud Sync Section */}
        <section className="glass rounded-3xl p-8 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Cloud size={20} className="text-blue-400" />
            Cloud Sync
          </h3>
          <div className="p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Backup to Cloud</p>
                <p className="text-xs text-text-muted">Sync your data across devices.</p>
              </div>
              <div className="w-12 h-6 bg-black/10 dark:bg-white/10 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-black/20 dark:bg-white/20 rounded-full" />
              </div>
            </div>
            <button className="w-full glass py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black/5 dark:hover:bg-white/10 transition-all">
              <LogIn size={18} /> Login to Sync
            </button>
            <p className="text-[10px] text-center text-text-muted italic">
              Cloud sync requires a HisaabAI account.
            </p>
          </div>
        </section>

        {/* Data Management */}
        <section className="glass rounded-3xl p-8 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Shield size={20} className="text-warning" />
            Data Management
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => storage.exportToJSON()}
              className="w-full glass py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
            >
              <Download size={20} /> Export All Data (JSON)
            </button>
            <label className="w-full glass py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer">
              <Upload size={20} /> Import Data (JSON)
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
            <button 
              onClick={handleClearData}
              className="w-full bg-accent/10 text-accent py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-accent hover:text-white transition-all"
            >
              <Trash2 size={20} /> Clear All Data
            </button>
          </div>
        </section>

        {/* About Section */}
        <section className="glass rounded-3xl p-8 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Info size={20} className="text-purple-400" />
            About HisaabAI
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Version</span>
              <span className="font-bold">1.0.0-beta</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Build</span>
              <span className="font-bold">2024.11.25</span>
            </div>
            <div className="pt-4 border-t border-border">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-2 text-text-muted hover:text-text transition-all"
              >
                <Github size={20} /> View on GitHub
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
