import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const MOVIDESK_API_TOKEN = process.env.MOVIDESK_API_KEY || 'fe1b5cc5-4b9f-49e1-8305-99cfae00bef5';

app.use(express.json());

// In-memory cache to strictly respect Movidesk rate limits (10 req/min)
let cachedTicketsResponse: any = null;
let lastCacheTimestamp = 0;
const CACHE_TTL_MS = 20000; // 20 seconds cache

interface MovideskTicketRaw {
  id: number;
  type: number;
  category: string;
  urgency: string;
  status: string;
  baseStatus: string;
  createdDate: string;
  ownerTeam: string;
  subject: string;
  serviceFirstLevel?: string;
  serviceSecondLevel?: string;
  serviceThirdLevel?: string;
  resolvedInFirstCall?: boolean;
  slaSolutionDate?: string;
  slaResponseDate?: string;
  justification?: string;
  owner?: {
    id: string;
    businessName: string;
    email?: string;
    pathPicture?: string;
  } | null;
  createdBy?: {
    id: string;
    businessName: string;
    email?: string;
  } | null;
  clients?: Array<{
    id: string;
    businessName: string;
    email?: string;
  }>;
  actions?: Array<{
    id: number;
    description: string;
    status: string;
    createdDate: string;
  }>;
}

// Function to fetch tickets from Movidesk API - Filter: "Todos os tickets não resolvidos - Suporte"
function fetchMovideskTickets(team = 'TI', top = 150): Promise<MovideskTicketRaw[]> {
  return new Promise((resolve, reject) => {
    const select = [
      'id', 'type', 'category', 'urgency', 'status', 'baseStatus',
      'createdDate', 'ownerTeam', 'subject', 'serviceFirstLevel',
      'serviceSecondLevel', 'serviceThirdLevel', 'resolvedInFirstCall',
      'slaSolutionDate', 'slaResponseDate', 'justification'
    ].join(',');

    const expand = 'owner,createdBy,clients,actions';
    
    // Exactly matches the Movidesk view: "Todos os tickets não resolvidos - Suporte"
    const filter = encodeURIComponent(
      `ownerTeam eq '${team}' and baseStatus ne 'Closed' and baseStatus ne 'Canceled' and baseStatus ne 'Resolved'`
    );
    const encodedSelect = encodeURIComponent(select);
    const encodedExpand = encodeURIComponent(expand);

    const url = `https://api.movidesk.com/public/v1/tickets?token=${MOVIDESK_API_TOKEN}&$select=${encodedSelect}&$expand=${encodedExpand}&$filter=${filter}&$orderby=createdDate%20desc&$top=${top}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode && res.statusCode >= 400) {
            return reject(new Error(`Movidesk API error (${res.statusCode}): ${data}`));
          }
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            resolve(parsed);
          } else {
            reject(new Error(`Unexpected response from Movidesk: ${data}`));
          }
        } catch (e: any) {
          reject(new Error(`JSON parse error: ${e.message} - ${data}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Function to fetch resolved tickets count per technician
function fetchResolvedTicketsByTechnician(team = 'TI'): Promise<Map<string, number>> {
  return new Promise((resolve) => {
    const select = encodeURIComponent('id,owner');
    const filter = encodeURIComponent(`ownerTeam eq '${team}' and (baseStatus eq 'Resolved' or baseStatus eq 'Closed')`);
    const url = `https://api.movidesk.com/public/v1/tickets?token=${MOVIDESK_API_TOKEN}&$select=${select}&$expand=owner&$filter=${filter}&$orderby=createdDate%20desc&$top=300`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const tickets = JSON.parse(data);
          const map = new Map<string, number>();
          if (Array.isArray(tickets)) {
            tickets.forEach((t) => {
              if (t.owner?.id) {
                map.set(t.owner.id, (map.get(t.owner.id) || 0) + 1);
              }
              if (t.owner?.businessName) {
                map.set(t.owner.businessName, (map.get(t.owner.businessName) || 0) + 1);
              }
            });
          }
          resolve(map);
        } catch {
          resolve(new Map());
        }
      });
    }).on('error', () => {
      resolve(new Map());
    });
  });
}

// Map Movidesk priority to P1..P4
function mapUrgencyToPriority(urgency?: string): 'P1' | 'P2' | 'P3' | 'P4' {
  if (!urgency) return 'P3';
  const u = urgency.toLowerCase();
  if (u.includes('altissim') || u.includes('urgent') || u.includes('crític') || u.includes('critica')) return 'P1';
  if (u.includes('alta')) return 'P2';
  if (u.includes('méd') || u.includes('med')) return 'P3';
  return 'P4';
}

// Map Movidesk status to normalized status
function mapStatus(status?: string, baseStatus?: string): 'aberto' | 'em_atendimento' | 'pendente' | 'resolvido' | 'fechado' {
  const s = (status || '').toLowerCase();
  const b = (baseStatus || '').toLowerCase();

  if (s.includes('fechad') || b.includes('closed') || s.includes('cancelad') || b.includes('canceled')) {
    return 'fechado';
  }
  if (s.includes('resolvid') || b.includes('resolved')) {
    return 'resolvido';
  }
  if (s.includes('atend') || b.includes('inattendance') || s.includes('andamento')) {
    return 'em_atendimento';
  }
  if (s.includes('aguard') || b.includes('pending') || s.includes('pausad')) {
    return 'pendente';
  }
  return 'aberto';
}

// Map service to squad / category
function mapSquad(serviceFirstLevel?: string): string {
  if (!serviceFirstLevel) return 'Suporte Geral';
  const s = serviceFirstLevel.toLowerCase();
  if (s.includes('rede') || s.includes('wifi') || s.includes('câmera') || s.includes('dvr')) return 'Infraestrutura & Redes';
  if (s.includes('totvs') || s.includes('protheus') || s.includes('sap') || s.includes('webposto')) return 'Sistemas & ERP';
  if (s.includes('spartacus') || s.includes('kingposto') || s.includes('pdv') || s.includes('smartpos') || s.includes('cupom')) return 'Automação & PDVs';
  if (s.includes('acesso') || s.includes('seguran') || s.includes('cartão') || s.includes('rfid')) return 'Segurança & Acessos';
  return 'Service Desk (Suporte)';
}

// API endpoint to get Movidesk tickets
app.get('/api/movidesk/tickets', async (req: Request, res: Response) => {
  try {
    const force = req.query.force === 'true';
    const team = (req.query.team as string) || 'TI';
    const now = Date.now();

    // Check cache
    if (!force && cachedTicketsResponse && (now - lastCacheTimestamp < CACHE_TTL_MS)) {
      return res.json({
        ...cachedTicketsResponse,
        fromCache: true,
        cacheAgeSeconds: Math.round((now - lastCacheTimestamp) / 1000),
      });
    }

    // Parallel fetch: Unresolved tickets in queue + Resolved counts per technician
    const [rawTickets, resolvedMap] = await Promise.all([
      fetchMovideskTickets(team, 150),
      fetchResolvedTicketsByTechnician(team),
    ]);

    // Transform raw tickets
    const transformedTickets = rawTickets.map((t) => {
      const priority = mapUrgencyToPriority(t.urgency);
      const status = mapStatus(t.status, t.baseStatus);
      const requesterName = t.createdBy?.businessName || t.clients?.[0]?.businessName || 'Solicitante';
      const requesterDept = t.clients?.[0]?.businessName || 'Filial / Posto';
      const requesterEmail = t.createdBy?.email || t.clients?.[0]?.email || '';

      // Determine SLA deadline
      let slaDeadline = t.slaSolutionDate || t.slaResponseDate;
      if (!slaDeadline) {
        const hours = priority === 'P1' ? 1 : priority === 'P2' ? 3 : priority === 'P3' ? 8 : 24;
        slaDeadline = new Date(new Date(t.createdDate).getTime() + hours * 3600 * 1000).toISOString();
      }

      // Check SLA status
      const deadlineMs = new Date(slaDeadline).getTime();
      const currentMs = Date.now();
      const diffMins = (deadlineMs - currentMs) / 60000;

      let slaStatus: 'normal' | 'alerta' | 'estourado' = 'normal';
      if (status !== 'resolvido' && status !== 'fechado') {
        if (diffMins <= 0) slaStatus = 'estourado';
        else if (diffMins <= 60) slaStatus = 'alerta';
      }

      const activities = (t.actions || []).map((action, idx) => ({
        id: `act-${t.id}-${action.id || idx}`,
        author: 'Movidesk',
        role: action.status || 'Histórico',
        type: 'comment' as const,
        content: action.description || 'Ação registrada no chamado.',
        timestamp: action.createdDate || t.createdDate,
      }));

      if (activities.length === 0) {
        activities.push({
          id: `act-${t.id}-init`,
          author: requesterName,
          role: 'Solicitante',
          type: 'comment',
          content: t.subject,
          timestamp: t.createdDate,
        });
      }

      return {
        id: `TK-${t.id}`,
        movideskId: t.id,
        title: t.subject,
        description: t.actions?.[0]?.description || t.subject,
        squad: mapSquad(t.serviceFirstLevel),
        serviceFirstLevel: t.serviceFirstLevel || 'Geral',
        category: t.category,
        urgency: t.urgency,
        rawStatus: t.status,
        priority,
        status,
        requester: {
          name: requesterName,
          department: requesterDept,
          email: requesterEmail,
        },
        assignee: t.owner ? {
          id: t.owner.id,
          name: t.owner.businessName,
          email: t.owner.email || '',
          role: 'Analista de Suporte',
          avatar: t.owner.pathPicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.owner.businessName)}&background=4f46e5&color=fff`,
          squad: 'Service Desk (Suporte)',
          activeTickets: 0,
          resolvedToday: resolvedMap.get(t.owner.id) || resolvedMap.get(t.owner.businessName) || 0,
          avgResolutionTime: '1h 10m',
          status: 'online' as const,
        } : undefined,
        createdAt: t.createdDate,
        updatedAt: t.actions?.[t.actions.length - 1]?.createdDate || t.createdDate,
        slaMinutesTotal: priority === 'P1' ? 60 : priority === 'P2' ? 180 : 480,
        slaDeadline,
        slaStatus,
        firstContactResolved: t.resolvedInFirstCall || false,
        tags: [t.serviceFirstLevel, t.category, t.urgency, t.ownerTeam].filter(Boolean) as string[],
        systemAffected: t.serviceFirstLevel || 'Infraestrutura / Sistemas',
        activities,
      };
    });

    // Extract unique team members from tickets and match resolved count
    const teamMembersMap = new Map<string, any>();
    
    // Pre-populate core support analysts from Grupo Trapézio
    const knownAnalysts = [
      { id: '147192555', name: 'Pedro Henrique Deodato', email: 'pedrodeodato@grupotrapezio.com.br', role: 'Analista de Suporte TI' },
      { id: '1654931689', name: 'Paulo de Tarso Junior', email: 'paulo.junior@grupotrapezio.com.br', role: 'Analista de Suporte TI' },
      { id: '683172031', name: 'Robson de Andrade Souza', email: 'robson.souza@grupotrapezio.com.br', role: 'Gestor de TI & Suporte' },
      { id: '147485485', name: 'Bruno Monteiro', email: 'bruno.silva@grupotrapezio.com.br', role: 'Analista de Suporte TI' },
      { id: '607385376', name: 'Thiago Lopes dos Santos', email: '', role: 'Analista de Suporte TI' },
    ];

    knownAnalysts.forEach(a => {
      teamMembersMap.set(a.id, {
        id: a.id,
        name: a.name,
        email: a.email,
        role: a.role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=4f46e5&color=fff`,
        squad: 'Service Desk (Suporte)',
        activeTickets: 0,
        resolvedToday: resolvedMap.get(a.id) || resolvedMap.get(a.name) || 0,
        avgResolutionTime: '1h 10m',
        status: 'online',
      });
    });

    // Count active tickets per analyst from unresolved queue
    transformedTickets.forEach(ticket => {
      if (ticket.assignee && ticket.assignee.id) {
        if (!teamMembersMap.has(ticket.assignee.id)) {
          teamMembersMap.set(ticket.assignee.id, {
            ...ticket.assignee,
            activeTickets: 0,
            resolvedToday: resolvedMap.get(ticket.assignee.id) || resolvedMap.get(ticket.assignee.name) || 0,
          });
        }
        const member = teamMembersMap.get(ticket.assignee.id);
        member.activeTickets += 1;
      }
    });

    const teamMembers = Array.from(teamMembersMap.values());

    const responsePayload = {
      success: true,
      source: 'movidesk',
      queueName: 'Todos os tickets não resolvidos - Suporte',
      total: transformedTickets.length,
      tickets: transformedTickets,
      teamMembers,
      lastUpdated: new Date().toISOString(),
      fromCache: false,
    };

    cachedTicketsResponse = responsePayload;
    lastCacheTimestamp = now;

    res.json(responsePayload);
  } catch (err: any) {
    console.error('Error fetching from Movidesk:', err.message);
    res.status(500).json({
      success: false,
      message: err.message,
      cachedData: cachedTicketsResponse,
    });
  }
});

// Health check and status
app.get('/api/movidesk/status', (req: Request, res: Response) => {
  res.json({
    online: true,
    tokenConfigured: !!MOVIDESK_API_TOKEN,
    tokenPreview: MOVIDESK_API_TOKEN ? `${MOVIDESK_API_TOKEN.slice(0, 8)}...` : null,
    queue: 'Todos os tickets não resolvidos - Suporte',
    cached: !!cachedTicketsResponse,
    lastCacheTime: lastCacheTimestamp ? new Date(lastCacheTimestamp).toISOString() : null,
    cacheAgeSeconds: lastCacheTimestamp ? Math.round((Date.now() - lastCacheTimestamp) / 1000) : null,
  });
});

// Setup Vite or static serving
function getDistPath(): string {
  if (fs.existsSync(path.resolve(__dirname, 'dist', 'index.html'))) {
    return path.resolve(__dirname, 'dist');
  }
  if (fs.existsSync(path.resolve(process.cwd(), 'dist', 'index.html'))) {
    return path.resolve(process.cwd(), 'dist');
  }
  if (fs.existsSync(path.resolve(__dirname, 'index.html'))) {
    return path.resolve(__dirname);
  }
  return path.resolve(process.cwd(), 'dist');
}

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = getDistPath();
    app.use(express.static(distDir));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  // Bind to 0.0.0.0 so VM / container allows external access
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TechOps Triangulo Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
