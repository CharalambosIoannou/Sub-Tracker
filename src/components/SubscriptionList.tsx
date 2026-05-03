import { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Power, Pencil, Play, Pause, ChevronDown, CalendarDays } from 'lucide-react';
import { Subscription } from '../types';
import { formatCurrency, getBrandLogoUrl } from '../lib/utils';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { getNextPaymentDate } from '../lib/calculations';
import { format } from 'date-fns';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onUpdate: (id: string, updates: Partial<Subscription>) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
  onEditClick: (sub: Subscription) => void;
}

type SortOption = 'name_asc' | 'price_desc' | 'price_asc' | 'date_asc';

export function SubscriptionList({ subscriptions, onUpdate, onDelete, onAddClick, onEditClick }: SubscriptionListProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('price_desc');

  const filteredAndSorted = useMemo(() => {
    let result = subscriptions.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
    );

    result = result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'price_desc':
          return b.amount - a.amount;
        case 'price_asc':
          return a.amount - b.amount;
        case 'date_asc': {
          const dateA = getNextPaymentDate(a.startDate, a.billingCycle).getTime();
          const dateB = getNextPaymentDate(b.startDate, b.billingCycle).getTime();
          return dateA - dateB;
        }
        default:
          return 0;
      }
    });

    return result;
  }, [subscriptions, search, sortBy]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">All Subscriptions</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track your recurring items.</p>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          <Input 
            className="pl-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800"
            placeholder="Search by name or category..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="relative shrink-0">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-10 pl-3 pr-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="name_asc">Name: A-Z</option>
            <option value="date_asc">Next Renewal Date</option>
          </select>
          <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-3 pb-24">
        {filteredAndSorted.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed bg-slate-50 dark:bg-slate-900/50">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No subscriptions found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4 whitespace-normal">Try adjusting your search or add a new one.</p>
            <Button onClick={onAddClick} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
              <Plus className="h-4 w-4" />
              Add First Subscription
            </Button>
          </div>
        ) : (
          filteredAndSorted.map(sub => (
            <div 
              key={sub.id} 
              className={`group flex flex-col md:flex-row md:items-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-200 dark:hover:border-indigo-800 cursor-pointer ${!sub.isActive ? 'opacity-60 grayscale-[0.5]' : ''}`}
              onClick={() => onEditClick(sub)}
            >
              <div className="flex items-center w-full md:w-auto overflow-hidden">
                <div 
                  className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-200 dark:border-slate-700"
                >
                  <img 
                    src={getBrandLogoUrl(sub.name)} 
                    alt={sub.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-lg font-bold" style="color: ${sub.color || '#fff'}">${sub.name.charAt(0).toUpperCase()}</span>`;
                        parent.style.backgroundColor = `${sub.color}20`;
                      }
                    }}
                  />
                </div>
                
                <div className="ml-4 flex-1 overflow-hidden min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{sub.name}</h3>
                    {!sub.isActive && (
                      <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400 shrink-0 border border-slate-200 dark:border-slate-700">
                        Paused
                      </span>
                    )}
                    {sub.isTrial && sub.isActive && (
                      <span className="inline-flex items-center rounded-md bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400 shrink-0">
                        Free Trial
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5 flex gap-2 items-center">
                    <span>{sub.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {format(getNextPaymentDate(sub.startDate, sub.billingCycle), 'MMM d')}
                    </span>
                  </div>
                </div>

                <div className="text-right ml-4 shrink-0 md:mr-6">
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(sub.amount)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                    / {sub.billingCycle.replace('ly', '')}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 md:w-auto md:mt-0 md:pt-0 md:border-t-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(sub.id, { isActive: !sub.isActive });
                  }}
                  className={`h-9 w-9 ${sub.isActive ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/30' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`}
                  title={sub.isActive ? "Pause subscription" : "Resume subscription"}
                >
                  {sub.isActive ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete ${sub.name}?`)) {
                      onDelete(sub.id);
                    }
                  }}
                  className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400"
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
