import { useMemo } from 'react';
import { format } from 'date-fns';
import { CreditCard, CalendarDays, Wallet, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { Subscription } from '../types';
import { calculateTotalMonthlySpend, getUpcomingPayments, getMonthlyEquivalent } from '../lib/calculations';
import { formatCurrency, getBrandLogoUrl } from '../lib/utils';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';

interface DashboardProps {
  subscriptions: Subscription[];
  onNavigate: (tab: string) => void;
}

export function Dashboard({ subscriptions, onNavigate }: DashboardProps) {
  const activeSubs = subscriptions.filter(s => s.isActive);
  const totalMonthly = calculateTotalMonthlySpend(subscriptions);
  const dailyBurn = totalMonthly / 30.436875;
  const yearlyCost = totalMonthly * 12;
  
  const upcoming = useMemo(() => getUpcomingPayments(subscriptions), [subscriptions]);
  const peekUpcoming = upcoming.slice(0, 3);

  const highestExpense = useMemo(() => {
    if (activeSubs.length === 0) return null;
    return [...activeSubs].sort((a, b) => 
      getMonthlyEquivalent(b.amount, b.billingCycle) - getMonthlyEquivalent(a.amount, a.billingCycle)
    )[0];
  }, [activeSubs]);

  const highestExpenseNextPayment = useMemo(() => {
    if (!highestExpense) return null;
    const up = upcoming.find(u => u.subscription.id === highestExpense.id);
    return up ? up.nextPaymentDate : null;
  }, [highestExpense, upcoming]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Overview of your recurring expenses.</p>
      </header>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-2 sm:col-span-1 border-indigo-100 bg-indigo-50/50 dark:border-indigo-500/20 dark:bg-indigo-500/10 shrink-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Monthly Spend</p>
              <Wallet className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline text-3xl font-extrabold text-indigo-900 dark:text-indigo-100">
              {formatCurrency(totalMonthly)}
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Daily Burn</p>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex items-baseline text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(dailyBurn)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Yearly Run Rate</p>
              <CalendarDays className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex items-baseline text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(yearlyCost)}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 sm:col-span-1 dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Active Subs</p>
              <CreditCard className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex items-baseline text-2xl font-bold text-slate-900 dark:text-slate-100 gap-2">
              {activeSubs.length} 
              <span className="text-sm font-medium text-slate-400 normal-case tracking-normal">active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Upcoming Renewals Peek */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Upcoming Renewals</h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('upcoming')} className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
              See All <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </div>
          
          {peekUpcoming.length === 0 ? (
            <Card className="border-dashed dark:border-slate-800 dark:bg-slate-900/50">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <CalendarDays className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No upcoming renewals.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {peekUpcoming.map(({ subscription, nextPaymentDate, daysUntil }) => (
                <Card key={subscription.id} className="dark:bg-slate-900 dark:border-slate-800 transition-colors hover:border-indigo-200 dark:hover:border-indigo-800">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                      <img 
                        src={getBrandLogoUrl(subscription.name)} 
                        alt={subscription.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                          const parent = (e.target as HTMLElement).parentElement;
                          if (parent) {
                            parent.innerHTML = `<span class="text-lg font-bold" style="color: ${subscription.color}">${subscription.name.charAt(0).toUpperCase()}</span>`;
                            parent.style.backgroundColor = `${subscription.color}20`;
                          }
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate">{subscription.name}</h3>
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1 space-x-2">
                        <span>{format(nextPaymentDate, 'MMM d')}</span>
                        <span>•</span>
                        <span className={`font-medium ${
                          daysUntil === 0 ? 'text-red-600 dark:text-red-400' : daysUntil <= 3 ? 'text-orange-500 dark:text-orange-400' : ''
                        }`}>
                          {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(subscription.amount)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Actionable Insight Card */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Actionable Insight</h2>
          {highestExpense ? (
            <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900/30 dark:bg-orange-900/10 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-200/50 dark:bg-orange-500/10 rounded-bl-full blur-2xl pointer-events-none" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-orange-500 dark:text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Highest Expense</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      <strong>{highestExpense.name}</strong> is your most expensive active subscription.
                    </p>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-900/80 rounded-xl p-4 border border-orange-100 dark:border-orange-800/50 shadow-sm">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-slate-500 dark:text-slate-400">Monthly eq.</span>
                    <strong className="text-slate-900 dark:text-slate-100">{formatCurrency(getMonthlyEquivalent(highestExpense.amount, highestExpense.billingCycle))}</strong>
                  </div>
                  {highestExpenseNextPayment && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Next billing</span>
                      <strong className="text-slate-900 dark:text-slate-100">{format(highestExpenseNextPayment, 'MMM d, yyyy')}</strong>
                    </div>
                  )}
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-400/80 mt-4 text-center font-medium">
                  Could you pause or switch to a cheaper tier?
                </p>
              </CardContent>
            </Card>
          ) : (
             <Card className="border-dashed dark:border-slate-800 dark:bg-slate-900/50">
               <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                 <p className="text-slate-500 dark:text-slate-400 text-sm">Add subscriptions to see priority insights.</p>
               </CardContent>
             </Card>
          )}
        </div>
      </div>
    </div>
  );
}
