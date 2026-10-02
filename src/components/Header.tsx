import React from 'react';
import { 
  RefreshCw, 
  Plus, 
  Smartphone, 
  Monitor, 
  CheckCircle,
  Database
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    tickets,
    viewMode,
    setViewMode,
    setIsNewTicketModalOpen,
    kpis,
    isMovideskConnected,
    isMovideskSyncing,
    lastMovideskSync,
    movideskQueueName,
    syncMovidesk
  } = useTickets();

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Zone 1: Single text element wordmark + Movidesk Queue Tag */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <a 
              href="#top" 
              onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
              className="text-base sm:text-lg font-bold tracking-tight text-white hover:text-slate-200 transition-colors"
            >
              TechOps Triangulo
            </a>
          </div>

          {/* Movidesk Live Sync Indicator */}
          <div className="hidden sm:flex items-center gap-2 text-xs pl-3 border-l border-slate-800">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-slate-200">Movidesk:</span>
              <span className="text-emerald-400 font-medium">{movideskQueueName}</span>
              <span className="text-slate-600">·</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {lastMovideskSync ? `Atualizado ${lastMovideskSync}` : 'Conectando...'}
              </span>
            </div>

            <button
              onClick={() => syncMovidesk(true)}
              disabled={isMovideskSyncing}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-850 rounded transition-colors disabled:opacity-50"
              title="Sincronizar chamados agora do Movidesk"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isMovideskSyncing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Zone 2: Navigation Links (single line, clean text) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'text-white font-semibold border-b-2 border-indigo-500 pb-0.5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tickets'
                ? 'text-white font-semibold border-b-2 border-indigo-500 pb-0.5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Fila Suporte</span>
            {tickets.length > 0 && (
              <span className="text-[11px] font-mono px-1.5 py-0.2 bg-slate-800 text-indigo-300 rounded font-semibold">
                {tickets.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`transition-colors whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'text-white font-semibold border-b-2 border-indigo-500 pb-0.5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Métricas & SLAs
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`transition-colors whitespace-nowrap ${
              activeTab === 'team'
                ? 'text-white font-semibold border-b-2 border-indigo-500 pb-0.5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Técnicos Suporte
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Device toggle (Web vs Mobile Device Simulator) */}
          <div className="hidden sm:flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode('responsive')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'responsive'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Visualização ampla de monitor Desktop"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Web</span>
            </button>
            <button
              onClick={() => setViewMode('mobile_preview')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'mobile_preview'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Simular visualização em smartphone / dispositivo móvel"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>

          {/* Sync Button on mobile */}
          <button
            onClick={() => syncMovidesk(true)}
            disabled={isMovideskSyncing}
            className="sm:hidden flex items-center p-1.5 text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-lg"
            title="Atualizar chamados"
          >
            <RefreshCw className={`w-4 h-4 ${isMovideskSyncing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          {/* Primary Action Button */}
          <button
            onClick={() => setIsNewTicketModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Chamado</span>
          </button>
        </div>

      </div>
    </header>
  );
};
