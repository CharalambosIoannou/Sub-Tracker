import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Category } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORY_COLORS: Record<Category, string> = {
  Entertainment: '#ec4899', // pink
  Music: '#10b981',         // emerald
  Gaming: '#8b5cf6',        // violet
  Utility: '#0ea5e9',       // sky
  Software: '#f59e0b',      // amber
  Fitness: '#cbd5e1',       // slate-300
  Other: '#64748b',         // slate
};

export function getCategoryColor(category: Category): string {
  return CATEGORY_COLORS[category] || '#64748b';
}

export function formatCurrency(amount: number, currency: string = 'EUR') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function getBrandLogoUrl(brandName: string): string {
  // Clearbit accepts domain names. We can try to format the brand name as a domain.
  // For standard user entries like "Netflix", this resolves to netflix.com
  const cleanName = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `https://logo.clearbit.com/${cleanName}.com`;
}
