/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FileText, Download, Filter, Calendar } from 'lucide-react';
import { storage, Transaction, Contact } from '../lib/storage';
import { formatCurrency, cn } from '../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Reports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [dateRange, setDateRange] = useState('ALL');

  useEffect(() => {
    setTransactions(storage.getTransactions());
    setContacts(storage.getContacts());
  }, []);

  // Process data for charts
  const monthlyData = transactions.reduce((acc: any[], tx) => {
    const month = new Date(tx.date).toLocaleString('default', { month: 'short' });
    const existing = acc.find(d => d.month === month);
    if (existing) {
      if (tx.type === 'GIVEN') existing.given += tx.amount;
      else existing.received += tx.amount;
    } else {
      acc.push({ month, given: tx.type === 'GIVEN' ? tx.amount : 0, received: tx.type === 'RECEIVED' ? tx.amount : 0 });
    }
    return acc;
  }, []).slice(-6);

  const tagData = transactions.reduce((acc: any[], tx) => {
    tx.tags.forEach(tag => {
      const existing = acc.find(d => d.name === tag);
      if (existing) existing.value += tx.amount;
      else acc.push({ name: tag, value: tx.amount });
    });
    return acc;
  }, []);

  const COLORS = ['#e94560', '#0f9b58', '#f5a623', '#3b82f6', '#a855f7', '#ec4899'];

  const handleFullReportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(26, 26, 46);
    doc.text('LendLedger Full Financial Report', 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);

    const summaryData = [
      ['Total Contacts', contacts.length.toString()],
      ['Total Transactions', transactions.length.toString()],
      ['Total Given', formatCurrency(transactions.filter(t => t.type === 'GIVEN').reduce((s, t) => s + t.amount, 0))],
      ['Total Received', formatCurrency(transactions.filter(t => t.type === 'RECEIVED').reduce((s, t) => s + t.amount, 0))],
    ];

    autoTable(doc, {
      startY: 40,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
    });

    const txData = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      contacts.find(c => c.id === t.contactId)?.name || 'Unknown',
      t.type,
      formatCurrency(t.amount),
      t.note,
      t.isSettled ? 'Yes' : 'No'
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Date', 'Contact', 'Type', 'Amount', 'Note', 'Settled']],
      body: txData,
    });

    doc.save('lendledger_full_report.pdf');
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-text-muted">Deep dive into your lending patterns.</p>
        </div>
        <button 
          onClick={handleFullReportPDF}
          className="flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 px-6 py-3 rounded-2xl font-bold transition-all"
        >
          <Download size={20} />
          Download Full PDF
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Bar Chart */}
        <div className="glass rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Calendar size={20} className="text-accent" />
              Monthly Comparison
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="month" stroke="#a0aec0" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a0aec0" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#1a1a2e', border: 'none', borderRadius: '12px' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" />
                <Bar dataKey="given" name="I Gave" fill="#e94560" radius={[4, 4, 0, 0]} />
                <Bar dataKey="received" name="I Received" fill="#0f9b58" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="glass rounded-3xl p-6 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Filter size={20} className="text-accent" />
            Category Breakdown
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tagData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tagData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: 'none', borderRadius: '12px' }}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="glass rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-xl font-bold">Contact-wise Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-text-muted text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 font-bold">Contact</th>
                <th className="px-6 py-4 font-bold">Total Given</th>
                <th className="px-6 py-4 font-bold">Total Received</th>
                <th className="px-6 py-4 font-bold">Net Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {contacts.map(contact => (
                <tr key={contact.id} className="hover:bg-white/5 transition-all">
                  <td className="px-6 py-4 font-medium">{contact.name}</td>
                  <td className="px-6 py-4 text-accent">{formatCurrency(contact.totalGiven)}</td>
                  <td className="px-6 py-4 text-success">{formatCurrency(contact.totalReceived)}</td>
                  <td className={cn("px-6 py-4 font-bold", contact.netBalance >= 0 ? "text-accent" : "text-success")}>
                    {formatCurrency(contact.netBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
