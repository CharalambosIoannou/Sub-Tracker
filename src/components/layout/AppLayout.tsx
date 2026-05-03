import { useState, ReactNode } from 'react';
import { Home, List, PieChart, Plus, CalendarClock, Moon, Sun } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface AppLayoutProps {
  children: ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export function AppLayout({ children, currentTab, onTabChange, onAddClick, isDarkMode, onThemeToggle }: AppLayoutProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'upcoming', label: 'Upcoming', icon: CalendarClock },
    { id: 'subscriptions', label: 'Subscriptions', icon: List },
    { id: 'insights', label: 'Insights', icon: PieChart },
  ];

  return (
    <div className="flex h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 md:flex transition-colors">
        <div className="flex h-16 items-center justify-between px-6">
          <span className="text-xl font-bold tracking-tighter text-indigo-600 dark:text-indigo-400">SubTrack</span>
          <button onClick={onThemeToggle} className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
        
        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="shrink-0 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:hidden transition-colors">
          <span className="text-lg font-bold tracking-tighter text-indigo-600 dark:text-indigo-400">SubTrack</span>
          <button onClick={onThemeToggle} className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-5xl pb-20">
            {children}
          </div>
        </div>
        
        {/* FAB for bottom right */}
        <div className="absolute bottom-20 md:bottom-8 right-4 md:right-8 z-50">
          <button 
            onClick={onAddClick}
            className="flex items-center justify-center w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
            aria-label="Add Subscription"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 md:hidden pb-safe transition-colors z-40 relative">
          <div className="flex h-16 items-center justify-around px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors",
                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </main>
    </div>
  );
}
