import { Crown } from 'lucide-react';

interface ProBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ProBadge({ size = 'sm', showLabel = false }: ProBadgeProps) {
  const sizes = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <div className={`inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full font-bold ${sizes[size]}`}>
      <Crown className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} />
      {showLabel && <span>PRO</span>}
    </div>
  );
}