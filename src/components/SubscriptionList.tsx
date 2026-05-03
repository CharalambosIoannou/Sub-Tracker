import { useState } from 'react';
import { Search, Plus, Trash2, Power, Pencil } from 'lucide-react';
import { Subscription } from '../types';
import { formatCurrency } from '../lib/utils';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onUpdate: (id: string, updates: Partial<Subscription>) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
  onEditClick: (sub: Subscription) => void;
}

export function SubscriptionList({ subscriptions, onUpdate, onDelete, onAddClick, onEditClick }: SubscriptionListProps) {
  const [search, setSearch] = useState('');

  const filtered = subscriptions.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">All Subscriptions</h1>
          <p className="text-slate-500 mt-1">Manage and track your recurring items.</p>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
        <Input 
          className="pl-10 h-12 rounded-xl bg-white shadow-sm"
          placeholder="Search by name or category..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-slate-200 border-dashed bg-slate-50">
            <h3 className="text-lg font-medium text-slate-900 mb-1">No subscriptions found</h3>
            <p className="text-slate-500 mb-4 whitespace-normal">Try adjusting your search or add a new one.</p>
            <Button onClick={onAddClick} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
              <Plus className="h-4 w-4" />
              Add First Subscription
            </Button>
          </div>
        ) : (
          filtered.map(sub => (
            <div 
              key={sub.id} 
              className={`flex flex-col md:flex-row md:items-center p-4 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all group ${!sub.isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center w-full md:w-auto overflow-hidden">
                <div 
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-white font-bold text-lg shrink-0"
                  style={{ backgroundColor: sub.color || '#64748b' }}
                >
                  {sub.name.charAt(0).toUpperCase()}
                </div>
                
                <div className="ml-4 flex-1 overflow-hidden min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 truncate">{sub.name}</h3>
                    {!sub.isActive && (
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 shrink-0">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 truncate mt-0.5">
                    {sub.category}
                  </div>
                </div>

                <div className="text-right ml-4 shrink-0 md:mr-4">
                  <div className="font-bold text-slate-900">
                    {formatCurrency(sub.amount)}
                  </div>
                  <div className="text-xs text-slate-500 capitalize mt-0.5">
                    / {sub.billingCycle.replace('ly', '')}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100 md:w-auto md:mt-0 md:pt-0 md:border-t-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onEditClick(sub)}
                  className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                  title="Edit subscription"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onUpdate(sub.id, { isActive: !sub.isActive })}
                  className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                  title={sub.isActive ? "Pause subscription" : "Resume subscription"}
                >
                  <Power className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${sub.name}?`)) {
                      onDelete(sub.id);
                    }
                  }}
                  className="h-8 w-8 text-slate-500 hover:text-red-600"
                  title="Delete subscription"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
