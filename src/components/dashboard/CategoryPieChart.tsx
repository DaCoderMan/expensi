'use client';

import { useExpenses } from '@/context/ExpenseContext';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function CategoryPieChart() {
  const { expensesByCategory, totalSpending } = useExpenses();

  const data = expensesByCategory.map((item) => ({
    name: CATEGORY_LABELS[item.category],
    value: Math.round(item.total * 100) / 100,
    color: CATEGORY_COLORS[item.category],
    percentage: ((item.total / totalSpending) * 100).toFixed(1),
  }));

  if (data.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-4">Spending by Category</h3>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-40 h-40 sm:w-48 sm:h-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={68}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `$${Number(value).toFixed(2)}`}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
                  fontSize: '13px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full sm:flex-1 grid grid-cols-2 sm:grid-cols-1 gap-2 overflow-y-auto max-h-48">
          {data.slice(0, 6).map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-foreground truncate text-xs sm:text-sm">{item.name}</span>
              </div>
              <span className="text-muted font-medium tabular-nums ml-2">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
