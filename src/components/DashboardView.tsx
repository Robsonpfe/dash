import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Users, 
  TrendingUp, 
  ShieldAlert, 
  Activity, 
  ArrowRight,
  Flame,
  Layers,
  Database,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { MetricCard } from './MetricCard';
import { SlaCountdown } from './SlaCountdown';
import { Priority } from '../types/ticket';

export const DashboardView: React.FC = () => {
  const { 
    tickets, 
    kpis, 
    teamMembers, 
    setSelectedTicket, 
    setActiveTab, 
    setCurrentFilterPriority,
    setCurrentFilterStatus,
    setCurrentFilterSquad,
    isMovideskConnected,
    isMovideskSyncing,
    lastMovideskSync,
    movideskQueueName,
    syncMovidesk,
    setSelectedService
  } = useTickets();

  // Critical or urgent tickets
  const criticalTickets = tickets.filter(
    (t) => (t.priority === 'P1' || t.priority === 'P2' || t.slaStatus === 'alerta' || t.slaStatus === 'estourado') &&
           t.status !== 'resolvido' && t.status !== 'fechado'
  );

  // Group tickets by Movidesk Service (serviceFirstLevel)
  const serviceStatsMap = new Map<string, { active: number; total: number }>();
  tickets.forEach(t => {
    const sName = t.serviceFirstLevel || 'Geral / Outros';
    if (!serviceStatsMap.has(sName)) {
      serviceStatsMap.set(sName, { active: 0, total: 0 });
    }
    const stat = serviceStatsMap.get(sName)!;
    stat.total += 1;
    if (t.status === 'aberto' || t.status === 'em_atendimento' || t.status === 'pendente') {
      stat.active += 1;
    }
  });

  const topServices = Array.from(serviceStatsMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const getPriorityBadgeClass = (p: Priority) => {
    switch (p) {
      case 'P1': return 'text-rose-400 font-bold';
      case 'P2': return 'text-amber-400 font-semibold';
      case 'P3': return 'text-blue-400 font-medium';
      case 'P4': return 'text-slate-400 font-normal';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Official Movidesk Integration Notification Card */}
      <div className="bg-slate-900/80 border border-indigo-900/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Fila de Suporte Movidesk (TI - Grupo Trapézio)
              </h1>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                ● Filtro Ativo: {movideskQueueName}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Exibindo apenas os chamados direcionados à equipe de Suporte e Tecnologia da Informação.
              {lastMovideskSync && (
                <span className="ml-1 text-slate-500 font-mono">
                  (Última sincronização com Movidesk: {lastMovideskSync})
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => syncMovidesk(true)}
          disabled={isMovideskSyncing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isMovideskSyncing ? 'animate-spin' : ''}`} />
          <span>{isMovideskSyncing ? 'Sincronizando...' : 'Atualizar Movidesk'}</span>
        </button>
      </div>

      {/* Top Incident Banner if P1 Critical Tickets Exist */}
      {kpis.p1CriticalCount > 0 && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-900/60 border border-rose-700/60 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-bold text-rose-200 flex items-center gap-2">
                <span>{kpis.p1CriticalCount} Incidente(s) P1 / Urgência Máxima em Aberto</span>
                <span className="text-[11px] font-mono bg-rose-900/80 px-2 py-0.5 rounded text-rose-300">
                  Urgência Alta
                </span>
              </div>
              <p className="text-xs text-rose-300/80 mt-0.5">
                Impacto reportado em lojas/filiais. Priorize a tratativa dos analistas.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setCurrentFilterPriority('P1');
              setCurrentFilterStatus('all');
              setCurrentFilterSquad('all');
              setActiveTab('tickets');
            }}
            className="text-xs font-semibold px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span>Ver Fila P1</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Real-time Performance Indicators Grid */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Indicadores da Fila de Suporte em Tempo Real
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Origem: API Movidesk
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            title="Conformidade de SLA"
            value={`${kpis.slaCompliancePercent}%`}
            subtext={`${kpis.slaBreachedCount} estouro(s) de prazo no histórico`}
            icon={CheckCircle2}
            highlight={kpis.slaCompliancePercent >= 90 ? 'success' : 'warning'}
            trend={{
              direction: 'up',
              label: 'Meta da Fila: 95%',
              positive: kpis.slaCompliancePercent >= 90,
            }}
          />

          <MetricCard
            title="Tempo Médio Resolução"
            value="1h 36m"
            subtext="Média de encerramento dos chamados"
            icon={Clock}
            highlight="normal"
            trend={{
              direction: 'down',
              label: 'Histórico da base',
              positive: true,
            }}
          />

          <MetricCard
            title="Tempo de Resposta Inicial"
            value={`${kpis.mttaMinutes} min`}
            subtext="Primeiro contato do técnico"
            icon={TrendingUp}
            highlight="normal"
            trend={{
              direction: 'down',
              label: 'Triagem rápida',
              positive: true,
            }}
          />

          <MetricCard
            title="Total Chamados na Fila"
            value={tickets.length}
            subtext={`${kpis.openCount} novos · ${kpis.inProgressCount} em atendimento`}
            icon={Users}
            highlight="normal"
            trend={{
              direction: 'neutral',
              label: 'Fila ativa TI',
              positive: true,
            }}
          />
        </div>
      </section>

      {/* Secondary operational metrics strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-900/50 border border-slate-800/80 rounded-xl">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">Novos (Aguardando Triagem)</span>
          <span className="text-xl font-bold font-mono text-indigo-400 tabular-nums">
            {kpis.openCount}
          </span>
          <span className="text-[11px] text-slate-500">sem analista atribuído</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">Em Atendimento</span>
          <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
            {kpis.inProgressCount}
          </span>
          <span className="text-[11px] text-slate-500">técnico atuando</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">Aguardando / Pendentes</span>
          <span className="text-xl font-bold font-mono text-purple-400 tabular-nums">
            {kpis.pendingCount}
          </span>
          <span className="text-[11px] text-slate-500">retorno filial / usuário</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">Total Fila Suporte</span>
          <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            {tickets.length}
          </span>
          <span className="text-[11px] text-slate-500">chamados não resolvidos</span>
        </div>
      </div>

      {/* Main 2-column Executive split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Critical & At-Risk Live Tickets Queue */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-200">
                Chamados da Fila que Requerem Atenção
              </h3>
            </div>
            <button
              onClick={() => {
                setCurrentFilterStatus('all');
                setCurrentFilterPriority('all');
                setCurrentFilterSquad('all');
                setActiveTab('tickets');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>Ver todos ({tickets.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {criticalTickets.slice(0, 5).map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="p-3.5 sm:p-4 rounded-xl border border-slate-800 bg-slate-900/70 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-semibold text-indigo-400">
                        {ticket.id}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className={getPriorityBadgeClass(ticket.priority)}>
                        {ticket.priority} - {ticket.urgency || ticket.priority}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400 truncate max-w-[140px] sm:max-w-[200px]">
                        {ticket.serviceFirstLevel || ticket.squad}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-slate-100 hover:text-white line-clamp-1">
                      {ticket.title}
                    </h4>
                  </div>

                  <div className="shrink-0 text-right">
                    <SlaCountdown deadline={ticket.slaDeadline} status={ticket.status} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-2 truncate">
                    <span>Filial/Cliente: <strong className="text-slate-300 font-normal">{ticket.requester.name}</strong></span>
                  </div>
                  <div className="text-xs text-slate-300 shrink-0">
                    {ticket.assignee ? (
                      <span>Técnico: <strong className="text-indigo-300 font-medium">{ticket.assignee.name.split(' ')[0]}</strong></span>
                    ) : (
                      <span className="text-amber-400 font-medium">Não atribuído</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (4 cols): Services in Support Queue & Analysts */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-200">
                Serviços com Maior Volume
              </h3>
            </div>
            <span className="text-xs text-slate-500">Fila TI</span>
          </div>

          <div className="space-y-3 p-4 bg-slate-900/50 border border-slate-800/80 rounded-xl">
            {topServices.map((service) => (
              <div 
                key={service.name} 
                onClick={() => {
                  setSelectedService(service.name);
                  setActiveTab('tickets');
                }}
                className="space-y-1.5 cursor-pointer hover:bg-slate-800/40 p-1.5 -mx-1.5 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200 truncate max-w-[170px]">
                    {service.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px]">
                      {service.active} ativos
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-300">
                      {service.total} total
                    </span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((service.total / (tickets.length || 1)) * 100 * 2))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Real Analysts from Movidesk */}
          <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Analistas do Suporte (Movidesk)
              </span>
              <button
                onClick={() => setActiveTab('team')}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Ver equipe
              </button>
            </div>

            <div className="space-y-2">
              {teamMembers.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full object-cover border border-slate-700"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-950 bg-emerald-500" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-200">{member.name}</div>
                      <div className="text-[10px] text-slate-400">{member.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-slate-300">{member.activeTickets} ativos</div>
                    <div className="text-[10px] text-emerald-400 font-mono">{member.resolvedToday} resolvidos</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
