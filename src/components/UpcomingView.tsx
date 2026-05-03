import { useMemo } from 'react';
import { format, isThisWeek, isThisMonth, isSameWeek, addWeeks } from 'date-fns';
import { Clock, CalendarDays, AlertCircle } from 'lucide-react';
import { Subscription } from '../types';
import { getUpcomingPayments } from '../lib/calculations';
import { formatCurrency, getBrandLogoUrl } from '../lib/utils';
import { Card, CardContent } from './ui/Card';

interface UpcomingViewProps {
  subscriptions: Subscription[];
}

export function UpcomingView({ subscriptions }: UpcomingViewProps) {
  const upcoming = useMemo(() => getUpcomingPayments(subscriptions), [subscriptions]);

  const groups = useMemo(() => {
    const groups = {
      thisWeek: [] as typeof upcoming,
      nextWeek: [] as typeof upcoming,
      laterThisMonth: [] as typeof upcoming,
      later: [] as typeof upcoming,
    };

    const nextWeekDate = addWeeks(new Date(), 1);

    upcoming.forEach(item => {
      const date = item.nextPaymentDate;
      if (isThisWeek(date, { weekStartsOn: 1 })) { // Assuming Monday start
        groups.thisWeek.push(item);
      } else if (isSameWeek(date, nextWeekDate, { weekStartsOn: 1 })) {
        groups.nextWeek.push(item);
      } else if (isThisMonth(date)) {
        groups.laterThisMonth.push(item);
      } else {
        groups.later.push(item);
      }
    });

    return groups;
  }, [upcoming]);

  const renderGroup = (title: string, items: typeof upcoming) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">{title}</h3>
        <div className="space-y-4">
          {items.map(({ subscription, nextPaymentDate, daysUntil }) => (
            <Card key={subscription.id} className="dark:bg-slate-900 dark:border-slate-800 transition-colors">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center w-full">
                  <div className="flex items-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 overflow-hidden shrink-0 shadow-sm border border-slate-200 dark:border-slate-700">
                      <img 
                        src={getBrandLogoUrl(subscription.name)} 
                        alt={subscription.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                          const parent = (e.target as HTMLElement).parentElement;
                          if (parent) {
                            parent.innerHTML = `<span class="text-xl font-bold" style="color: ${subscription.color}">${subscription.name.charAt(0).toUpperCase()}</span>`;
                            parent.style.backgroundColor = `${subscription.color}20`; // Lighter background
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="ml-0 sm:ml-5 mt-4 sm:mt-0 flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">{subscription.name}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                        {subscription.billingCycle}
                      </span>
                      {subscription.isTrial && (
                        <span className="inline-flex flex-shrink-0 items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400">
                          Free Trial
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm">
                      <div className="flex items-center text-slate-600 dark:text-slate-400">
                        <CalendarDays className="w-4 h-4 mr-1.5 opacity-70" />
                        <span>Date: <strong className="text-slate-900 dark:text-slate-200">{format(nextPaymentDate, 'MMM d, yyyy')}</strong></span>
                      </div>
                      {subscription.isTrial && subscription.trialEndDate && (
                        <div className="flex items-center text-emerald-600 dark:text-emerald-500 ml-2">
                          <AlertCircle className="w-4 h-4 mr-1 opacity-80" />
                          <span>Converts paid on {format(new Date(subscription.trialEndDate), 'MMM d')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-left sm:text-right mt-4 sm:mt-0 shrink-0 bg-slate-50 dark:bg-slate-800/50 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none border border-slate-100 dark:border-slate-800 sm:border-none">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 sm:hidden">Amount Due</div>
                    <div className="font-extrabold text-xl text-slate-900 dark:text-slate-100">
                      {formatCurrency(subscription.amount, subscription.currency)}
                    </div>
                    <div className={`flex items-center sm:justify-end text-sm mt-1 font-medium ${
                      daysUntil === 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : daysUntil <= 3 
                          ? 'text-orange-500 dark:text-orange-400' 
                          : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {daysUntil === 0 ? (
                         <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1.5 animate-pulse"></span>Due Today</span>
                      ) : daysUntil === 1 ? (
                         <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-500 mr-1.5"></span>Due Tomorrow</span>
                      ) : (
                         `Renews in ${daysUntil} days`
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  if (upcoming.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
          <Clock className="w-10 h-10 text-slate-400 dark:text-slate-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No Upcoming Renewals</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
          You don't have any active subscriptions. Add some to see when payments are due.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Upcoming Timeline</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Your subscription renewals organized by time.</p>
      </div>
      
      {renderGroup("This Week", groups.thisWeek)}
      {renderGroup("Next Week", groups.nextWeek)}
      {renderGroup("Later this Month", groups.laterThisMonth)}
      {renderGroup("Future", groups.later)}
    </div>
  );
}
