/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Database (In-memory for preview)
  const db = {
    users: [] as any[],
    contacts: [] as any[],
    transactions: [] as any[],
  };

  // API Routes
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    const user = { id: Math.random().toString(36).substr(2, 9), name, email, password };
    db.users.push(user);
    res.json({ token: 'mock-jwt-token', user: { id: user.id, name: user.name, email: user.email } });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);
    if (user) {
      res.json({ token: 'mock-jwt-token', user: { id: user.id, name: user.name, email: user.email } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  app.post('/api/sync/push', (req, res) => {
    const { contacts, transactions } = req.body;
    // In a real app, we'd merge with DB. Here we just replace for the mock.
    db.contacts = contacts;
    db.transactions = transactions;
    res.json({ status: 'success', lastSyncAt: new Date().toISOString() });
  });

  app.get('/api/sync/pull', (req, res) => {
    res.json({ contacts: db.contacts, transactions: db.transactions });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
