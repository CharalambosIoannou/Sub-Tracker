import { addDays, addMonths, addYears, isBefore, isPast, parseISO, startOfDay, differenceInDays } from 'date-fns';
import { Subscription, BillingCycle } from '../types';

// STRATEGY: Multi-Currency Support
// In a production app, fetch live exchange rates from an API and store them in a context/store.
// All amounts are converted to a unified base currency (e.g., EUR) for dashboard totals.
const MOCK_EXCHANGE_RATES: Record<string, number> = {
  EUR: 1.0,
  USD: 1.08,
  GBP: 0.85,
  JPY: 160.5,
};

export function convertToBaseCurrency(amount: number, currency: string = 'EUR', baseCurrency: string = 'EUR'): number {
  if (currency === baseCurrency) return amount;
  
  const rateToEUR = MOCK_EXCHANGE_RATES[currency] || 1;
  const amountInEUR = amount / rateToEUR;
  
  const baseRate = MOCK_EXCHANGE_RATES[baseCurrency] || 1;
  return amountInEUR * baseRate;
}

export function getMonthlyEquivalent(amount: number, cycle: BillingCycle, currency: string = 'EUR'): number {
  const baseAmount = convertToBaseCurrency(amount, currency, 'EUR');

  if (cycle === 'monthly') return baseAmount;
  if (cycle === 'yearly') return baseAmount / 12;
  if (cycle === 'weekly') return baseAmount * (52 / 12);
  return baseAmount;
}

export function calculateTotalMonthlySpend(subscriptions: Subscription[]): number {
  return subscriptions
    .filter(s => s.isActive)
    .reduce((total, sub) => total + getMonthlyEquivalent(sub.amount, sub.billingCycle, sub.currency || 'EUR'), 0);
}

export function getNextPaymentDate(startDateStr: string, cycle: BillingCycle): Date {
  const start = startOfDay(parseISO(startDateStr));
  const today = startOfDay(new Date());

  if (!isPast(start)) {
    return start; // Feature start date is the first payment
  }

  let nextDate = start;

  // Simple iteration to find the next valid date. 
  // For production, math-based calculation is better, but this works well for simple recurring dates
  while (isBefore(nextDate, today)) {
    if (cycle === 'monthly') {
      nextDate = addMonths(nextDate, 1);
    } else if (cycle === 'yearly') {
      nextDate = addYears(nextDate, 1);
    } else if (cycle === 'weekly') {
      nextDate = addDays(nextDate, 7);
    }
  }

  return nextDate;
}

export interface UpcomingPayment {
  subscription: Subscription;
  nextPaymentDate: Date;
  daysUntil: number;
}

export function getUpcomingPayments(subscriptions: Subscription[]): UpcomingPayment[] {
  const activeSubs = subscriptions.filter(s => s.isActive);
  const today = startOfDay(new Date());

  const upcoming = activeSubs.map(sub => {
    const nextDate = getNextPaymentDate(sub.startDate, sub.billingCycle);
    return {
      subscription: sub,
      nextPaymentDate: nextDate,
      daysUntil: differenceInDays(nextDate, today),
    };
  });

  // Sort by closest payment date
  return upcoming.sort((a, b) => a.nextPaymentDate.getTime() - b.nextPaymentDate.getTime());
}
