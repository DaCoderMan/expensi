import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-border/60 p-6 shadow-sm ${
        hover ? 'hover:shadow-md hover:border-border transition-all cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
