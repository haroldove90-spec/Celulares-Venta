import { Product, SaleTransaction, PayJoyApplication, ShiftRegister, StoreConfig } from '../types/pos';
import { INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_PAYJOY_APPLICATIONS, INITIAL_SHIFT, INITIAL_CONFIG } from '../data/sampleData';

const STORAGE_KEYS = {
  CLEARED_SAMPLE: 'celulares_pos_cleared_sample_data',
  PRODUCTS: 'celulares_pos_products_v1',
  SALES: 'celulares_pos_sales_v1',
  PAYJOY: 'celulares_pos_payjoy_v1',
  SHIFT: 'celulares_pos_shift_v1',
  CONFIG: 'celulares_pos_config_v1',
  SHIFTS_HISTORY: 'celulares_pos_shifts_history_v1',
};

export const StorageService = {
  isSampleDataCleared(): boolean {
    return localStorage.getItem(STORAGE_KEYS.CLEARED_SAMPLE) === 'true';
  },

  setSampleDataCleared(cleared: boolean) {
    if (cleared) {
      localStorage.setItem(STORAGE_KEYS.CLEARED_SAMPLE, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.CLEARED_SAMPLE);
    }
  },

  getProducts(): Product[] {
    const isCleared = this.isSampleDataCleared();
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return isCleared ? [] : INITIAL_PRODUCTS;
      }
    }
    if (isCleared) return [];
    return INITIAL_PRODUCTS;
  },

  saveProducts(products: Product[]) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getSales(): SaleTransaction[] {
    const isCleared = this.isSampleDataCleared();
    const stored = localStorage.getItem(STORAGE_KEYS.SALES);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return isCleared ? [] : INITIAL_SALES;
      }
    }
    if (isCleared) return [];
    return INITIAL_SALES;
  },

  saveSales(sales: SaleTransaction[]) {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  },

  getPayJoyApplications(): PayJoyApplication[] {
    const isCleared = this.isSampleDataCleared();
    const stored = localStorage.getItem(STORAGE_KEYS.PAYJOY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return isCleared ? [] : INITIAL_PAYJOY_APPLICATIONS;
      }
    }
    if (isCleared) return [];
    return INITIAL_PAYJOY_APPLICATIONS;
  },

  savePayJoyApplications(apps: PayJoyApplication[]) {
    localStorage.setItem(STORAGE_KEYS.PAYJOY, JSON.stringify(apps));
  },

  getCurrentShift(): ShiftRegister | null {
    const isCleared = this.isSampleDataCleared();
    const stored = localStorage.getItem(STORAGE_KEYS.SHIFT);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return isCleared ? null : INITIAL_SHIFT;
      }
    }
    if (isCleared) return null;
    return INITIAL_SHIFT;
  },

  saveCurrentShift(shift: ShiftRegister | null) {
    if (!shift) {
      localStorage.removeItem(STORAGE_KEYS.SHIFT);
    } else {
      localStorage.setItem(STORAGE_KEYS.SHIFT, JSON.stringify(shift));
    }
  },

  getShiftsHistory(): ShiftRegister[] {
    const stored = localStorage.getItem(STORAGE_KEYS.SHIFTS_HISTORY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  },

  saveShiftsHistory(history: ShiftRegister[]) {
    localStorage.setItem(STORAGE_KEYS.SHIFTS_HISTORY, JSON.stringify(history));
  },

  getConfig(): StoreConfig {
    const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
    const isCleared = this.isSampleDataCleared();
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { ...parsed, sampleDataCleared: isCleared };
      } catch {
        return { ...INITIAL_CONFIG, sampleDataCleared: isCleared };
      }
    }
    return { ...INITIAL_CONFIG, sampleDataCleared: isCleared };
  },

  saveConfig(config: StoreConfig) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  },

  /**
   * Completely clears sample data from the browser and sets the permanent flag
   * so that the browser will never display sample data again on refreshes.
   */
  wipeAllSampleData(): { success: boolean; clearedCount: { products: number; sales: number; payjoy: number } } {
    const currentProducts = this.getProducts().length;
    const currentSales = this.getSales().length;
    const currentPayjoy = this.getPayJoyApplications().length;

    // Set permanent flag
    localStorage.setItem(STORAGE_KEYS.CLEARED_SAMPLE, 'true');

    // Wipe tables to zero records
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PAYJOY, JSON.stringify([]));
    localStorage.removeItem(STORAGE_KEYS.SHIFT);
    localStorage.setItem(STORAGE_KEYS.SHIFTS_HISTORY, JSON.stringify([]));

    // Update config flag
    const cfg = this.getConfig();
    cfg.sampleDataCleared = true;
    this.saveConfig(cfg);

    return {
      success: true,
      clearedCount: {
        products: currentProducts,
        sales: currentSales,
        payjoy: currentPayjoy,
      },
    };
  },

  /**
   * Option for demo/testing mode: restore the initial cell phone shop sample catalog
   */
  restoreDemoData() {
    localStorage.removeItem(STORAGE_KEYS.CLEARED_SAMPLE);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
    localStorage.setItem(STORAGE_KEYS.PAYJOY, JSON.stringify(INITIAL_PAYJOY_APPLICATIONS));
    localStorage.setItem(STORAGE_KEYS.SHIFT, JSON.stringify(INITIAL_SHIFT));
    const cfg = { ...INITIAL_CONFIG, sampleDataCleared: false };
    this.saveConfig(cfg);
  },

  /**
   * Export all data as JSON payload ready to be synced with Supabase or backed up
   */
  exportForSupabase(): string {
    const payload = {
      timestamp: new Date().toISOString(),
      storeConfig: this.getConfig(),
      products: this.getProducts(),
      sales: this.getSales(),
      payjoyApplications: this.getPayJoyApplications(),
      currentShift: this.getCurrentShift(),
      shiftsHistory: this.getShiftsHistory(),
    };
    return JSON.stringify(payload, null, 2);
  },
};
