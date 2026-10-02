import React from 'react';
import { Users, Mail, CheckCircle2, Clock } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

export const TeamView: React.FC = () => {
  const { teamMembers, tickets, setSelectedTicket, setActiveTab, setCurrentFilterSquad } = useTickets();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return { label: 'Disponível', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60' };
      case 'em_atendimento':
        return { label: 'Em Atendimento', color: 'text-amber-400 bg-amber-950/60 border-amber-800/60' };
      case 'ocupado':
        return { label: 'Sobrecarga', color: 'text-rose-400 bg-rose-950/60 border-rose-800/60' };
      case 'plantao':
        return { label: 'Plantão Sobreaviso', color: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/60' };
      default:
        return { label: 'Offline', color: 'text-slate-400 bg-slate-900 border-slate-800' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <span>Equipe do Suporte TI & Desempenho Técnico (Movidesk)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Técnicos e analistas da fila do Suporte TI com contagem de chamados em atendimento e concluídos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map((member) => {
          const statusInfo = getStatusBadge(member.status);
          const memberTickets = tickets.filter(
            t => t.assignee?.id === member.id && t.status !== 'resolvido' && t.status !== 'fechado'
          );

          return (
            <div
              key={member.id}
              className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                {/* Header: Photo + Name + Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover border-2 border-slate-700"
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-white leading-tight">
                        {member.name}
                      </h3>
                      <p className="text-xs text-indigo-400 mt-0.5">{member.role}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                <div className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{member.email}</span>
                </div>

                {/* Squad Clickable Badge */}
                <div className="mb-4">
                  <button
                    onClick={() => {
                      setCurrentFilterSquad(member.squad);
                      setActiveTab('tickets');
                    }}
                    className="text-[11px] text-slate-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 hover:border-slate-700 transition-colors inline-block truncate max-w-full"
                  >
                    Squad: {member.squad}
                  </button>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-950/70 border border-slate-800/70 rounded-lg text-center">
                  <div>
                    <div className="text-[10px] text-slate-400">Ativos</div>
                    <div className="text-sm font-bold font-mono text-white tabular-nums">
                      {memberTickets.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Resolvidos</div>
                    <div className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                      {member.resolvedToday}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">MTTR</div>
                    <div className="text-sm font-bold font-mono text-indigo-300 tabular-nums">
                      {member.avgResolutionTime}
                    </div>
                  </div>
                </div>
              </div>

              {/* Active tickets assigned */}
              {memberTickets.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/70">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Chamados em Atendimento ({memberTickets.length})
                  </div>
                  <div className="space-y-1.5">
                    {memberTickets.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className="text-xs p-1.5 rounded bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800/50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <span className="font-mono text-indigo-400 text-[11px] shrink-0 mr-1.5">
                          {t.id}
                        </span>
                        <span className="truncate text-slate-200 text-[11px] flex-1">
                          {t.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
