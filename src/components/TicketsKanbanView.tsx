import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  AlertCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { SlaCountdown } from './SlaCountdown';
import { Ticket, TicketStatus, Priority } from '../types/ticket';

export const TicketsKanbanView: React.FC = () => {
  const { tickets, setSelectedTicket, updateTicketStatus, currentFilterSquad, currentFilterPriority } = useTickets();

  const columns: { id: TicketStatus; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'aberto', label: 'Triagem / Abertos', icon: AlertCircle, color: 'text-indigo-400' },
    { id: 'em_atendimento', label: 'Em Atendimento', icon: Clock, color: 'text-amber-400' },
    { id: 'pendente', label: 'Pendente / Aguardando', icon: HelpCircle, color: 'text-purple-400' },
    { id: 'resolvido', label: 'Resolvidos', icon: CheckCircle2, color: 'text-emerald-400' },
  ];

  const getPriorityStyle = (p: Priority) => {
    switch (p) {
      case 'P1': return 'text-rose-400 font-bold';
      case 'P2': return 'text-amber-400 font-semibold';
      case 'P3': return 'text-blue-400 font-medium';
      case 'P4': return 'text-slate-400 font-normal';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (currentFilterSquad !== 'all' && ticket.squad !== currentFilterSquad) return false;
    if (currentFilterPriority !== 'all' && ticket.priority !== currentFilterPriority) return false;
    return true;
  });

  const handleMove = (e: React.MouseEvent, ticketId: string, targetStatus: TicketStatus) => {
    e.stopPropagation();
    updateTicketStatus(ticketId, targetStatus);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnTickets = filteredTickets.filter(
          (t) => t.status === column.id || (column.id === 'resolvido' && t.status === 'fechado')
        );
        const Icon = column.icon;

        return (
          <div
            key={column.id}
            className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 flex flex-col min-w-[280px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${column.color}`} />
                <h3 className="text-xs font-semibold text-slate-200">
                  {column.label}
                </h3>
              </div>
              <span className="text-xs font-mono font-medium px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                {columnTickets.length}
              </span>
            </div>

            {/* Ticket Cards */}
            <div className="space-y-2.5 flex-1 min-h-[200px]">
              {columnTickets.length === 0 ? (
                <div className="h-28 border border-dashed border-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-500">
                  Nenhum chamado nesta etapa
                </div>
              ) : (
                columnTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg hover:border-slate-700 active:scale-[0.99] transition-all cursor-pointer flex flex-col gap-2 shadow-xs group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-semibold text-indigo-400">{ticket.id}</span>
                        <span className="text-slate-600">·</span>
                        <span className={getPriorityStyle(ticket.priority)}>{ticket.priority}</span>
                      </div>
                      <SlaCountdown deadline={ticket.slaDeadline} status={ticket.status} compact />
                    </div>

                    <h4 className="text-xs font-medium text-slate-100 line-clamp-2 leading-relaxed">
                      {ticket.title}
                    </h4>

                    <div className="text-[11px] text-slate-400 truncate">
                      {ticket.squad}
                    </div>

                    {/* Bottom controls & Quick transition */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <div className="truncate max-w-[120px]">
                        {ticket.assignee ? (
                          <span className="text-slate-300">{ticket.assignee.name.split(' ')[0]}</span>
                        ) : (
                          <span className="text-amber-400">Sem analista</span>
                        )}
                      </div>

                      {/* Quick Move controls */}
                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                        {column.id !== 'aberto' && (
                          <button
                            onClick={(e) => {
                              const prevStatus: TicketStatus = 
                                column.id === 'resolvido' ? 'em_atendimento' :
                                column.id === 'pendente' ? 'em_atendimento' : 'aberto';
                              handleMove(e, ticket.id, prevStatus);
                            }}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                            title="Voltar etapa"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {column.id !== 'resolvido' && (
                          <button
                            onClick={(e) => {
                              const nextStatus: TicketStatus = 
                                column.id === 'aberto' ? 'em_atendimento' :
                                column.id === 'em_atendimento' ? 'resolvido' : 'resolvido';
                              handleMove(e, ticket.id, nextStatus);
                            }}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                            title="Avançar etapa"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
