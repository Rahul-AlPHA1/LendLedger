/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Phone, MessageSquare, Plus, CheckCircle2, 
  Trash2, FileText, Share2, Sparkles, Clock, Calendar
} from 'lucide-react';
import { storage, Contact, Transaction } from '../lib/storage';
import { formatCurrency, cn } from '../lib/utils';
import { gemini } from '../lib/gemini';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiReminder, setAiReminder] = useState('');
  const [riskLevel, setRiskLevel] = useState<{level: string, reason: string} | null>(null);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);
  const [isDeletingContact, setIsDeletingContact] = useState(false);

  useEffect(() => {
    if (id) {
      const c = storage.getContacts().find(c => c.id === id);
      if (c) {
        setContact(c);
        setTransactions(storage.getTransactionsByContact(id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } else {
        navigate('/contacts');
      }
    }
  }, [id, navigate]);

  const handleAssessRisk = async () => {
    if (!contact) return;
    setLoadingRisk(true);
    const risk = await gemini.assessRisk(transactions);
    setRiskLevel(risk);
    setLoadingRisk(false);
  };

  const handleSettleUp = () => {
    if (!id) return;
    const unsettled = transactions.filter(t => !t.isSettled);
    unsettled.forEach(t => {
      storage.updateTransaction(t.id, { isSettled: true, settledAt: new Date().toISOString() });
    });
    setTransactions(storage.getTransactionsByContact(id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    const updatedContact = storage.getContacts().find(c => c.id === id);
    if (updatedContact) setContact(updatedContact);
  };

  const handleDeleteTransaction = (txId: string) => {
    setDeletingTxId(txId);
  };

  const confirmDeleteTx = () => {
    if (deletingTxId) {
      storage.deleteTransaction(deletingTxId);
      if (id) {
        setTransactions(storage.getTransactionsByContact(id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        const updatedContact = storage.getContacts().find(c => c.id === id);
        if (updatedContact) setContact(updatedContact);
      }
      setDeletingTxId(null);
    }
  };

  const handleDeleteContact = () => {
    setIsDeletingContact(true);
  };

  const confirmDeleteContact = () => {
    if (id) {
      storage.deleteContact(id);
      navigate('/contacts');
    }
  };

  const handleGenerateReminder = async () => {
    if (!contact) return;
    setLoadingAI(true);
    const lastTx = transactions[0];
    const daysSince = lastTx ? Math.floor((new Date().getTime() - new Date(lastTx.date).getTime()) / (1000 * 3600 * 24)) : 0;
    const msg = await gemini.generateWhatsAppReminder(
      contact.name, 
      Math.abs(contact.netBalance), 
      daysSince, 
      lastTx?.note || 'pending balance'
    );
    setAiReminder(msg);
    setLoadingAI(false);
  };

  const handleExportPDF = () => {
    if (!contact) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('LendLedger Statement', 14, 22);
    doc.setFontSize(12);
    doc.text(`Contact: ${contact.name}`, 14, 32);
    doc.text(`Phone: ${contact.phone}`, 14, 38);
    doc.text(`Net Balance: ${formatCurrency(contact.netBalance)}`, 14, 44);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 50);

    const tableData = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      formatCurrency(t.amount),
      t.note,
      t.isSettled ? 'Settled' : 'Pending'
    ]);

    autoTable(doc, {
      startY: 60,
      head: [['Date', 'Type', 'Amount', 'Note', 'Status']],
      body: tableData,
    });

    doc.save(`statement_${contact.name.replace(/\s+/g, '_')}.pdf`);
  };

  if (!contact) return null;

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate('/contacts')} className="p-2 glass rounded-xl hover:bg-white/10 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-4 flex-1">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl", contact.colorCode)}>
            {contact.avatarInitials}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{contact.name}</h2>
            <p className="text-sm text-text-muted">{contact.phone}</p>
          </div>
        </div>
        <button 
          onClick={handleDeleteContact} 
          className="p-3 glass rounded-xl text-accent hover:bg-accent hover:text-white transition-all flex items-center gap-2"
          title="Delete Contact"
        >
          <Trash2 size={20} />
          <span className="hidden sm:inline font-medium text-sm">Delete Contact</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Stats & Actions */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-8 text-center space-y-4">
            <p className="text-sm text-text-muted font-medium uppercase tracking-widest">Current Balance</p>
            <h3 className={cn("text-4xl font-black", contact.netBalance >= 0 ? "text-accent" : "text-success")}>
              {formatCurrency(Math.abs(contact.netBalance))}
            </h3>
            <p className="text-sm text-text-muted">
              {contact.netBalance > 0 ? "Unhone dena hai" : contact.netBalance < 0 ? "Aapne dena hai" : "Hisaab barabar hai"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ActionButton icon={Phone} label="Call" href={`tel:${contact.phone}`} />
            <ActionButton icon={MessageSquare} label="WhatsApp" href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`} color="text-success" />
            <button 
              onClick={handleSettleUp}
              className="flex flex-col items-center justify-center gap-2 glass p-4 rounded-2xl hover:bg-success/10 hover:text-success transition-all"
            >
              <CheckCircle2 size={24} />
              <span className="text-xs font-bold">Settle Up</span>
            </button>
            <button 
              onClick={handleExportPDF}
              className="flex flex-col items-center justify-center gap-2 glass p-4 rounded-2xl hover:bg-blue-500/10 hover:text-blue-400 transition-all"
            >
              <FileText size={24} />
              <span className="text-xs font-bold">Export PDF</span>
            </button>
          </div>

          {/* AI Reminder Section */}
          <div className="glass rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold flex items-center gap-2">
                <Sparkles size={18} className="text-accent" />
                AI Reminder
              </h4>
              <button 
                onClick={handleGenerateReminder}
                disabled={loadingAI}
                className="text-xs text-accent hover:underline disabled:opacity-50"
              >
                {loadingAI ? 'Thinking...' : 'Generate'}
              </button>
            </div>
            {aiReminder ? (
              <div className="space-y-3">
                <div className="bg-white/5 p-4 rounded-xl text-sm italic leading-relaxed">
                  "{aiReminder}"
                </div>
                <button 
                  onClick={() => {
                    const url = `https://wa.me/${contact.phone.replace(/\D/g, '')}?text=${encodeURIComponent(aiReminder)}`;
                    window.open(url, '_blank');
                  }}
                  className="w-full bg-success py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm"
                >
                  <Share2 size={16} /> Send on WhatsApp
                </button>
              </div>
            ) : (
              <p className="text-xs text-text-muted">Need to remind {contact.name}? Let AI write a polite message for you.</p>
            )}
          </div>

          {/* AI Risk Assessment */}
          <div className="glass rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold flex items-center gap-2">
                <Sparkles size={18} className="text-warning" />
                Risk Assessment
              </h4>
              <button 
                onClick={handleAssessRisk}
                disabled={loadingRisk}
                className="text-xs text-warning hover:underline disabled:opacity-50"
              >
                {loadingRisk ? 'Analyzing...' : 'Assess'}
              </button>
            </div>
            {riskLevel ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Risk Level:</span>
                  <span className={cn(
                    "px-2 py-1 rounded-md text-xs font-bold",
                    riskLevel.level === 'HIGH' ? "bg-accent/20 text-accent" : 
                    riskLevel.level === 'MEDIUM' ? "bg-warning/20 text-warning" : 
                    "bg-success/20 text-success"
                  )}>
                    {riskLevel.level}
                  </span>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{riskLevel.reason}</p>
              </div>
            ) : (
              <p className="text-xs text-text-muted">Analyze {contact.name}'s transaction history to determine lending risk.</p>
            )}
          </div>
        </div>

        {/* Right: Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Transaction History</h3>
            <Link to={`/add?contactId=${contact.id}`} className="flex items-center gap-2 bg-accent px-4 py-2 rounded-xl text-sm font-bold">
              <Plus size={18} /> Add New
            </Link>
          </div>

          <div className="space-y-4">
            {transactions.length > 0 ? transactions.map((tx) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key={tx.id} 
                className={cn(
                  "glass rounded-2xl p-4 flex items-center justify-between group",
                  tx.isSettled && "opacity-50 grayscale-[0.5]"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    tx.type === 'GIVEN' ? "bg-accent/10 text-accent" : "bg-success/10 text-success"
                  )}>
                    {tx.type === 'GIVEN' ? <ArrowLeft size={24} className="rotate-135" /> : <ArrowLeft size={24} className="-rotate-45" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{formatCurrency(tx.amount)}</p>
                      {tx.isSettled && <span className="text-[10px] bg-success/20 text-success px-2 py-0.5 rounded-full font-bold uppercase">Settled</span>}
                    </div>
                    <p className="text-sm text-text-muted">{tx.note || 'No note'}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-text-muted flex items-center gap-1">
                        <Calendar size={10} /> {new Date(tx.date).toLocaleDateString()}
                      </span>
                      {tx.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-white/5 px-2 py-0.5 rounded-md text-text-muted">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => handleDeleteTransaction(tx.id)}
                    className="p-2 hover:bg-accent/10 hover:text-accent rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            )) : (
              <div className="py-20 text-center glass rounded-3xl">
                <Clock size={48} className="mx-auto text-text-muted mb-4 opacity-20" />
                <p className="text-text-muted">No transactions yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Transaction Modal */}
      {deletingTxId && (
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
                onClick={() => setDeletingTxId(null)}
                className="flex-1 py-3 rounded-xl hover:bg-white/5 transition-all font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteTx}
                className="flex-1 bg-accent py-3 rounded-xl font-bold shadow-lg shadow-accent/20 text-white"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Contact Modal */}
      {isDeletingContact && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass w-full max-w-sm rounded-3xl p-6 space-y-6 shadow-2xl text-center"
          >
            <div className="w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold">Delete Contact?</h3>
            <p className="text-text-muted text-sm">Are you sure you want to delete this contact? All their transactions will be permanently deleted.</p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setIsDeletingContact(false)}
                className="flex-1 py-3 rounded-xl hover:bg-white/5 transition-all font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteContact}
                className="flex-1 bg-accent py-3 rounded-xl font-bold shadow-lg shadow-accent/20 text-white"
              >
                Delete Contact
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ActionButton({ icon: Icon, label, href, color = "text-text-muted" }: any) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer"
      className="flex flex-col items-center justify-center gap-2 glass p-4 rounded-2xl hover:bg-white/5 transition-all"
    >
      <Icon className={color} size={24} />
      <span className="text-xs font-bold">{label}</span>
    </a>
  );
}
