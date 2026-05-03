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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    onSubmit({
      name,
      amount: parseFloat(amount),
      currency: 'EUR',
      billingCycle: cycle,
      startDate: new Date(startDate).toISOString(),
      category,
      color,
      isActive: initialData?.isActive ?? true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <Input 
          required 
          placeholder="e.g. Netflix" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-slate-500">€</span>
          <Input 
            required 
            type="number" 
            step="0.01" 
            min="0"
            className="pl-7"
            placeholder="15.99" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Billing Cycle</label>
          <select 
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
            value={cycle}
            onChange={(e) => setCycle(e.target.value as BillingCycle)}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Next Payment / Start Date</label>
          <Input 
            required 
            type="date"
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <select 
          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Color</label>
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
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
          {initialData ? 'Update Subscription' : 'Save Subscription'}
        </Button>
      </div>
    </form>
  );
}
