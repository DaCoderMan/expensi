'use client';

import { useExpenses } from '@/context/ExpenseContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MonthlyBarChart() {
  const { monthlyTotals } = useExpenses();

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formatMonth = (ym: string) => {
    const [y, m] = ym.split('-');
    const idx = parseInt(m || '1', 10) - 1;
    return `${MONTH_NAMES[idx] || m} ${y}`;
  };

  const data = monthlyTotals.slice(-6).map((item) => ({
    month: item.month,
    monthLabel: formatMonth(item.month),
    total: Math.round(item.total * 100) / 100,
  }));

  if (data.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Spending</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" vertical={false} />
            <XAxis
              dataKey="monthLabel"
              tick={{ fontSize: 12, fill: '#718096' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#718096' }}
              tickFormatter={(v) => `$${v}`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Spent']}
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
                fontSize: '13px',
              }}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="#0891b2" />
              </linearGradient>
            </defs>
            <Bar dataKey="total" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
