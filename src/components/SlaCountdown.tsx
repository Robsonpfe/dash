import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TicketStatus } from '../types/ticket';

interface SlaCountdownProps {
  deadline: string; // ISO string
  status: TicketStatus;
  compact?: boolean;
}

export const SlaCountdown: React.FC<SlaCountdownProps> = ({ deadline, status, compact = false }) => {
  const [timeLeft, setTimeLeft] = useState<{
    minutes: number;
    seconds: number;
    isBreached: boolean;
    label: string;
  }>({ minutes: 0, seconds: 0, isBreached: false, label: '' });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const target = new Date(deadline).getTime();
      const diffMs = target - now;

      if (status === 'resolvido' || status === 'fechado') {
        setTimeLeft({
          minutes: 0,
          seconds: 0,
          isBreached: false,
          label: 'Concluído',
        });
        return;
      }

      if (diffMs <= 0) {
        const absDiff = Math.abs(diffMs);
        const mins = Math.floor(absDiff / 60000);
        const secs = Math.floor((absDiff % 60000) / 1000);
        setTimeLeft({
          minutes: mins,
          seconds: secs,
          isBreached: true,
          label: `Estourado há ${mins}m ${secs}s`,
        });
      } else {
        const mins = Math.floor(diffMs / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        setTimeLeft({
          minutes: mins,
          seconds: secs,
          isBreached: false,
          label: `${mins}m ${secs.toString().padStart(2, '0')}s restantes`,
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [deadline, status]);

  if (status === 'resolvido' || status === 'fechado') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>SLA Atendido</span>
      </span>
    );
  }

  if (timeLeft.isBreached) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 ${compact ? '' : 'bg-rose-950/40 border border-rose-800/60 px-2 py-0.5 rounded'}`}>
        <AlertCircle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
        <span className="tabular-nums">{timeLeft.label}</span>
      </span>
    );
  }

  // Warning when less than 30 minutes left
  const isWarning = timeLeft.minutes < 30;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium tabular-nums ${
        isWarning
          ? `text-amber-400 ${compact ? '' : 'bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded'}`
          : 'text-slate-300'
      }`}
    >
      {isWarning ? (
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-slate-400" />
      )}
      <span>{timeLeft.label}</span>
    </span>
  );
};
