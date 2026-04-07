import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { History, Trash2, ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';
import { storage, Transaction, Contact } from '../lib/storage';
import { formatCurrency, cn } from '../lib/utils';

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

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const txs = storage.getTransactions().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(txs);
    setContacts(storage.getContacts());
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      storage.deleteTransaction(deletingId);
      loadData();
      setDeletingId(null);
    }
  };

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? contact.name : 'Unknown Contact';
  };

  const filteredTransactions = transactions.filter(tx => {
    const contactName = getContactName(tx.contactId).toLowerCase();
    const note = (tx.note || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return contactName.includes(query) || note.includes(query);
  });

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <History className="text-accent" size={32} />
            Transaction History
          </h2>
          <p className="text-text-muted">View and manage all your past transactions.</p>
        </motion.div>
      </header>

      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
        <input 
          type="text" 
          placeholder="Search by name or note..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="glass rounded-3xl overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredTransactions.map(tx => (
              <div key={tx.id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                    tx.type === 'GIVEN' ? "bg-accent/10 text-accent" : "bg-success/10 text-success"
                  )}>
                    {tx.type === 'GIVEN' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{getContactName(tx.contactId)}</h4>
                    <p className="text-sm text-text-muted">
                      {new Date(tx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {tx.note && <p className="text-sm mt-1 text-text-muted italic">"{tx.note}"</p>}
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                  <div className="text-right">
                    <p className={cn(
                      "font-black text-xl",
                      tx.type === 'GIVEN' ? "text-accent" : "text-success"
                    )}>
                      {tx.type === 'GIVEN' ? '-' : '+'}{formatCurrency(tx.amount)}
                    </p>
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-md",
                      tx.isSettled ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                    )}>
                      {tx.isSettled ? 'Settled' : 'Pending'}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDelete(tx.id)}
                    className="p-3 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded-xl transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    title="Delete Transaction"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-text-muted">
            <History size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No transactions found</p>
            <p className="text-sm">Add a transaction to see it here.</p>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass w-full max-w-sm rounded-3xl p-6 space-y-6 shadow-2xl text-center"
          >
            <div className="w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold">Delete Transaction?</h3>
            <p className="text-text-muted text-sm">This action cannot be undone. The contact's balance will be automatically updated.</p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setDeletingId(null)}
                className="flex-1 py-3 rounded-xl hover:bg-white/5 transition-all font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 bg-accent py-3 rounded-xl font-bold shadow-lg shadow-accent/20 text-white"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
