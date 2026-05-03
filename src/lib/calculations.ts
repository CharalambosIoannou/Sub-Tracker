import { addDays, addMonths, addYears, isBefore, isPast, parseISO, startOfDay, differenceInDays } from 'date-fns';
import { Subscription, BillingCycle } from '../types';

export function getMonthlyEquivalent(amount: number, cycle: BillingCycle): number {
  if (cycle === 'monthly') return amount;
  if (cycle === 'yearly') return amount / 12;
  if (cycle === 'weekly') return amount * (52 / 12);
  return amount;
}

export function calculateTotalMonthlySpend(subscriptions: Subscription[]): number {
  return subscriptions
    .filter(s => s.isActive)
    .reduce((total, sub) => total + getMonthlyEquivalent(sub.amount, sub.billingCycle), 0);
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
