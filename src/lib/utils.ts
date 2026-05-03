import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
