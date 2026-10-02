import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

export const ToastNotification: React.FC = () => {
  const { toast, dismissToast, setSelectedTicket, tickets } = useTickets();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  const isP1 = toast.type === 'p1_alert';
  const isResolved = toast.type === 'ticket_resolved';

  const handleClick = () => {
    // If message contains TK-xxxx, open it
    const match = toast.message.match(/TK-\d+/);
    if (match) {
      const ticket = tickets.find((t) => t.id === match[0]);
      if (ticket) setSelectedTicket(ticket);
    }
    dismissToast();
  };

  return (
    <div className="fixed top-16 right-4 sm:right-6 z-50 max-w-sm w-full animate-in slide-in-from-top duration-200">
      <div
        className={`p-3.5 rounded-xl border shadow-xl backdrop-blur-md flex items-start gap-3 transition-all ${
          isP1
            ? 'bg-rose-950/90 border-rose-800 text-rose-100'
            : isResolved
            ? 'bg-emerald-950/90 border-emerald-800 text-emerald-100'
            : 'bg-slate-900/95 border-slate-800 text-slate-100'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {isP1 ? (
            <AlertCircle className="w-5 h-5 text-rose-400 animate-pulse" />
          ) : isResolved ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <Info className="w-5 h-5 text-indigo-400" />
          )}
        </div>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={handleClick}>
          <div className="text-xs font-bold tracking-tight mb-0.5 flex items-center justify-between">
            <span>{toast.title}</span>
            <span className="text-[10px] opacity-75 font-mono">agora</span>
          </div>
          <div className="text-xs opacity-90 line-clamp-2 leading-relaxed">
            {toast.message}
          </div>
        </div>

        <button
          onClick={dismissToast}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
