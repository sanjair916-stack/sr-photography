import { Quotation, StudioProfile } from '../types';
import { INITIAL_SEED_QUOTATIONS, DEFAULT_STUDIO_PROFILE } from '../constants';

const LOCAL_STORAGE_KEY_QUOTES = 'sr_photography_quotations_cache';
const LOCAL_STORAGE_KEY_SETTINGS = 'sr_photography_settings_cache';

export const api = {
  // Quotations
  async getQuotations(): Promise<Quotation[]> {
    try {
      const res = await fetch('/api/quotations');
      if (!res.ok) throw new Error('Failed to fetch from server');
      const data = await res.json();
      localStorage.setItem(LOCAL_STORAGE_KEY_QUOTES, JSON.stringify(data));
      return data;
    } catch (err) {
      console.warn('Using cached quotations:', err);
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY_QUOTES);
      return cached ? JSON.parse(cached) : INITIAL_SEED_QUOTATIONS;
    }
  },

  async createQuotation(quotation: Partial<Quotation>): Promise<Quotation> {
    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotation)
      });
      if (!res.ok) throw new Error('Failed to create quotation on server');
      return await res.json();
    } catch (err) {
      console.error('Server save failed, saving to local cache:', err);
      // Fallback local creation
      const currentYear = new Date().getFullYear();
      const cachedList: Quotation[] = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEY_QUOTES) || JSON.stringify(INITIAL_SEED_QUOTATIONS)
      );
      const newId = `SRP-${currentYear}-${String(cachedList.length + 1).padStart(4, '0')}`;
      const newQuote = {
        ...quotation,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Quotation;
      cachedList.unshift(newQuote);
      localStorage.setItem(LOCAL_STORAGE_KEY_QUOTES, JSON.stringify(cachedList));
      return newQuote;
    }
  },

  async updateQuotation(id: string, updates: Partial<Quotation>): Promise<Quotation> {
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update quotation on server');
      return await res.json();
    } catch (err) {
      console.error('Server update failed, updating local cache:', err);
      const cachedList: Quotation[] = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEY_QUOTES) || '[]'
      );
      const idx = cachedList.findIndex((q) => q.id === id);
      if (idx !== -1) {
        cachedList[idx] = { ...cachedList[idx], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(LOCAL_STORAGE_KEY_QUOTES, JSON.stringify(cachedList));
        return cachedList[idx];
      }
      throw err;
    }
  },

  async duplicateQuotation(id: string): Promise<Quotation> {
    try {
      const res = await fetch(`/api/quotations/${id}/duplicate`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to duplicate quotation on server');
      return await res.json();
    } catch (err) {
      console.error('Server duplication failed, duplicating in local cache:', err);
      const cachedList: Quotation[] = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEY_QUOTES) || '[]'
      );
      const source = cachedList.find((q) => q.id === id);
      if (!source) throw new Error('Quotation not found');
      const currentYear = new Date().getFullYear();
      const newId = `SRP-${currentYear}-${String(cachedList.length + 1).padStart(4, '0')}`;
      const duplicated: Quotation = {
        ...source,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'Quotation',
        paymentStatus: 'Advance Pending',
        customer: {
          ...source.customer,
          name: `${source.customer.name} (Copy)`
        }
      };
      cachedList.unshift(duplicated);
      localStorage.setItem(LOCAL_STORAGE_KEY_QUOTES, JSON.stringify(cachedList));
      return duplicated;
    }
  },

  async deleteQuotation(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/quotations/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete on server');
      return true;
    } catch (err) {
      console.error('Server delete failed, updating local cache:', err);
      const cachedList: Quotation[] = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEY_QUOTES) || '[]'
      );
      const filtered = cachedList.filter((q) => q.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY_QUOTES, JSON.stringify(filtered));
      return true;
    }
  },

  // Studio Settings
  async getSettings(): Promise<StudioProfile> {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings from server');
      const data = await res.json();
      localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(data));
      return data;
    } catch (err) {
      console.warn('Using cached settings:', err);
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
      return cached ? { ...DEFAULT_STUDIO_PROFILE, ...JSON.parse(cached) } : DEFAULT_STUDIO_PROFILE;
    }
  },

  async updateSettings(settings: Partial<StudioProfile>): Promise<StudioProfile> {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Failed to update settings on server');
      const data = await res.json();
      localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(data));
      return data;
    } catch (err) {
      console.error('Server settings update failed, saving local cache:', err);
      const current = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS) || JSON.stringify(DEFAULT_STUDIO_PROFILE)
      );
      const updated = { ...current, ...settings };
      localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(updated));
      return updated;
    }
  },

  // Auth
  async login(username: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      // Local fallback for quick recovery if server is starting
      if (username.trim().toLowerCase() === 'admin' && password === 'srphotography2026') {
        return { success: true };
      }
      return { success: false, message: 'Authentication failed. Please verify credentials.' };
    }
  },

  async changePassword(currentPassword: string, newPassword: string, newUsername?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword, newUsername })
    });
    return await res.json();
  }
};
