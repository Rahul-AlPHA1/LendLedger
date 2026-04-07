/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { storage, Transaction, Contact } from "./storage";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const gemini = {
  generateMonthlySummary: async (transactions: Transaction[], contacts: Contact[], month: string) => {
    try {
      const model = "gemini-3-flash-preview";
      const prompt = `
        You are a friendly desi financial assistant for an app called LendLedger.
        Analyze these transactions and contacts for the month of ${month}.
        Provide a warm, helpful summary in Hinglish (mix of Hindi and English).
        Be specific with numbers. Format nicely with emojis.
        
        Data:
        Contacts: ${JSON.stringify(contacts.map(c => ({ name: c.name, balance: c.netBalance })))}
        Transactions: ${JSON.stringify(transactions.map(t => ({ type: t.type, amount: t.amount, note: t.note, date: t.date })))}
      `;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      const summary = response.text || "Summary generate nahi ho saki. Please try again.";
      
      const cache = storage.getAICache();
      storage.setAICache({
        ...cache,
        monthlySummary: summary,
        summaryGeneratedAt: new Date().toISOString(),
      });

      return summary;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "AI summary load karne mein masla aa raha hai. Internet check karein.";
    }
  },

  generateWhatsAppReminder: async (contactName: string, amount: number, daysSince: number, note: string) => {
    try {
      const model = "gemini-3-flash-preview";
      const prompt = `
        Write a polite, culturally appropriate WhatsApp reminder message in Hinglish for a South Asian audience.
        Be friendly but clear. Keep it under 3 sentences.
        Context:
        Contact: ${contactName}
        Amount: ${amount}
        Days since last transaction: ${daysSince}
        Note: ${note}
      `;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      return response.text || `Hi ${contactName}, just a friendly reminder about the ${amount} pending. Thanks!`;
    } catch (error) {
      console.error("Gemini Error:", error);
      return `Hi ${contactName}, reminder for ${amount}. Please check.`;
    }
  },

  assessRisk: async (contactTransactions: Transaction[]) => {
    try {
      const model = "gemini-3-flash-preview";
      const prompt = `
        Assess the risk level of this debtor based on their transaction history.
        Return a JSON object with: { "level": "LOW" | "MEDIUM" | "HIGH", "reason": "string" }
        History: ${JSON.stringify(contactTransactions)}
      `;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      return JSON.parse(response.text || '{"level": "LOW", "reason": "No history"}');
    } catch (error) {
      return { level: "LOW", reason: "Could not assess risk" };
    }
  },

  chatWithAssistant: async (userMessage: string, allData: any) => {
    try {
      const model = "gemini-3-flash-preview";
      const prompt = `
        You are LendLedger AI, a financial assistant for South Asian users.
        Answer the user's query based on their financial data.
        Use Hinglish where appropriate.
        
        Data Context: ${JSON.stringify(allData)}
        User Message: ${userMessage}
      `;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      return response.text || "Main samajh nahi paya, dobara poochein.";
    } catch (error) {
      return "AI connection error. Please try again.";
    }
  }
};
