import { useState, FormEvent } from 'react';
import { Subscription, BillingCycle, Category } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export interface SubscriptionFormData extends Omit<Subscription, 'id'> {}

interface SubscriptionFormProps {
  initialData?: Subscription;
  onSubmit: (data: SubscriptionFormData) => void;
  onCancel: () => void;
}

const CATEGORIES: Category[] = [
  'Entertainment', 'Utility', 'Software', 'Gaming', 'Music', 'Fitness', 'Other'
];

const COLORS = [
  '#E50914', // Netflix Red
  '#1DB954', // Spotify Green
  '#00A8E1', // Prime Blue
  '#F42A8B', // Pink
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#64748B', // Slate
];

export function SubscriptionForm({ initialData, onSubmit, onCancel }: SubscriptionFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [currency, setCurrency] = useState(initialData?.currency || 'EUR');
  const [cycle, setCycle] = useState<BillingCycle>(initialData?.billingCycle || 'monthly');
  
  const getInitialDate = () => {
    if (initialData?.startDate) {
      return new Date(initialData.startDate).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  };
  
  const [startDate, setStartDate] = useState(getInitialDate());
  const [category, setCategory] = useState<Category>(initialData?.category || 'Entertainment');
  const [color, setColor] = useState(initialData?.color || COLORS[0]);
  const [isTrial, setIsTrial] = useState(initialData?.isTrial || false);
  const [trialEndDate, setTrialEndDate] = useState(initialData?.trialEndDate ? new Date(initialData.trialEndDate).toISOString().split('T')[0] : '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    onSubmit({
      name,
      amount: parseFloat(amount),
      currency,
      billingCycle: cycle,
      startDate: new Date(startDate).toISOString(),
      category,
      color,
      isActive: initialData?.isActive ?? true,
      isTrial,
      trialEndDate: isTrial && trialEndDate ? new Date(trialEndDate).toISOString() : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium dark:text-slate-200">Name</label>
        <Input 
          required 
          placeholder="e.g. Netflix" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        />
      </div>

      <div className="grid grid-cols-[1fr_80px] gap-2 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium dark:text-slate-200">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-500">{currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '¥'}</span>
            <Input 
              required 
              type="number" 
              step="0.01" 
              min="0"
              className="pl-7 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              placeholder="15.99" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
            />
          </div>
        </div>
        <div className="space-y-2">
           <select 
            className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium dark:text-slate-200">Billing Cycle</label>
          <select 
            className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            value={cycle}
            onChange={(e) => setCycle(e.target.value as BillingCycle)}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium dark:text-slate-200">Start Date</label>
          <Input 
            required 
            type="date"
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="isTrial" 
            checked={isTrial} 
            onChange={(e) => setIsTrial(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-600 bg-white dark:bg-slate-900"
          />
          <label htmlFor="isTrial" className="text-sm font-medium cursor-pointer dark:text-slate-300">This is a free trial</label>
        </div>
        
        {isTrial && (
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="text-sm font-medium dark:text-slate-200">Trial End Date (Converts to paid)</label>
            <Input 
              type="date"
              required={isTrial}
              value={trialEndDate} 
              onChange={(e) => setTrialEndDate(e.target.value)} 
              className="dark:bg-slate-900 dark:border-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium dark:text-slate-200">Category</label>
        <select 
          className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium dark:text-slate-200">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full border-2 transition-all focus:outline-none"
              style={{ backgroundColor: c, borderColor: color === c ? '#0f172a' : 'transparent' }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="dark:text-slate-300 dark:hover:bg-slate-800">Cancel</Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
          {initialData ? 'Update' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
