import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Subscription } from '../types';
import { calculateTotalMonthlySpend, getMonthlyEquivalent } from '../lib/calculations';
import { formatCurrency } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface InsightsProps {
  subscriptions: Subscription[];
}

export function Insights({ subscriptions }: InsightsProps) {
  const activeSubs = subscriptions.filter(s => s.isActive);
  const inactiveSubs = subscriptions.filter(s => !s.isActive);
  
  const totalMonthly = calculateTotalMonthlySpend(activeSubs);
  const dailyCost = totalMonthly / 30.436875;
  const yearlyCost = totalMonthly * 12;
  
  const totalSavedMonthly = inactiveSubs.reduce((total, sub) => total + getMonthlyEquivalent(sub.amount, sub.billingCycle), 0);
  const totalSavedYearly = totalSavedMonthly * 12;

  const mostExpensive = [...activeSubs].sort((a, b) => 
    getMonthlyEquivalent(b.amount, b.billingCycle) - getMonthlyEquivalent(a.amount, a.billingCycle)
  )[0];

  const categoryData = useMemo(() => {
    const map = new Map<string, { name: string; value: number; color: string }>();
    
    activeSubs.forEach(sub => {
      const monthlyAmount = getMonthlyEquivalent(sub.amount, sub.billingCycle);
      if (map.has(sub.category)) {
        const existing = map.get(sub.category)!;
        existing.value += monthlyAmount;
      } else {
        map.set(sub.category, { 
          name: sub.category, 
          value: monthlyAmount, 
          color: sub.color || '#94a3b8' 
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, [activeSubs]);

  const cycleData = useMemo(() => {
    let monthly = 0;
    let yearly = 0;
    let weekly = 0;
    
    activeSubs.forEach(sub => {
      const equiv = getMonthlyEquivalent(sub.amount, sub.billingCycle);
      if (sub.billingCycle === 'monthly') monthly += equiv;
      else if (sub.billingCycle === 'yearly') yearly += equiv;
      else if (sub.billingCycle === 'weekly') weekly += equiv;
    });

    return [
      { name: 'Monthly Plans', value: monthly, fill: '#4f46e5' },
      { name: 'Yearly Plans', value: yearly, fill: '#14b8a6' },
      { name: 'Weekly Plans', value: weekly, fill: '#f59e0b' },
    ].filter(x => x.value > 0);
  }, [activeSubs]);

  const savingsData = useMemo(() => {
    return [
      { name: 'Monthly Spend', value: totalMonthly, fill: '#ef4444' },
      { name: 'Monthly Saved', value: totalSavedMonthly, fill: '#10b981' }
    ];
  }, [totalMonthly, totalSavedMonthly]);

  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full">
        <p className="text-slate-500">Need subscriptions to generate insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-8">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Your Insights</h1>
        <p className="text-slate-500 mt-1">Deep dive into your ongoing recurring costs.</p>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Daily Burn</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(dailyCost)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Yearly Run Rate</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(yearlyCost)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Active Subs</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{activeSubs.length}</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1 border-indigo-100 bg-indigo-50/50">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-indigo-500 tracking-wide uppercase">Highest Expense</p>
            <p className="mt-1 truncate font-bold text-slate-900">{mostExpensive?.name || 'N/A'}</p>
            <p className="text-sm font-medium text-slate-600 mt-0.5">
              {mostExpensive ? `${formatCurrency(getMonthlyEquivalent(mostExpensive.amount, mostExpensive.billingCycle))}/mo` : '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {inactiveSubs.length > 0 && (
        <Card className="mb-6 mb-6 border-emerald-100 bg-emerald-50/30">
          <CardHeader>
            <CardTitle className="text-emerald-800">Savings from Inactive Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-sm text-slate-600 mb-4">
                  By pausing or canceling <strong>{inactiveSubs.length}</strong> subscriptions, you are saving money every month. Here's a breakdown of your savings.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-emerald-600 tracking-wide uppercase">Monthly Savings</p>
                    <p className="mt-1 text-3xl font-extrabold text-emerald-700">{formatCurrency(totalSavedMonthly)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-600 tracking-wide uppercase">Yearly Savings</p>
                    <p className="mt-1 text-3xl font-extrabold text-emerald-700">{formatCurrency(totalSavedYearly)}</p>
                  </div>
                </div>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={savingsData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `€${val}`} />
                    <YAxis type="category" dataKey="name" axisLine={false} width={100} tickLine={false} tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      formatter={(value: number) => [formatCurrency(value), '']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                      {savingsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend by Category Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spend by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 space-y-3">
              {categoryData.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(item.value)}/mo</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Spend by Billing Cycle Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spend by Billing Cycle (Monthly Equiv)</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cycleData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `€${val}`} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569' }} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    formatter={(value: number) => [formatCurrency(value), 'Equivalent/mo']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {cycleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
             </div>
             <p className="text-sm mt-6 text-slate-500 text-center">
               This visualizes how your total cost distributes across cycle types, converted to a monthly scale.
             </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
