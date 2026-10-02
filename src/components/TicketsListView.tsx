import React from 'react';
import { 
  Search, 
  Filter, 
  LayoutList, 
  Kanban, 
  X,
  AlertCircle,
  Database,
  RefreshCw
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { SlaCountdown } from './SlaCountdown';
import { Priority, TicketStatus } from '../types/ticket';

export const TicketsListView: React.FC = () => {
  const {
    tickets,
    setSelectedTicket,
    searchQuery,
    setSearchQuery,
    currentFilterPriority,
    setCurrentFilterPriority,
    currentFilterStatus,
    setCurrentFilterStatus,
    ticketViewLayout,
    setTicketViewLayout,
    setIsNewTicketModalOpen,
    availableServices,
    selectedService,
    setSelectedService,
    movideskQueueName,
    isMovideskSyncing,
    syncMovidesk
  } = useTickets();

  // Filtering logic
  const filteredTickets = tickets.filter((ticket) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = ticket.id.toLowerCase().includes(q) || String(ticket.movideskId || '').includes(q);
      const matchTitle = ticket.title.toLowerCase().includes(q);
      const matchDesc = ticket.description.toLowerCase().includes(q);
      const matchReq = ticket.requester.name.toLowerCase().includes(q);
      const matchSys = (ticket.systemAffected || ticket.serviceFirstLevel || '').toLowerCase().includes(q);
      const matchTags = ticket.tags.some(t => t.toLowerCase().includes(q));
      if (!matchId && !matchTitle && !matchDesc && !matchReq && !matchSys && !matchTags) {
        return false;
      }
    }

    // Specific Movidesk service filter
    if (selectedService !== 'all' && ticket.serviceFirstLevel !== selectedService) {
      return false;
    }

    // Priority filter
    if (currentFilterPriority !== 'all' && ticket.priority !== currentFilterPriority) {
      return false;
    }

    // Status filter
    if (currentFilterStatus !== 'all' && ticket.status !== currentFilterStatus) {
      return false;
    }

    return true;
  });

  const getPriorityStyle = (p: Priority) => {
    switch (p) {
      case 'P1': return 'text-rose-400 font-bold';
      case 'P2': return 'text-amber-400 font-semibold';
      case 'P3': return 'text-blue-400 font-medium';
      case 'P4': return 'text-slate-400 font-normal';
    }
  };

  const getStatusBadge = (s: TicketStatus) => {
    switch (s) {
      case 'aberto':
        return 'text-indigo-400 font-semibold';
      case 'em_atendimento':
        return 'text-amber-400 font-semibold';
      case 'pendente':
        return 'text-purple-400 font-semibold';
      case 'resolvido':
        return 'text-emerald-400 font-medium';
      case 'fechado':
        return 'text-slate-400 font-normal';
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Banner indicating the queue */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2.5">
          <Database className="w-4 h-4 text-indigo-400" />
          <div className="text-xs">
            <span className="text-slate-400">Exibindo exclusivamente: </span>
            <strong className="text-white">{movideskQueueName}</strong>
            <span className="text-slate-500 ml-1.5 font-mono">({tickets.length} chamados importados)</span>
          </div>
        </div>

        <button
          onClick={() => syncMovidesk(true)}
          disabled={isMovideskSyncing}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isMovideskSyncing ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Sincronizar Fila</span>
        </button>
      </div>

      {/* Top Filter & Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 space-y-3">
        
        {/* Row 1: Search input + View Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por ID (ex: 41939), assunto, serviço, loja ou solicitante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode: List vs Kanban */}
            <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
              <button
                onClick={() => setTicketViewLayout('list')}
                className={`p-1.5 rounded transition-colors ${
                  ticketViewLayout === 'list'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Visualização em Lista / Tabela"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTicketViewLayout('kanban')}
                className={`p-1.5 rounded transition-colors ${
                  ticketViewLayout === 'kanban'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Visualização em Quadro Kanban"
              >
                <Kanban className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Segmented Interactive Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros da Fila:</span>
          </div>

          {/* Movidesk Service selector */}
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 max-w-[200px]"
          >
            <option value="all">Todos os Serviços TI ({availableServices.length})</option>
            {availableServices.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Priority selector */}
          <select
            value={currentFilterPriority}
            onChange={(e) => setCurrentFilterPriority(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todas Urgências</option>
            <option value="P1">P1 - Crítica / Urgente</option>
            <option value="P2">P2 - Alta</option>
            <option value="P3">P3 - Média</option>
            <option value="P4">P4 - Baixa</option>
          </select>

          {/* Status selector */}
          <select
            value={currentFilterStatus}
            onChange={(e) => setCurrentFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todos os Status</option>
            <option value="aberto">Novo (Triagem)</option>
            <option value="em_atendimento">Em Atendimento</option>
            <option value="pendente">Aguardando / Pendente</option>
            <option value="resolvido">Resolvido</option>
            <option value="fechado">Fechado</option>
          </select>

          {(selectedService !== 'all' || currentFilterPriority !== 'all' || currentFilterStatus !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedService('all');
                setCurrentFilterPriority('all');
                setCurrentFilterStatus('all');
                setSearchQuery('');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 ml-auto flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>

      </div>

      {/* Ticket Counter bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Mostrando <strong className="text-white font-mono">{filteredTickets.length}</strong> de <span className="font-mono">{tickets.length}</span> chamados do suporte
        </span>
        <span className="text-slate-500 hidden sm:inline">
          Clique no chamado para ver histórico completo do Movidesk
        </span>
      </div>

      {/* List / Table Content */}
      {filteredTickets.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-xl">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-200">Nenhum chamado encontrado</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Não há chamados com os filtros selecionados na fila do suporte.
          </p>
          <button
            onClick={() => {
              setSelectedService('all');
              setCurrentFilterPriority('all');
              setCurrentFilterStatus('all');
              setSearchQuery('');
            }}
            className="mt-4 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Desktop High-Density Table View */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Urgência</th>
                  <th className="py-3 px-4">Assunto & Serviço</th>
                  <th className="py-3 px-4">Solicitante / Loja</th>
                  <th className="py-3 px-4">Status Movidesk</th>
                  <th className="py-3 px-4">Técnico</th>
                  <th className="py-3 px-4 text-right">Prazo SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-400 whitespace-nowrap">
                      #{ticket.movideskId || ticket.id.replace('TK-', '')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={getPriorityStyle(ticket.priority)}>
                        {ticket.urgency || ticket.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-slate-200 line-clamp-1 hover:text-white">
                        {ticket.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        Serviço: <span className="text-slate-300 font-medium">{ticket.serviceFirstLevel || 'Geral'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      <div className="font-medium truncate max-w-[150px]">{ticket.requester.name}</div>
                      <div className="text-[10px] text-slate-500">{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={getStatusBadge(ticket.status)}>
                        {ticket.rawStatus || ticket.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {ticket.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <img
                            src={ticket.assignee.avatar}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="font-medium">{ticket.assignee.name.split(' ')[0]} {ticket.assignee.name.split(' ')[1] || ''}</span>
                        </div>
                      ) : (
                        <span className="text-amber-400/90 text-[11px]">Aguardando Técnico</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <SlaCountdown deadline={ticket.slaDeadline} status={ticket.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Touch Cards View (Touch targets >= 44px) */}
          <div className="md:hidden space-y-2.5">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl active:bg-slate-800/80 transition-colors cursor-pointer flex flex-col gap-2 min-h-[56px]"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-indigo-400">
                      #{ticket.movideskId || ticket.id.replace('TK-', '')}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className={getPriorityStyle(ticket.priority)}>
                      {ticket.urgency || ticket.priority}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className={getStatusBadge(ticket.status)}>
                      {ticket.rawStatus || ticket.status}
                    </span>
                  </div>
                  <SlaCountdown deadline={ticket.slaDeadline} status={ticket.status} compact />
                </div>

                <h4 className="text-sm font-medium text-slate-100 line-clamp-2 leading-snug">
                  {ticket.title}
                </h4>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1.5 border-t border-slate-800/60">
                  <span className="truncate max-w-[170px] text-slate-300">
                    {ticket.serviceFirstLevel || 'TI'}
                  </span>
                  <span className="shrink-0 text-slate-300 font-mono text-[11px]">
                    {ticket.assignee ? ticket.assignee.name.split(' ')[0] : 'Sem técnico'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
