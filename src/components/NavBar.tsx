/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, PlusCircle, Sparkles, BarChart3, Settings, Moon, Sun, Wallet, MessageSquareHeart, History } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../lib/ThemeContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/add', icon: PlusCircle, label: 'Add', primary: true },
  { to: '/history', icon: History, label: 'History' },
  { to: '/ai', icon: Sparkles, label: 'AI Assistant' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/developer', icon: MessageSquareHeart, label: 'Contact Us' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function NavBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 glass h-screen sticky top-0 p-6 gap-8 border-r border-border z-40">
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-4 cursor-pointer group">
            <div className="w-12 h-12 logo-3d rounded-2xl flex items-center justify-center text-white">
              <Wallet size={24} className="drop-shadow-md" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-gradient group-hover:scale-105 transition-transform">
              LendLedger
            </h1>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all text-text-muted hover:text-text shadow-inner"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <nav className="flex flex-col gap-3 flex-1 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 font-semibold",
                  isActive 
                    ? "bg-accent text-white shadow-[0_8px_20px_rgba(233,69,96,0.3)] translate-x-2" 
                    : "text-text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-text hover:translate-x-1"
                )
              }
            >
              <item.icon size={22} className={cn("transition-transform duration-300")} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 to-warning/10 border border-accent/20 mt-auto">
          <div className="flex items-center gap-2 text-accent font-bold mb-1">
            <Sparkles size={16} /> Pro Tip
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Use the AI Assistant to automatically generate polite WhatsApp reminders for your contacts.
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-border px-2 py-2 flex justify-around items-center z-50 pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300",
                item.primary ? "bg-accent text-white -mt-10 rounded-full w-16 h-16 justify-center shadow-[0_8px_20px_rgba(233,69,96,0.4)] border-4 border-background" : 
                isActive ? "text-accent scale-110" : "text-text-muted hover:text-text"
              )
            }
          >
            <item.icon size={item.primary ? 28 : 24} />
            {!item.primary && <span className="text-[10px] font-bold mt-1">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
