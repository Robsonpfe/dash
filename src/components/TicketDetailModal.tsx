import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Send, 
  CheckCircle2, 
  UserCheck, 
  Calendar, 
  Building,
  Tag,
  Database
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { SlaCountdown } from './SlaCountdown';
import { TicketStatus, Priority } from '../types/ticket';

export const TicketDetailModal: React.FC = () => {
  const { 
    selectedTicket, 
    setSelectedTicket, 
    updateTicketStatus, 
    assignTicket, 
    addTicketComment, 
    resolveTicket, 
    teamMembers 
  } = useTickets();

  const [commentText, setCommentText] = useState('');
  const [resolutionText, setResolutionText] = useState('');
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);

  if (!selectedTicket) return null;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addTicketComment(selectedTicket.id, commentText.trim());
    setCommentText('');
  };

  const handleConfirmResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionText.trim()) return;
    resolveTicket(selectedTicket.id, resolutionText.trim(), selectedRating);
    setShowResolutionForm(false);
  };

  const getPriorityStyle = (p: Priority) => {
    switch (p) {
      case 'P1': return 'text-rose-400 font-bold';
      case 'P2': return 'text-amber-400 font-semibold';
      case 'P3': return 'text-blue-400 font-medium';
      case 'P4': return 'text-slate-400 font-normal';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="font-mono font-bold text-indigo-400 text-sm">
                Chamado Movidesk #{selectedTicket.movideskId || selectedTicket.id.replace('TK-', '')}
              </span>
              <span className="text-slate-600">·</span>
              <span className={getPriorityStyle(selectedTicket.priority)}>
                Urgência: {selectedTicket.urgency || selectedTicket.priority}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300 font-medium">
                {selectedTicket.serviceFirstLevel || selectedTicket.squad}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400 font-medium">
                Fila: TI / Suporte
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
              {selectedTicket.title}
            </h2>
          </div>

          <button
            onClick={() => setSelectedTicket(null)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          
          {/* SLA Countdown Strip & Status Info */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-[11px] text-slate-400">Prazo de Solução (SLA Movidesk)</div>
                <SlaCountdown deadline={selectedTicket.slaDeadline} status={selectedTicket.status} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300 text-xs font-medium">
                Status: <strong className="text-indigo-400">{selectedTicket.rawStatus || selectedTicket.status}</strong>
              </span>

              {selectedTicket.status !== 'resolvido' && selectedTicket.status !== 'fechado' && (
                <>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value as TicketStatus)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="aberto">Mover para: Aberto</option>
                    <option value="em_atendimento">Mover para: Em Atendimento</option>
                    <option value="pendente">Mover para: Aguardando / Pendente</option>
                  </select>

                  <button
                    onClick={() => setShowResolutionForm(true)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Concluir Atendimento</span>
                  </button>
                </>
              )}

              {(selectedTicket.status === 'resolvido' || selectedTicket.status === 'fechado') && (
                <span className="px-3 py-1 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Chamado Finalizado</span>
                </span>
              )}
            </div>
          </div>

          {/* Description & Technical Context */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Descrição Inicial do Chamado
            </h3>
            <div className="p-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl text-slate-200 leading-relaxed whitespace-pre-wrap">
              {selectedTicket.description}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-1.5">
              <div className="text-slate-400 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                <span>Solicitante / Filial Solicitante</span>
              </div>
              <div className="font-semibold text-white">
                {selectedTicket.requester.name}
              </div>
              <div className="text-slate-400">
                {selectedTicket.requester.department} {selectedTicket.requester.email ? `· ${selectedTicket.requester.email}` : ''}
              </div>
            </div>

            <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-1.5">
              <div className="text-slate-400 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Técnico Responsável</span>
              </div>
              
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-white truncate">
                  {selectedTicket.assignee ? selectedTicket.assignee.name : 'Aguardando Atribuição'}
                </span>
                
                {/* Reassignment Dropdown for Manager */}
                <select
                  value={selectedTicket.assignee?.id || ''}
                  onChange={(e) => {
                    if (e.target.value) assignTicket(selectedTicket.id, e.target.value);
                  }}
                  className="bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Trocar analista...</option>
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-slate-400">
                {selectedTicket.assignee?.email || 'Fila geral de atendimento TI'}
              </div>
            </div>
          </div>

          {/* System Affected & Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {selectedTicket.serviceFirstLevel && (
              <div className="flex items-center gap-1 text-xs text-slate-300 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                <span className="text-slate-500">Serviço:</span>
                <span className="font-mono text-indigo-300">{selectedTicket.serviceFirstLevel}</span>
              </div>
            )}
            {selectedTicket.tags.map(tag => (
              <span key={tag} className="text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-500" />
                <span>{tag}</span>
              </span>
            ))}
          </div>

          {/* Resolution Report if resolved */}
          {selectedTicket.resolutionNotes && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-800/80 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Laudo Técnico de Encerramento</span>
              </div>
              <p className="text-slate-200 text-xs leading-relaxed">
                {selectedTicket.resolutionNotes}
              </p>
            </div>
          )}

          {/* Modal to enter technical resolution */}
          {showResolutionForm && (
            <form onSubmit={handleConfirmResolution} className="p-4 bg-slate-950 border border-indigo-900/70 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Registrar Solução do Chamado
              </h4>
              <textarea
                required
                rows={3}
                placeholder="Descreva a causa raiz e a solução aplicada pelo time de suporte..."
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Nota de Atendimento:</span>
                  <select
                    value={selectedRating}
                    onChange={(e) => setSelectedRating(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                  >
                    <option value={5}>5 - Excelente</option>
                    <option value={4}>4 - Bom</option>
                    <option value={3}>3 - Regular</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResolutionForm(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs hover:bg-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-500"
                  >
                    Salvar Solução
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Activity Feed & Timeline from Movidesk Actions */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Histórico de Apontamentos Movidesk ({selectedTicket.activities.length})</span>
            </h3>

            <div className="space-y-3">
              {selectedTicket.activities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="text-slate-200">{act.author}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-indigo-400">{act.role}</span>
                    </div>
                    <span className="font-mono text-slate-500">
                      {new Date(act.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{act.content}</p>
                </div>
              ))}
            </div>

            {/* Quick Comment Input */}
            <form onSubmit={handleSendComment} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Adicionar nota técnica ou instrução para o chamado..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Adicionar</span>
              </button>
            </form>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fila Movidesk: TI (Suporte)</span>
          </div>
          <button
            onClick={() => setSelectedTicket(null)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
