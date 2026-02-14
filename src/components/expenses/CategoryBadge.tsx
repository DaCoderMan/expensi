import { ExpenseCategory } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/constants';

interface CategoryBadgeProps {
  category: ExpenseCategory;
  size?: 'sm' | 'md';
}

export default function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const color = CATEGORY_COLORS[category];
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg ${
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
      }`}
      style={{
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      {CATEGORY_LABELS[category]}
    </span>
  );
}
