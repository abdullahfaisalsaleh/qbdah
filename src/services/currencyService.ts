/**
 * Real-Time Currency Exchange & Conversion Service
 * Fetches real-time exchange rates from /api/currency/rates with localStorage caching and offline fallback
 */

import { CurrencyCode, CurrencyConfig } from '../types/index.ts';
import { CURRENCIES, convertCurrency, formatMoney } from '../utils/finance.ts';

export interface ExchangeRatesData {
  base: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  lastUpdated: string;
  source: string;
  isLive: boolean;
}

const STORAGE_KEY = 'qabdah_live_exchange_rates';
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

// Baseline rates if network is unavailable - derived directly from CURRENCIES
const DEFAULT_RATES: Record<CurrencyCode, number> = Object.fromEntries(
  Object.entries(CURRENCIES).map(([code, config]) => [code, config.rateToUSD])
) as Record<CurrencyCode, number>;

export class CurrencyService {
  private static cachedData: ExchangeRatesData | null = null;
  private static listeners: Set<(rates: ExchangeRatesData) => void> = new Set();

  /**
   * Subscribe to exchange rate changes
   */
  static subscribe(listener: (rates: ExchangeRatesData) => void): () => void {
    this.listeners.add(listener);
    if (this.cachedData) {
      listener(this.cachedData);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyListeners(data: ExchangeRatesData) {
    for (const listener of this.listeners) {
      try {
        listener(data);
      } catch (err) {
        console.error('Error in currency rate listener:', err);
      }
    }
  }

  /**
   * Get cached exchange rates from memory or localStorage
   */
  static getCachedRates(): ExchangeRatesData {
    if (this.cachedData) {
      return this.cachedData;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.rates) {
          this.cachedData = parsed;
          return parsed;
        }
      }
    } catch {
      // Ignore localStorage read errors
    }

    const initial: ExchangeRatesData = {
      base: 'USD',
      rates: { ...DEFAULT_RATES },
      lastUpdated: new Date().toISOString(),
      source: 'Central Bank Standard Baselines',
      isLive: false,
    };
    this.cachedData = initial;
    return initial;
  }

  /**
   * Fetch latest live exchange rates from the backend API
   */
  static async fetchLatestRates(force: boolean = false): Promise<ExchangeRatesData> {
    const current = this.getCachedRates();
    const age = Date.now() - new Date(current.lastUpdated).getTime();

    if (!force && current.isLive && age < CACHE_EXPIRY_MS) {
      return current;
    }

    try {
      const res = await fetch('/api/currency/rates');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.rates) {
          const mergedRates: Record<CurrencyCode, number> = { ...DEFAULT_RATES };
          for (const key of Object.keys(DEFAULT_RATES) as CurrencyCode[]) {
            if (json.rates[key]) {
              mergedRates[key] = Number(json.rates[key]) || DEFAULT_RATES[key];
            }
          }

          const freshData: ExchangeRatesData = {
            base: 'USD',
            rates: mergedRates,
            lastUpdated: json.lastUpdated || new Date().toISOString(),
            source: json.source || 'Open Exchange Rates (Live)',
            isLive: true,
          };

          this.cachedData = freshData;
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(freshData));
          } catch {
            // Ignore quota errors
          }
          this.notifyListeners(freshData);
          return freshData;
        }
      }
    } catch (err) {
      console.warn('Could not fetch real-time exchange rates, using fallback:', err);
    }

    return current;
  }

  /**
   * Convert an amount between any two currencies using current live rates
   */
  static convert(
    amount: number,
    from: CurrencyCode,
    to: CurrencyCode,
    rates?: Partial<Record<CurrencyCode, number>>
  ): number {
    const currentRates = rates || this.getCachedRates().rates;
    return convertCurrency(amount, from, to, currentRates);
  }

  /**
   * Get direct cross exchange rate between two currencies (e.g. 1 USD = ? EGP)
   */
  static getCrossRate(
    from: CurrencyCode,
    to: CurrencyCode,
    rates?: Partial<Record<CurrencyCode, number>>
  ): number {
    if (from === to) return 1.0;
    const r = rates || this.getCachedRates().rates;
    const fromUSD = r[from] || CURRENCIES[from]?.rateToUSD || 1;
    const toUSD = r[to] || CURRENCIES[to]?.rateToUSD || 1;
    const rate = (1 / fromUSD) * toUSD;
    return Math.round((rate + Number.EPSILON) * 10000) / 10000;
  }
}
