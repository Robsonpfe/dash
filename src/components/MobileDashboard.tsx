import React, { useState } from 'react';
import { 
  Search, 
  RefreshCw, 
  Clock, 
  AlertCircle, 
  User, 
  X,
  Database,
  Building,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { SlaCountdown } from './SlaCountdown';
import { Priority, TicketStatus } from '../types/ticket';

export const MobileDashboard: React.FC = () => {
  const {
    tickets,
    kpis,
    teamMembers,
    setSelectedTicket,
    searchQuery,
    setSearchQuery,
    selectedService,
    setSelectedService,
    availableServices,
    isMovideskSyncing,
    syncMovidesk,
    lastMovideskSync,
    currentFilterPriority,
    setCurrentFilterPriority,
    currentFilterStatus,
    setCurrentFilterStatus
  } = useTickets();

  const [mobileTab, setMobileTab] = useState<'tickets' | 'team' | 'metrics'>('tickets');
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = ticket.id.toLowerCase().includes(q) || String(ticket.movideskId || '').includes(q);
      const matchTitle = ticket.title.toLowerCase().includes(q);
      const matchReq = ticket.requester.name.toLowerCase().includes(q);
      const matchSys = (ticket.serviceFirstLevel || '').toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchReq && !matchSys) return false;
    }

    if (selectedService !== 'all' && ticket.serviceFirstLevel !== selectedService) {
      return false;
    }

    if (currentFilterPriority !== 'all' && ticket.priority !== currentFilterPriority) {
      return false;
    }

    if (currentFilterStatus !== 'all' && ticket.status !== currentFilterStatus) {
      return false;
    }

    return true;
  });

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'P1': return 'text-rose-400 font-bold';
      case 'P2': return 'text-amber-400 font-semibold';
      case 'P3': return 'text-blue-400 font-medium';
      case 'P4': return 'text-slate-400 font-normal';
    }
  };

  const getStatusBadge = (s: TicketStatus, raw?: string) => {
    const label = raw || (s === 'aberto' ? 'Novo' : s === 'em_atendimento' ? 'Em Atendimento' : s === 'pendente' ? 'Aguardando' : 'Resolvido');
    switch (s) {
      case 'aberto':
        return <span className="text-[11px] font-medium text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">{label}</span>;
      case 'em_atendimento':
        return <span className="text-[11px] font-medium text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">{label}</span>;
      case 'pendente':
        return <span className="text-[11px] font-medium text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/60">{label}</span>;
      default:
        return <span className="text-[11px] font-medium text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">{label}</span>;
    }
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-16">
      
      {/* 1. Header do Gestor Mobile */}
      <div className="flex items-center justify-between pt-1 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-base font-bold text-white tracking-tight">
              TechOps Triângulo
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
            <Database className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="truncate">Todos os tickets não resolvidos · Suporte</span>
          </div>
        </div>

        <button
          onClick={() => syncMovidesk(true)}
          disabled={isMovideskSyncing}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 active:bg-slate-800 transition-colors"
          title="Sincronizar com Movidesk"
        >
          <RefreshCw className={`w-4 h-4 text-indigo-400 ${isMovideskSyncing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 2. Três Cards Executivos Limpos (Fila, Em Atendimento, Urgentes) */}
      <div className="grid grid-cols-3 gap-2">
        <div 
          onClick={() => { setCurrentFilterStatus('all'); setCurrentFilterPriority('all'); }}
          className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col active:scale-98 transition-transform cursor-pointer"
        >
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Fila Ativa
          </span>
          <span className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {tickets.length}
          </span>
          <span className="text-[10px] text-indigo-400 mt-0.5">não resolvidos</span>
        </div>

        <div 
          onClick={() => { setCurrentFilterStatus('em_atendimento'); }}
          className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col active:scale-98 transition-transform cursor-pointer"
        >
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Em Atendimento
          </span>
          <span className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {kpis.inProgressCount}
          </span>
          <span className="text-[10px] text-amber-400/80 mt-0.5">com analista</span>
        </div>

        <div 
          onClick={() => { setCurrentFilterPriority('P1'); }}
          className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col active:scale-98 transition-transform cursor-pointer"
        >
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Prioritários
          </span>
          <span className="text-2xl font-bold font-mono text-rose-400 mt-1 tabular-nums">
            {kpis.p1CriticalCount > 0 ? kpis.p1CriticalCount : tickets.filter(t => t.priority === 'P2').length}
          </span>
          <span className="text-[10px] text-rose-400/80 mt-0.5">P1 / P2</span>
        </div>
      </div>

      {/* 3. Seletor de Visão Mobile (Abas de Toque) */}
      <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
        <button
          onClick={() => setMobileTab('tickets')}
          className={`flex-1 min-h-[38px] text-xs font-semibold rounded-lg transition-colors ${
            mobileTab === 'tickets'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Chamados ({filteredTickets.length})
        </button>
        <button
          onClick={() => setMobileTab('team')}
          className={`flex-1 min-h-[38px] text-xs font-semibold rounded-lg transition-colors ${
            mobileTab === 'team'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Técnicos ({teamMembers.length})
        </button>
        <button
          onClick={() => setMobileTab('metrics')}
          className={`flex-1 min-h-[38px] text-xs font-semibold rounded-lg transition-colors ${
            mobileTab === 'metrics'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Métricas
        </button>
      </div>

      {/* ABA 1: LISTA LIMPA DE CHAMADOS */}
      {mobileTab === 'tickets' && (
        <div className="space-y-3">
          
          {/* Barra de Busca + Filtros */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por ID, assunto, loja ou técnico..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-h-[44px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFiltersSheet(!showFiltersSheet)}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border transition-colors ${
                selectedService !== 'all' || currentFilterPriority !== 'all' || currentFilterStatus !== 'all'
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
              title="Filtros rápidos"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Carrossel de Serviços mais frequentes (Scroll horizontal touch) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedService('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors min-h-[36px] ${
                selectedService === 'all'
                  ? 'bg-white text-slate-950 font-semibold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}
            >
              Todos Serviços
            </button>
            {availableServices.slice(0, 8).map((serv) => (
              <button
                key={serv}
                onClick={() => setSelectedService(serv)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors min-h-[36px] ${
                  selectedService === serv
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400'
                }`}
              >
                {serv}
              </button>
            ))}
          </div>

          {/* Filtros em Dropdown se aberto */}
          {showFiltersSheet && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Filtros Detalhados</span>
                <button
                  onClick={() => {
                    setSelectedService('all');
                    setCurrentFilterPriority('all');
                    setCurrentFilterStatus('all');
                    setSearchQuery('');
                  }}
                  className="text-rose-400 text-[11px]"
                >
                  Limpar todos
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Status</label>
                  <select
                    value={currentFilterStatus}
                    onChange={(e) => setCurrentFilterStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs"
                  >
                    <option value="all">Todos Status</option>
                    <option value="aberto">Novos</option>
                    <option value="em_atendimento">Em Atendimento</option>
                    <option value="pendente">Aguardando</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Urgência</label>
                  <select
                    value={currentFilterPriority}
                    onChange={(e) => setCurrentFilterPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs"
                  >
                    <option value="all">Todas</option>
                    <option value="P1">Crítica / P1</option>
                    <option value="P2">Alta / P2</option>
                    <option value="P3">Média / P3</option>
                    <option value="P4">Baixa / P4</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Chamados Mobile (Cards Limpos e Intuitivos) */}
          <div className="space-y-2.5">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-slate-200">Nenhum chamado encontrado</h3>
                <p className="text-xs text-slate-400 mt-1">Ajuste os filtros de busca para ver outros chamados da fila.</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl active:bg-slate-850 active:border-indigo-500 transition-all cursor-pointer flex flex-col gap-2 shadow-xs"
                >
                  {/* Topo do card: ID, Status, SLA */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-400 text-xs">
                        #{ticket.movideskId || ticket.id.replace('TK-', '')}
                      </span>
                      {getStatusBadge(ticket.status, ticket.rawStatus)}
                      <span className={getPriorityBadge(ticket.priority)}>
                        {ticket.urgency || ticket.priority}
                      </span>
                    </div>

                    <SlaCountdown deadline={ticket.slaDeadline} status={ticket.status} compact />
                  </div>

                  {/* Assunto / Título com boa leitura */}
                  <h3 className="text-sm font-semibold text-slate-100 line-clamp-2 leading-snug">
                    {ticket.title}
                  </h3>

                  {/* Rodapé do card: Solicitante / Loja e Técnico */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5 truncate max-w-[190px]">
                      <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate text-slate-300 font-medium">
                        {ticket.serviceFirstLevel || 'TI Suporte'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-300 shrink-0 text-[11px]">
                      {ticket.assignee ? (
                        <span className="text-indigo-300 font-medium">{ticket.assignee.name.split(' ')[0]}</span>
                      ) : (
                        <span className="text-amber-400 font-medium">Aguardando Técnico</span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ABA 2: EQUIPE DO SUPORTE (CARDS LIMPOS) */}
      {mobileTab === 'team' && (
        <div className="space-y-2.5">
          <div className="text-xs text-slate-400 px-1">
            Técnicos atuando nos chamados da Fila do Suporte TI:
          </div>

          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full object-cover border-2 border-slate-700"
                />
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {member.name}
                  </h3>
                  <p className="text-xs text-slate-400">{member.role}</p>
                </div>
              </div>

              <div className="text-right flex items-center gap-3 shrink-0">
                <div className="text-center">
                  <div className="text-base font-bold font-mono text-indigo-400 tabular-nums">
                    {member.activeTickets}
                  </div>
                  <div className="text-[10px] text-slate-400">ativos</div>
                </div>
                <div className="text-center pl-3 border-l border-slate-800">
                  <div className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                    {member.resolvedToday}
                  </div>
                  <div className="text-[10px] text-emerald-400/80">resolvidos</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ABA 3: MÉTRICAS & INDICADORES RÁPIDOS */}
      {mobileTab === 'metrics' && (
        <div className="space-y-3">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Conformidade da Fila (SLA)
            </h3>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold font-mono text-emerald-400">
                {kpis.slaCompliancePercent}%
              </span>
              <span className="text-xs text-slate-400">Meta: 95%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${kpis.slaCompliancePercent}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Serviços com Maior Demanda
            </h3>
            <div className="space-y-2 pt-1 text-xs">
              {availableServices.slice(0, 5).map((serv) => {
                const count = tickets.filter(t => t.serviceFirstLevel === serv).length;
                return (
                  <div key={serv} className="flex items-center justify-between">
                    <span className="text-slate-300">{serv}</span>
                    <span className="font-mono text-slate-400">{count} chamados</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
