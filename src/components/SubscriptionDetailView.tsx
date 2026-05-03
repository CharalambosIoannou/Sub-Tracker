import { format } from 'date-fns';
import { Pencil, Calendar, Settings, Tag, DollarSign, ExternalLink } from 'lucide-react';
import { Subscription } from '../types';
import { formatCurrency, getBrandLogoUrl } from '../lib/utils';
import { Button } from './ui/Button';

interface SubscriptionDetailViewProps {
  subscription: Subscription;
  onEdit: () => void;
  onClose: () => void;
}

export function SubscriptionDetailView({ subscription, onEdit, onClose }: SubscriptionDetailViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center mb-4">
          <img 
            src={getBrandLogoUrl(subscription.name)} 
            alt={subscription.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                parent.innerHTML = `<span class="text-3xl font-bold" style="color: ${subscription.color || '#fff'}">${subscription.name.charAt(0).toUpperCase()}</span>`;
                parent.style.backgroundColor = `${subscription.color}20`;
              }
            }}
          />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{subscription.name}</h2>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${subscription.isActive ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
            {subscription.isActive ? 'Active' : 'Paused'}
          </span>
          {subscription.isTrial && (
            <span className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-800 dark:text-indigo-400">
              Free Trial
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Price</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(subscription.amount)}</span>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Billing Cycle</span>
          </div>
          <span className="capitalize font-medium text-slate-900 dark:text-slate-100">{subscription.billingCycle}</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Sign Up Date</span>
          </div>
          <span className="font-medium text-slate-900 dark:text-slate-100">{format(new Date(subscription.startDate), 'MMM dd, yyyy')}</span>
        </div>
        
        {subscription.isTrial && subscription.trialEndDate && (
          <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Trial Ends</span>
            </div>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">{format(new Date(subscription.trialEndDate), 'MMM dd, yyyy')}</span>
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Category</span>
          </div>
          <span className="font-medium text-slate-900 dark:text-slate-100">{subscription.category}</span>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button 
          variant="outline" 
          className="flex-1 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" 
          onClick={onClose}
        >
          Close
        </Button>
        <Button 
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white gap-2" 
          onClick={onEdit}
        >
          <Pencil className="w-4 h-4" />
          Edit
        </Button>
      </div>
    </div>
  );
}
