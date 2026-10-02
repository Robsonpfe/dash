import React from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  PieChart, 
  Clock, 
  Award, 
  AlertCircle
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { MetricCard } from './MetricCard';

export const AnalyticsView: React.FC = () => {
  const { tickets, kpis } = useTickets();

  // Squad SLA & Volume Breakdown
  const squadAnalytics = [
    { name: 'Infraestrutura & Redes', targetSla: 95, currentSla: 96, avgMttr: '1h 20m', count: 4 },
    { name: 'Service Desk (Suporte)', targetSla: 90, currentSla: 94, avgMttr: '28m', count: 5 },
    { name: 'Segurança da Informação', targetSla: 98, currentSla: 97, avgMttr: '42m', count: 3 },
    { name: 'DevOps & Cloud', targetSla: 95, currentSla: 92, avgMttr: '1h 45m', count: 4 },
    { name: 'Dados & BI', targetSla: 90, currentSla: 88, avgMttr: '2h 15m', count: 2 },
    { name: 'Engenharia de Software', targetSla: 90, currentSla: 85, avgMttr: '2h 30m', count: 3 },
  ];

  // Priority Breakdown
  const p1Count = tickets.filter(t => t.priority === 'P1').length;
  const p2Count = tickets.filter(t => t.priority === 'P2').length;
  const p3Count = tickets.filter(t => t.priority === 'P3').length;
  const p4Count = tickets.filter(t => t.priority === 'P4').length;

  const exportCSV = () => {
    const headers = ['ID', 'Prioridade', 'Titulo', 'Squad', 'Status', 'Solicitante', 'CriadoEm', 'SLA_Status'];
    const rows = tickets.map(t => [
      t.id,
      t.priority,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.squad}"`,
      t.status,
      `"${t.requester.name}"`,
      t.createdAt,
      t.slaStatus
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_chamados_ti_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Export Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <span>Indicadores de Desempenho & Inteligência Operacional</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas consolidadas de conformidade de SLA, eficiência e tempos de resposta do time de TI.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>Exportar Relatório CSV</span>
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="SLA Médio Consolidado"
          value={`${kpis.slaCompliancePercent}%`}
          subtext="Meta estipulada de 95%"
          icon={Award}
          highlight={kpis.slaCompliancePercent >= 95 ? 'success' : 'warning'}
        />
        <MetricCard
          title="Tempo Resolução (MTTR)"
          value="1h 36m"
          subtext="Meta: < 2h 00m"
          icon={Clock}
          highlight="success"
        />
        <MetricCard
          title="Primeiro Contato (FCR)"
          value={`${kpis.fcrPercent}%`}
          subtext="Resolvidos sem reatribuição"
          icon={TrendingUp}
          highlight="normal"
        />
        <MetricCard
          title="Índice CSAT"
          value={`${kpis.csatAverage}/5.0`}
          subtext="Avaliação pós-chamado"
          icon={Award}
          highlight="success"
        />
      </div>

      {/* SLA Breakdown by Squad Table */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">
            Conformidade de SLA por Especialidade / Squad
          </h3>
          <span className="text-xs text-slate-500 font-mono">Últimos 30 dias</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-3">Squad / Equipe</th>
                <th className="py-2.5 px-3">Meta SLA</th>
                <th className="py-2.5 px-3">SLA Real</th>
                <th className="py-2.5 px-3">MTTR Médio</th>
                <th className="py-2.5 px-3 text-right">Volume</th>
                <th className="py-2.5 px-3">Desempenho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {squadAnalytics.map((squad) => {
                const isMeetingTarget = squad.currentSla >= squad.targetSla;
                return (
                  <tr key={squad.name} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-medium text-slate-200">
                      {squad.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {squad.targetSla}%
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold">
                      <span className={isMeetingTarget ? 'text-emerald-400' : 'text-amber-400'}>
                        {squad.currentSla}%
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {squad.avgMttr}
                    </td>
                    <td className="py-3 px-3 font-mono text-right text-slate-300">
                      {squad.count} chamados
                    </td>
                    <td className="py-3 px-3">
                      <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isMeetingTarget ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${squad.currentSla}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribution by Priority and Management Takeaways */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Priority distribution */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Distribuição por Severidade
            </h3>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-rose-400 font-semibold">P1 - Crítica (SLA: 1 hora)</span>
              <span className="font-mono text-slate-200">{p1Count} chamados</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full"
                style={{ width: `${Math.round((p1Count / (tickets.length || 1)) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-amber-400 font-semibold">P2 - Alta (SLA: 2-4 horas)</span>
              <span className="font-mono text-slate-200">{p2Count} chamados</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${Math.round((p2Count / (tickets.length || 1)) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-blue-400 font-medium">P3 - Média (SLA: 6-8 horas)</span>
              <span className="font-mono text-slate-200">{p3Count} chamados</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${Math.round((p3Count / (tickets.length || 1)) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">P4 - Baixa / Solicitações Gerais</span>
              <span className="font-mono text-slate-200">{p4Count} chamados</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-600 rounded-full"
                style={{ width: `${Math.round((p4Count / (tickets.length || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Management Insight recommendations */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Recomendações para a Gestão
            </h3>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
            <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
              <strong className="text-indigo-300 block mb-0.5">Alocação de Especialistas:</strong>
              A squad de <em>DevOps & Cloud</em> teve maior tempo de fila inicial (MTTA de 22m). Recomenda-se escala cruzada nos horários de pico comercial (10h - 16h).
            </div>
            <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
              <strong className="text-emerald-300 block mb-0.5">Destaque de Eficiência:</strong>
              O <em>Service Desk</em> manteve 94% de resolução no primeiro nível com tempo médio de apenas 28 minutos, superando a meta estabelecida.
            </div>
            <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
              <strong className="text-amber-300 block mb-0.5">Atenção a Incidentes P1:</strong>
              Gargalo identificado em links de dados e rotinas noturnas de conciliação. Projeto de redundância automática em aprovação.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
