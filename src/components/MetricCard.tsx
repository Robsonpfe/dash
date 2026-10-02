import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    label: string;
    positive?: boolean;
  };
  highlight?: 'normal' | 'warning' | 'danger' | 'success';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  highlight = 'normal',
}) => {
  const getHighlightBorder = () => {
    switch (highlight) {
      case 'danger':
        return 'border-rose-500/50 bg-rose-950/20';
      case 'warning':
        return 'border-amber-500/50 bg-amber-950/20';
      case 'success':
        return 'border-emerald-500/50 bg-emerald-950/20';
      default:
        return 'border-slate-800/80 bg-slate-900/60';
    }
  };

  const getIconColor = () => {
    switch (highlight) {
      case 'danger':
        return 'text-rose-400 bg-rose-900/40';
      case 'warning':
        return 'text-amber-400 bg-amber-900/40';
      case 'success':
        return 'text-emerald-400 bg-emerald-900/40';
      default:
        return 'text-indigo-400 bg-indigo-950/60';
    }
  };

  return (
    <div
      className={`p-4 rounded-xl border ${getHighlightBorder()} flex flex-col justify-between transition-colors`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
          {title}
        </span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconColor()}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono tabular-nums">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.positive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.label}
          </span>
        )}
      </div>

      <div className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
        <span>{subtext}</span>
      </div>
    </div>
  );
};
