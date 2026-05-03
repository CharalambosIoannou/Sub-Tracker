export type BillingCycle = 'weekly' | 'monthly' | 'yearly';

export type Category = 
  | 'Entertainment'
  | 'Utility'
  | 'Software'
  | 'Gaming'
  | 'Music'
  | 'Fitness'
  | 'Other';

export interface Subscription {
  id: string;
  name: string;
  amount: number; // Stored as monthly equivalent for some calculations, but represents actual amount
  currency: string;
  billingCycle: BillingCycle;
  startDate: string; // ISO date string
  category: Category;
  color: string;
  isActive: boolean;
}
