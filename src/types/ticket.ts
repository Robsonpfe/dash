export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

export type TicketStatus = 'aberto' | 'em_atendimento' | 'pendente' | 'resolvido' | 'fechado';

export type SquadName = 
  | 'Infraestrutura & Redes'
  | 'Service Desk (Suporte)'
  | 'Segurança da Informação'
  | 'DevOps & Cloud'
  | 'Dados & BI'
  | 'Engenharia de Software'
  | 'Sistemas & ERP'
  | 'Automação & PDVs'
  | 'Segurança & Acessos'
  | 'Suporte ao Usuário (TI)'
  | string;

export type SlaStatus = 'normal' | 'alerta' | 'estourado';

export interface TicketActivity {
  id: string;
  author: string;
  role: string;
  type: 'status_change' | 'comment' | 'assignment' | 'sla_breach' | 'resolution' | 'sla_alert';
  content: string;
  timestamp: string;
}

export interface TicketUser {
  id?: string;
  name: string;
  email: string;
  department?: string;
  role?: string;
  avatar?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  squad: SquadName;
  role: string;
  avatar: string;
  activeTickets: number;
  resolvedToday: number;
  avgResolutionTime: string;
  status: 'online' | 'em_atendimento' | 'ocupado' | 'plantao';
  department?: string;
}

export interface Ticket {
  id: string;
  movideskId?: number;
  title: string;
  description: string;
  squad: SquadName;
  serviceFirstLevel?: string;
  priority: Priority;
  urgency?: string;
  category?: string;
  status: TicketStatus;
  rawStatus?: string;
  requester: TicketUser;
  assignee?: TeamMember;
  createdAt: string;
  updatedAt: string;
  slaMinutesTotal: number;
  slaDeadline: string; // ISO string
  slaStatus: SlaStatus;
  firstContactResolved?: boolean;
  csatRating?: number; // 1 to 5
  tags: string[];
  systemAffected?: string;
  activities: TicketActivity[];
  resolutionNotes?: string;
  resolvedAt?: string;
}

export interface ExecutiveKPIs {
  totalToday: number;
  openCount: number;
  inProgressCount: number;
  pendingCount: number;
  resolvedTodayCount: number;
  p1CriticalCount: number;
  slaCompliancePercent: number;
  slaRiskCount: number;
  slaBreachedCount: number;
  mttrHours: number;
  mttaMinutes: number;
  fcrPercent: number;
  csatAverage: number;
}
