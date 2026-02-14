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
      <div className="flex items-center gap-4">
        <div className="w-48 h-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
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
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  fontSize: '13px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto max-h-48">
          {data.slice(0, 6).map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-foreground truncate">{item.name}</span>
              </div>
              <span className="text-muted font-medium tabular-nums">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
