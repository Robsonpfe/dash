import React, { useState } from 'react';
import { X, Plus, AlertTriangle } from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { Priority, SquadName } from '../types/ticket';

export const NewTicketModal: React.FC = () => {
  const { isNewTicketModalOpen, setIsNewTicketModalOpen, createTicket } = useTickets();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [squad, setSquad] = useState<SquadName>('Infraestrutura & Redes');
  const [priority, setPriority] = useState<Priority>('P2');
  const [requesterName, setRequesterName] = useState('');
  const [requesterDept, setRequesterDept] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [systemAffected, setSystemAffected] = useState('');

  if (!isNewTicketModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !requesterName.trim()) return;

    createTicket({
      title: title.trim(),
      description: description.trim(),
      squad,
      priority,
      requesterName: requesterName.trim(),
      requesterDept: requesterDept.trim() || 'Geral',
      requesterEmail: requesterEmail.trim() || `${requesterName.toLowerCase().replace(/\s+/g, '.')}@empresa.com.br`,
      systemAffected: systemAffected.trim() || undefined,
    });

    // Reset
    setTitle('');
    setDescription('');
    setRequesterName('');
    setRequesterDept('');
    setRequesterEmail('');
    setSystemAffected('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm sm:text-base font-bold text-white">
              Abrir Novo Chamado de Tecnologia
            </h2>
          </div>
          <button
            onClick={() => setIsNewTicketModalOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Título do Incidente / Solicitação *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Falha no acesso ao ERP, Instabilidade VPN, Configuração de Servidor..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Squad / Área de Atendimento TI *
              </label>
              <select
                value={squad}
                onChange={(e) => setSquad(e.target.value as SquadName)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Infraestrutura & Redes">Infraestrutura & Redes</option>
                <option value="Service Desk (Suporte)">Service Desk (Suporte)</option>
                <option value="Segurança da Informação">Segurança da Informação</option>
                <option value="DevOps & Cloud">DevOps & Cloud</option>
                <option value="Dados & BI">Dados & BI</option>
                <option value="Engenharia de Software">Engenharia de Software</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Prioridade & SLA *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="P1">P1 - Crítica (SLA: 1 hora - Parada Geral)</option>
                <option value="P2">P2 - Alta (SLA: 2 horas - Operação Afetada)</option>
                <option value="P3">P3 - Média (SLA: 6 horas - Normal)</option>
                <option value="P4">P4 - Baixa (SLA: 8 horas - Solicitações)</option>
              </select>
            </div>
          </div>

          {priority === 'P1' && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-lg flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                Atenção: Chamados P1 notificam imediatamente os líderes de squad e o NOC de plantão via alerta sonoro e push.
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Descrição Detalhada do Problema *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Descreva o que aconteceu, mensagens de erro apresentadas, quantidade de usuários impactados..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Solicitante *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Carlos Albuquerque"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Departamento Impactado
              </label>
              <input
                type="text"
                placeholder="Ex: Financeiro, Operações, Comercial"
                value={requesterDept}
                onChange={(e) => setRequesterDept(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Sistema / Equipamento Afetado (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Servidor de Aplicação AWS, SAP S/4HANA, Switch Rack 4, Laptop Dell..."
              value={systemAffected}
              onChange={(e) => setSystemAffected(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsNewTicketModalOpen(false)}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Chamado</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
