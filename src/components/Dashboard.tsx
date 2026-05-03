import { useMemo } from 'react';
import { format } from 'date-fns';
import { CreditCard, CalendarDays, Wallet } from 'lucide-react';
import { Subscription } from '../types';
import { calculateTotalMonthlySpend, getUpcomingPayments } from '../lib/calculations';
import { formatCurrency } from '../lib/utils';
import { Card, CardContent } from './ui/Card';

interface DashboardProps {
  subscriptions: Subscription[];
}

export function Dashboard({ subscriptions }: DashboardProps) {
  const activeSubs = subscriptions.filter(s => s.isActive);
  const totalMonthly = calculateTotalMonthlySpend(subscriptions);
  const upcoming = useMemo(() => getUpcomingPayments(subscriptions).slice(0, 5), [subscriptions]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your recurring expenses.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-indigo-600 text-white border-none shrink-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="font-medium text-indigo-100">Monthly Spend</p>
              <Wallet className="h-5 w-5 text-indigo-200" />
            </div>
            <div className="mt-4 flex items-baseline text-4xl font-extrabold">
              {formatCurrency(totalMonthly)}
            </div>
            <p className="text-sm mt-1 text-indigo-200">Across all active subs</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="font-medium text-slate-500">Active Subs</p>
              <CreditCard className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-4 flex items-baseline text-4xl font-extrabold text-slate-900">
              {activeSubs.length}
            </div>
            <p className="text-sm mt-1 text-slate-500 text-ellipsis overflow-hidden whitespace-nowrap">
              {subscriptions.length - activeSubs.length} inactive
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="font-medium text-slate-500">Yearly Projection</p>
              <CalendarDays className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-4 flex items-baseline text-4xl font-extrabold text-slate-900">
              {formatCurrency(totalMonthly * 12)}
            </div>
            <p className="text-sm mt-1 text-slate-500">Estimated total for 12 months</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight">Upcoming Renewals</h2>
        </div>
        
        {upcoming.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">No active subscriptions to renew.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(({ subscription, nextPaymentDate, daysUntil }) => (
              <div 
                key={subscription.id} 
                className="flex items-center p-4 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center w-full">
                  <div className="flex items-center">
                    <div 
                      className="flex h-14 w-14 items-center justify-center rounded-2xl text-white font-bold text-2xl shrink-0 shadow-sm"
                      style={{ backgroundColor: subscription.color }}
                    >
                      {subscription.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="ml-0 sm:ml-5 mt-4 sm:mt-0 flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900 truncate">{subscription.name}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 capitalize">
                        {subscription.billingCycle}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1.5 text-sm">
                      <div className="flex items-center text-slate-600">
                        <CalendarDays className="w-4 h-4 mr-1.5 text-slate-400" />
                        <span>Next renewal: <strong className="text-slate-900">{format(nextPaymentDate, 'MMMM d, yyyy')}</strong></span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left sm:text-right mt-4 sm:mt-0 shrink-0 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none border border-slate-100 sm:border-none">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:hidden">Amount Due</div>
                    <div className="font-extrabold text-xl text-slate-900">
                      {formatCurrency(subscription.amount)}
                    </div>
                    <div className={`flex items-center sm:justify-end text-sm mt-1 font-medium ${daysUntil <= 3 ? 'text-red-600' : 'text-slate-500'}`}>
                      {daysUntil === 0 ? (
                         <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1.5 animate-pulse hidden sm:block"></span>Due Today</span>
                      ) : daysUntil === 1 ? (
                         <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-500 mr-1.5 hidden sm:block"></span>Due Tomorrow</span>
                      ) : (
                         `Renews in ${daysUntil} days`
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
