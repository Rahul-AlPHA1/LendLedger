/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateUUID, getInitials, getRandomColor } from './utils';

export interface User {
  id: string;
  name: string;
  currency: 'PKR' | 'INR' | 'USD';
  language: 'en' | 'ur' | 'hi';
  cloudSyncEnabled: boolean;
  jwtToken: string | null;
  lastSyncAt: string | null;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatarInitials: string;
  colorCode: string;
  totalGiven: number;
  totalReceived: number;
  netBalance: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  contactId: string;
  type: 'GIVEN' | 'RECEIVED';
  amount: number;
  currency: string;
  date: string;
  note: string;
  receiptPhoto: string | null;
  isSettled: boolean;
  settledAt: string | null;
  tags: string[];
  createdAt: string;
}

export interface AICache {
  monthlySummary: string;
  summaryGeneratedAt: string;
  riskAssessment: Record<string, any>;
  reminderTemplates: Record<string, any>;
}

const KEYS = {
  USER: 'll_user',
  CONTACTS: 'll_contacts',
  TRANSACTIONS: 'll_transactions',
  AI_CACHE: 'll_ai_cache',
};

export const storage = {
  initializeStorage: () => {
    if (!localStorage.getItem(KEYS.USER)) {
      const defaultUser: User = {
        id: generateUUID(),
        name: 'Guest User',
        currency: 'PKR',
        language: 'en',
        cloudSyncEnabled: false,
        jwtToken: null,
        lastSyncAt: null,
      };
      localStorage.setItem(KEYS.USER, JSON.stringify(defaultUser));
    }
    if (!localStorage.getItem(KEYS.CONTACTS)) {
      localStorage.setItem(KEYS.CONTACTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.AI_CACHE)) {
      localStorage.setItem(KEYS.AI_CACHE, JSON.stringify({
        monthlySummary: '',
        summaryGeneratedAt: '',
        riskAssessment: {},
        reminderTemplates: {},
      }));
    }
  },

  getUser: (): User => JSON.parse(localStorage.getItem(KEYS.USER) || '{}'),
  setUser: (user: User) => localStorage.setItem(KEYS.USER, JSON.stringify(user)),

  getContacts: (): Contact[] => JSON.parse(localStorage.getItem(KEYS.CONTACTS) || '[]'),
  setContacts: (contacts: Contact[]) => localStorage.setItem(KEYS.CONTACTS, JSON.stringify(contacts)),

  addContact: (name: string, phone: string) => {
    const contacts = storage.getContacts();
    const newContact: Contact = {
      id: generateUUID(),
      name,
      phone,
      avatarInitials: getInitials(name),
      colorCode: getRandomColor(),
      totalGiven: 0,
      totalReceived: 0,
      netBalance: 0,
      riskLevel: 'LOW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    contacts.push(newContact);
    storage.setContacts(contacts);
    return newContact;
  },

  updateContact: (id: string, updates: Partial<Contact>) => {
    const contacts = storage.getContacts();
    const index = contacts.findIndex((c) => c.id === id);
    if (index !== -1) {
      contacts[index] = { ...contacts[index], ...updates, updatedAt: new Date().toISOString() };
      storage.setContacts(contacts);
    }
  },

  deleteContact: (id: string) => {
    const contacts = storage.getContacts().filter((c) => c.id !== id);
    storage.setContacts(contacts);
    // Also delete associated transactions
    const transactions = storage.getTransactions().filter((t) => t.contactId !== id);
    storage.setTransactions(transactions);
  },

  getTransactions: (): Transaction[] => JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]'),
  setTransactions: (transactions: Transaction[]) => localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions)),

  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const transactions = storage.getTransactions();
    const newTransaction: Transaction = {
      ...transaction,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
    };
    transactions.push(newTransaction);
    storage.setTransactions(transactions);
    storage.recalculateAllBalances();
    return newTransaction;
  },

  updateTransaction: (id: string, updates: Partial<Transaction>) => {
    const transactions = storage.getTransactions();
    const index = transactions.findIndex((t) => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates };
      storage.setTransactions(transactions);
      storage.recalculateAllBalances();
    }
  },

  deleteTransaction: (id: string) => {
    const transactions = storage.getTransactions().filter((t) => t.id !== id);
    storage.setTransactions(transactions);
    storage.recalculateAllBalances();
  },

  getTransactionsByContact: (contactId: string) => {
    return storage.getTransactions().filter((t) => t.contactId === contactId);
  },

  recalculateAllBalances: () => {
    const contacts = storage.getContacts();
    const transactions = storage.getTransactions();

    const updatedContacts = contacts.map((contact) => {
      const contactTransactions = transactions.filter((t) => t.contactId === contact.id && !t.isSettled);
      const totalGiven = contactTransactions
        .filter((t) => t.type === 'GIVEN')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalReceived = contactTransactions
        .filter((t) => t.type === 'RECEIVED')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        ...contact,
        totalGiven,
        totalReceived,
        netBalance: totalGiven - totalReceived,
      };
    });

    storage.setContacts(updatedContacts);
  },

  getAICache: (): AICache => JSON.parse(localStorage.getItem(KEYS.AI_CACHE) || '{}'),
  setAICache: (cache: AICache) => localStorage.setItem(KEYS.AI_CACHE, JSON.stringify(cache)),

  exportToJSON: () => {
    const data = {
      user: storage.getUser(),
      contacts: storage.getContacts(),
      transactions: storage.getTransactions(),
      aiCache: storage.getAICache(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loanledger_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  },

  importFromJSON: (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.user) storage.setUser(data.user);
      if (data.contacts) storage.setContacts(data.contacts);
      if (data.transactions) storage.setTransactions(data.transactions);
      if (data.aiCache) storage.setAICache(data.aiCache);
      storage.recalculateAllBalances();
      return true;
    } catch (e) {
      console.error('Failed to import data', e);
      return false;
    }
  },

  clearAllData: () => {
    localStorage.removeItem(KEYS.USER);
    localStorage.removeItem(KEYS.CONTACTS);
    localStorage.removeItem(KEYS.TRANSACTIONS);
    localStorage.removeItem(KEYS.AI_CACHE);
    storage.initializeStorage();
  },
};
