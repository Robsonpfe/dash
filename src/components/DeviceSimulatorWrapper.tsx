import React from 'react';
import { Smartphone, Monitor, Wifi, Battery } from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { MobileDashboard } from './MobileDashboard';

export const DeviceSimulatorWrapper: React.FC = () => {
  const { setViewMode } = useTickets();

  return (
    <div className="min-h-screen bg-slate-900/90 py-6 sm:py-8 px-2 sm:px-4 flex flex-col items-center justify-center">
      {/* Device Toolbar */}
      <div className="mb-4 flex items-center justify-between gap-4 max-w-[400px] w-full px-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Smartphone className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold">Simulador Mobile TI (390 × 844 px)</span>
        </div>

        <button
          onClick={() => setViewMode('responsive')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
          title="Voltar ao modo Web Desktop"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Voltar para Web</span>
        </button>
      </div>

      {/* Realistic Smartphone Frame */}
      <div className="relative w-full max-w-[395px] h-[830px] bg-slate-950 rounded-[48px] border-[10px] border-slate-800 shadow-2xl shadow-indigo-950/40 overflow-hidden flex flex-col ring-1 ring-slate-700">
        
        {/* Smartphone Hardware Notch / Island */}
        <div className="w-full bg-slate-950 px-6 pt-3 pb-2 flex items-center justify-between text-[11px] text-slate-400 z-50 shrink-0 select-none">
          <span className="font-semibold text-slate-200 font-mono">09:41</span>
          
          {/* Dynamic Island */}
          <div className="w-24 h-4 bg-black rounded-full mx-auto -mt-1 flex items-center justify-end pr-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500/80 animate-pulse" />
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Smartphone Display Viewport (Scrollable container) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col relative px-3 py-1">
          <MobileDashboard />
        </div>

        {/* Smartphone Bottom Home Indicator Bar */}
        <div className="w-full bg-slate-950 py-2 flex items-center justify-center z-50 shrink-0">
          <div className="w-32 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>

      <div className="mt-3 text-center text-xs text-slate-400 max-w-sm">
        Visão otimizada e intuitiva para smartphone, refletindo a fila não resolvida do suporte Movidesk.
      </div>
    </div>
  );
};
