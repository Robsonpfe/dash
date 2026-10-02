import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Ticket, 
  TeamMember, 
  ExecutiveKPIs, 
  TicketStatus, 
  Priority, 
  SquadName,
  TicketActivity,
  SlaStatus
} from '../types/ticket';
import { INITIAL_TICKETS, INITIAL_TEAM_MEMBERS, SIMULATED_INCOMING_TICKETS } from '../data/mockTickets';

interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: 'p1_alert' | 'ticket_created' | 'ticket_resolved' | 'sla_warning';
  timestamp: Date;
}

interface TicketContextType {
  tickets: Ticket[];
  teamMembers: TeamMember[];
  kpis: ExecutiveKPIs;
  selectedTicket: Ticket | null;
  setSelectedTicket: (ticket: Ticket | null) => void;
  createTicket: (data: {
    title: string;
    description: string;
    squad: SquadName;
    priority: Priority;
    requesterName: string;
    requesterDept: string;
    requesterEmail: string;
    systemAffected?: string;
    tags?: string[];
  }) => void;
  updateTicketStatus: (ticketId: string, newStatus: TicketStatus, comment?: string) => void;
  assignTicket: (ticketId: string, memberId: string) => void;
  addTicketComment: (ticketId: string, content: string) => void;
  resolveTicket: (ticketId: string, resolutionNotes: string, csatRating?: number) => void;
  simulateIncomingTicket: () => void;
  isRealtimeSimulationActive: boolean;
  toggleRealtimeSimulation: () => void;
  
  // Movidesk Integration State
  isMovideskConnected: boolean;
  isMovideskSyncing: boolean;
  lastMovideskSync: string | null;
  movideskQueueName: string;
  syncMovidesk: (force?: boolean) => Promise<void>;
  availableServices: string[];
  selectedService: string;
  setSelectedService: (service: string) => void;

  // Filtering & Search
  currentFilterSquad: string;
  setCurrentFilterSquad: (squad: string) => void;
  currentFilterPriority: string;
  setCurrentFilterPriority: (priority: string) => void;
  currentFilterStatus: string;
  setCurrentFilterStatus: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // View state
  activeTab: 'dashboard' | 'tickets' | 'analytics' | 'team';
  setActiveTab: (tab: 'dashboard' | 'tickets' | 'analytics' | 'team') => void;
  viewMode: 'responsive' | 'mobile_preview';
  setViewMode: (mode: 'responsive' | 'mobile_preview') => void;
  ticketViewLayout: 'list' | 'kanban';
  setTicketViewLayout: (layout: 'list' | 'kanban') => void;

  // Modals & alerts
  isNewTicketModalOpen: boolean;
  setIsNewTicketModalOpen: (open: boolean) => void;
  toast: NotificationToast | null;
  dismissToast: () => void;
  resetToDefaultData: () => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_TICKETS = 'techops_tickets_v1';
const LOCAL_STORAGE_KEY_MEMBERS = 'techops_team_v1';

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TICKETS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_TICKETS;
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_MEMBERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_TEAM_MEMBERS;
  });

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isRealtimeSimulationActive, setIsRealtimeSimulationActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tickets' | 'analytics' | 'team'>('dashboard');
  const [viewMode, setViewMode] = useState<'responsive' | 'mobile_preview'>('responsive');
  const [ticketViewLayout, setTicketViewLayout] = useState<'list' | 'kanban'>('list');
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [toast, setToast] = useState<NotificationToast | null>(null);

  // Movidesk Integration State
  const [isMovideskConnected, setIsMovideskConnected] = useState(false);
  const [isMovideskSyncing, setIsMovideskSyncing] = useState(false);
  const [lastMovideskSync, setLastMovideskSync] = useState<string | null>(null);
  const [movideskQueueName, setMovideskQueueName] = useState('Fila TI (Suporte)');
  const [selectedService, setSelectedService] = useState('all');

  // Filters
  const [currentFilterSquad, setCurrentFilterSquad] = useState<string>('all');
  const [currentFilterPriority, setCurrentFilterPriority] = useState<string>('all');
  const [currentFilterStatus, setCurrentFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract available services from tickets for filtering
  const availableServices = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach(t => {
      if (t.serviceFirstLevel) set.add(t.serviceFirstLevel);
    });
    return Array.from(set).sort();
  }, [tickets]);

  // Sync Movidesk tickets from /api/movidesk/tickets
  const syncMovidesk = useCallback(async (force = false) => {
    setIsMovideskSyncing(true);
    try {
      const res = await fetch(`/api/movidesk/tickets?team=TI${force ? '&force=true' : ''}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data && data.success && Array.isArray(data.tickets) && data.tickets.length > 0) {
        setTickets(data.tickets);
        if (Array.isArray(data.teamMembers) && data.teamMembers.length > 0) {
          setTeamMembers(data.teamMembers);
        }
        setIsMovideskConnected(true);
        setLastMovideskSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setMovideskQueueName(data.queueName || 'Fila TI (Suporte)');
      }
    } catch (err: any) {
      console.warn('Could not sync with Movidesk endpoint:', err.message);
    } finally {
      setIsMovideskSyncing(false);
    }
  }, []);

  // Fetch Movidesk on component mount
  useEffect(() => {
    syncMovidesk();

    // Auto-refresh Movidesk tickets every 30 seconds
    const interval = setInterval(() => {
      syncMovidesk();
    }, 30000);

    return () => clearInterval(interval);
  }, [syncMovidesk]);

  // Persist tickets in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_TICKETS, JSON.stringify(tickets));
    } catch (e) {
      console.error('Error saving tickets to localStorage', e);
    }
  }, [tickets]);

  // Keep selectedTicket in sync with tickets state
  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find(t => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  }, [tickets, selectedTicket]);

  // SLA Evaluator every 5 seconds (updates status between normal, alerta, estourado)
  useEffect(() => {
    const interval = setInterval(() => {
      setTickets(prev =>
        prev.map(t => {
          if (t.status === 'resolvido' || t.status === 'fechado') return t;
          const deadline = new Date(t.slaDeadline).getTime();
          const now = Date.now();
          const diffMinutes = (deadline - now) / (1000 * 60);

          let newSlaStatus: SlaStatus = 'normal';
          if (diffMinutes <= 0) {
            newSlaStatus = 'estourado';
          } else if (diffMinutes <= 30) {
            newSlaStatus = 'alerta';
          }

          if (newSlaStatus !== t.slaStatus) {
            return { ...t, slaStatus: newSlaStatus };
          }
          return t;
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Periodic automatic simulation if active
  useEffect(() => {
    if (!isRealtimeSimulationActive) return;

    const timer = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * SIMULATED_INCOMING_TICKETS.length);
      const template = SIMULATED_INCOMING_TICKETS[randomIndex];
      const newId = `TK-${Math.floor(8405 + Math.random() * 500)}`;

      const newTicket: Ticket = {
        ...template,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slaDeadline: new Date(Date.now() + template.slaMinutesTotal * 60 * 1000).toISOString(),
        activities: [
          {
            id: `act-${Date.now()}`,
            author: template.requester.name,
            role: template.requester.department || 'Solicitante',
            type: 'comment',
            content: `Chamado registrado automaticamente via canal de suporte: ${template.description}`,
            timestamp: new Date().toISOString(),
          }
        ]
      };

      setTickets(prev => [newTicket, ...prev]);

      setToast({
        id: `toast-${Date.now()}`,
        title: `Novo Chamado [${template.priority}]: ${newId}`,
        message: template.title,
        type: template.priority === 'P1' ? 'p1_alert' : 'ticket_created',
        timestamp: new Date(),
      });
    }, 45000);

    return () => clearInterval(timer);
  }, [isRealtimeSimulationActive]);

  // Compute Executive KPIs
  const kpis: ExecutiveKPIs = useMemo(() => {
    const totalToday = tickets.length;
    const openCount = tickets.filter(t => t.status === 'aberto').length;
    const inProgressCount = tickets.filter(t => t.status === 'em_atendimento').length;
    const pendingCount = tickets.filter(t => t.status === 'pendente').length;
    const resolvedTodayCount = tickets.filter(t => t.status === 'resolvido' || t.status === 'fechado').length;
    const p1CriticalCount = tickets.filter(t => t.priority === 'P1' && t.status !== 'resolvido' && t.status !== 'fechado').length;
    
    // SLA Metrics
    const breached = tickets.filter(t => t.slaStatus === 'estourado').length;
    const atRisk = tickets.filter(t => t.slaStatus === 'alerta' && t.status !== 'resolvido' && t.status !== 'fechado').length;
    
    const slaCompliance = totalToday > 0 
      ? Math.max(0, Math.min(100, Math.round(((totalToday - breached) / totalToday) * 100))) 
      : 100;

    const resolvedTickets = tickets.filter(t => t.status === 'resolvido' || t.status === 'fechado');
    const fcrCount = resolvedTickets.filter(t => t.firstContactResolved).length;
    const fcrPercent = resolvedTickets.length > 0 ? Math.round((fcrCount / resolvedTickets.length) * 100) : 78;

    const ratedTickets = tickets.filter(t => t.csatRating && t.csatRating > 0);
    const csatTotal = ratedTickets.reduce((acc, t) => acc + (t.csatRating || 0), 0);
    const csatAverage = ratedTickets.length > 0 ? Number((csatTotal / ratedTickets.length).toFixed(1)) : 4.8;

    return {
      totalToday,
      openCount,
      inProgressCount,
      pendingCount,
      resolvedTodayCount,
      p1CriticalCount,
      slaCompliancePercent: slaCompliance,
      slaRiskCount: atRisk,
      slaBreachedCount: breached,
      mttrHours: 1.5,
      mttaMinutes: 16,
      fcrPercent,
      csatAverage,
    };
  }, [tickets]);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const toggleRealtimeSimulation = useCallback(() => {
    setIsRealtimeSimulationActive(prev => !prev);
  }, []);

  const simulateIncomingTicket = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * SIMULATED_INCOMING_TICKETS.length);
    const template = SIMULATED_INCOMING_TICKETS[randomIndex];
    const newId = `TK-${Math.floor(8500 + Math.random() * 500)}`;

    const newTicket: Ticket = {
      ...template,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + template.slaMinutesTotal * 60 * 1000).toISOString(),
      activities: [
        {
          id: `act-${Date.now()}`,
          author: template.requester.name,
          role: template.requester.department || 'Solicitante',
          type: 'comment',
          content: `Chamado simulado inserido em tempo real: ${template.description}`,
          timestamp: new Date().toISOString(),
        }
      ]
    };

    setTickets(prev => [newTicket, ...prev]);

    setToast({
      id: `toast-${Date.now()}`,
      title: `⚡ Incidente em Tempo Real Gerado [${template.priority}]`,
      message: `${newId}: ${template.title}`,
      type: template.priority === 'P1' ? 'p1_alert' : 'ticket_created',
      timestamp: new Date(),
    });
  }, []);

  const createTicket = useCallback((data: {
    title: string;
    description: string;
    squad: SquadName;
    priority: Priority;
    requesterName: string;
    requesterDept: string;
    requesterEmail: string;
    systemAffected?: string;
    tags?: string[];
  }) => {
    let slaMins = 240;
    if (data.priority === 'P1') slaMins = 60;
    else if (data.priority === 'P2') slaMins = 120;
    else if (data.priority === 'P3') slaMins = 360;
    else if (data.priority === 'P4') slaMins = 480;

    const newId = `TK-${Math.floor(42000 + Math.random() * 999)}`;
    const now = new Date();

    const newTicket: Ticket = {
      id: newId,
      title: data.title,
      description: data.description,
      squad: data.squad,
      serviceFirstLevel: data.systemAffected || 'Geral',
      priority: data.priority,
      status: 'aberto',
      rawStatus: 'Novo',
      requester: {
        name: data.requesterName,
        department: data.requesterDept,
        email: data.requesterEmail,
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      slaMinutesTotal: slaMins,
      slaDeadline: new Date(now.getTime() + slaMins * 60 * 1000).toISOString(),
      slaStatus: 'normal',
      tags: data.tags || [data.squad.split(' ')[0], data.priority],
      systemAffected: data.systemAffected || 'Sistemas Corporativos',
      activities: [
        {
          id: `act-${Date.now()}`,
          author: data.requesterName,
          role: data.requesterDept,
          type: 'comment',
          content: 'Abertura do chamado pelo portal corporativo.',
          timestamp: now.toISOString(),
        }
      ]
    };

    setTickets(prev => [newTicket, ...prev]);
    setIsNewTicketModalOpen(false);

    setToast({
      id: `toast-${Date.now()}`,
      title: `Chamado Criado com Sucesso`,
      message: `${newId} foi registrado na fila de ${data.squad}.`,
      type: 'ticket_created',
      timestamp: new Date(),
    });
  }, []);

  const updateTicketStatus = useCallback((ticketId: string, newStatus: TicketStatus, comment?: string) => {
    const now = new Date().toISOString();
    setTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t;
        const newActivities: TicketActivity[] = [
          ...t.activities,
          {
            id: `act-${Date.now()}`,
            author: 'Gestor de TI (Você)',
            role: 'Gerência de Tecnologia',
            type: 'status_change',
            content: comment || `Status atualizado de "${t.status}" para "${newStatus}".`,
            timestamp: now,
          }
        ];
        return {
          ...t,
          status: newStatus,
          updatedAt: now,
          activities: newActivities,
        };
      })
    );

    setToast({
      id: `toast-${Date.now()}`,
      title: `Status Atualizado (${ticketId})`,
      message: `Chamado movido para "${newStatus}".`,
      type: 'ticket_resolved',
      timestamp: new Date(),
    });
  }, []);

  const assignTicket = useCallback((ticketId: string, memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;
    const now = new Date().toISOString();

    setTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          assignee: member,
          status: t.status === 'aberto' ? 'em_atendimento' : t.status,
          updatedAt: now,
          activities: [
            ...t.activities,
            {
              id: `act-${Date.now()}`,
              author: 'Gestor de TI (Você)',
              role: 'Gerência de Tecnologia',
              type: 'assignment',
              content: `Chamado atribuído para o analista ${member.name}.`,
              timestamp: now,
            }
          ]
        };
      })
    );

    setTeamMembers(prev =>
      prev.map(m => (m.id === memberId ? { ...m, activeTickets: m.activeTickets + 1 } : m))
    );

    setToast({
      id: `toast-${Date.now()}`,
      title: `Analista Atribuído`,
      message: `${member.name} assumiu o chamado ${ticketId}.`,
      type: 'ticket_created',
      timestamp: new Date(),
    });
  }, [teamMembers]);

  const addTicketComment = useCallback((ticketId: string, content: string) => {
    const now = new Date().toISOString();
    setTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          updatedAt: now,
          activities: [
            ...t.activities,
            {
              id: `act-${Date.now()}`,
              author: 'Gestor de TI (Você)',
              role: 'Gerência de Tecnologia',
              type: 'comment',
              content,
              timestamp: now,
            }
          ]
        };
      })
    );
  }, []);

  const resolveTicket = useCallback((ticketId: string, resolutionNotes: string, csatRating = 5) => {
    const now = new Date().toISOString();
    setTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'resolvido',
          resolvedAt: now,
          updatedAt: now,
          resolutionNotes,
          csatRating,
          firstContactResolved: t.activities.length <= 3,
          activities: [
            ...t.activities,
            {
              id: `act-${Date.now()}`,
              author: 'Gestor de TI (Você)',
              role: 'Gerência de Tecnologia',
              type: 'resolution',
              content: `Chamado marcado como resolvido: ${resolutionNotes}`,
              timestamp: now,
            }
          ]
        };
      })
    );

    setToast({
      id: `toast-${Date.now()}`,
      title: `Chamado Resolvido com Sucesso`,
      message: `${ticketId} encerrado e laudo registrado.`,
      type: 'ticket_resolved',
      timestamp: new Date(),
    });
  }, []);

  const resetToDefaultData = useCallback(() => {
    syncMovidesk(true);
    setSelectedTicket(null);
  }, [syncMovidesk]);

  return (
    <TicketContext.Provider
      value={{
        tickets,
        teamMembers,
        kpis,
        selectedTicket,
        setSelectedTicket,
        createTicket,
        updateTicketStatus,
        assignTicket,
        addTicketComment,
        resolveTicket,
        simulateIncomingTicket,
        isRealtimeSimulationActive,
        toggleRealtimeSimulation,
        isMovideskConnected,
        isMovideskSyncing,
        lastMovideskSync,
        movideskQueueName,
        syncMovidesk,
        availableServices,
        selectedService,
        setSelectedService,
        currentFilterSquad,
        setCurrentFilterSquad,
        currentFilterPriority,
        setCurrentFilterPriority,
        currentFilterStatus,
        setCurrentFilterStatus,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        viewMode,
        setViewMode,
        ticketViewLayout,
        setTicketViewLayout,
        isNewTicketModalOpen,
        setIsNewTicketModalOpen,
        toast,
        dismissToast,
        resetToDefaultData,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};
