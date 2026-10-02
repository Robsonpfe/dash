import { Ticket, TeamMember } from '../types/ticket';

// Dynamic relative date helpers so deadlines are always realistic relative to current moment
const now = new Date();
const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60 * 1000).toISOString();
const minutesFromNow = (mins: number) => new Date(now.getTime() + mins * 60 * 1000).toISOString();

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'usr-1',
    name: 'Carlos Eduardo Ramos',
    email: 'carlos.ramos@empresa.com.br',
    squad: 'Infraestrutura & Redes',
    role: 'Especialista em Redes & Cloud',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    activeTickets: 3,
    resolvedToday: 5,
    avgResolutionTime: '1h 15m',
    status: 'em_atendimento',
  },
  {
    id: 'usr-2',
    name: 'Mariana Silveira',
    email: 'mariana.silveira@empresa.com.br',
    squad: 'Segurança da Informação',
    role: 'SecOps Lead / Blue Team',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    activeTickets: 2,
    resolvedToday: 4,
    avgResolutionTime: '48m',
    status: 'online',
  },
  {
    id: 'usr-3',
    name: 'Thiago Martins',
    email: 'thiago.martins@empresa.com.br',
    squad: 'DevOps & Cloud',
    role: 'Site Reliability Engineer (SRE)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    activeTickets: 4,
    resolvedToday: 6,
    avgResolutionTime: '1h 40m',
    status: 'ocupado',
  },
  {
    id: 'usr-4',
    name: 'Beatriz Fonseca',
    email: 'beatriz.fonseca@empresa.com.br',
    squad: 'Service Desk (Suporte)',
    role: 'Analista de Suporte Nível 2',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    activeTickets: 5,
    resolvedToday: 11,
    avgResolutionTime: '24m',
    status: 'online',
  },
  {
    id: 'usr-5',
    name: 'Lucas Ferreira',
    email: 'lucas.ferreira@empresa.com.br',
    squad: 'Dados & BI',
    role: 'Engenheiro de Analytics & Data Lake',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    activeTickets: 2,
    resolvedToday: 3,
    avgResolutionTime: '2h 10m',
    status: 'online',
  },
  {
    id: 'usr-6',
    name: 'Juliana Costa',
    email: 'juliana.costa@empresa.com.br',
    squad: 'Engenharia de Software',
    role: 'Tech Lead / Backend',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    activeTickets: 3,
    resolvedToday: 4,
    avgResolutionTime: '1h 55m',
    status: 'plantao',
  }
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TK-8401',
    title: 'Indisponibilidade do Link Principal de Internet - Data Center SP',
    description: 'Circuito dedicado da operadora apresentou perda de pacotes e queda total às 14:15. BGP falhou no failover para o link secundário.',
    squad: 'Infraestrutura & Redes',
    priority: 'P1',
    status: 'em_atendimento',
    requester: {
      name: 'Roberto Miranda',
      department: 'Operações & Logística',
      email: 'roberto.miranda@empresa.com.br',
    },
    assignee: INITIAL_TEAM_MEMBERS[0],
    createdAt: minutesAgo(42),
    updatedAt: minutesAgo(8),
    slaMinutesTotal: 60,
    slaDeadline: minutesFromNow(18), // 18 mins left (Warning)
    slaStatus: 'alerta',
    tags: ['Link Operadora', 'BGP', 'Data Center', 'Crítico'],
    systemAffected: 'Roteador Core Cisco ASR-1001 & Link Embratel',
    activities: [
      {
        id: 'act-1',
        author: 'Roberto Miranda',
        role: 'Solicitante',
        type: 'comment',
        content: 'Chamado aberto com urgência máxima. Unidade fabril SP sem comunicação com o ERP.',
        timestamp: minutesAgo(42),
      },
      {
        id: 'act-2',
        author: 'Carlos Eduardo Ramos',
        role: 'Infraestrutura & Redes',
        type: 'assignment',
        content: 'Chamado assumido. Protocolo 849201 aberto junto ao NOC da operadora.',
        timestamp: minutesAgo(35),
      },
      {
        id: 'act-3',
        author: 'Carlos Eduardo Ramos',
        role: 'Infraestrutura & Redes',
        type: 'status_change',
        content: 'Operadora identificou rompimento de fibra na subestação. Link de contingência Starlink ativado manualmente.',
        timestamp: minutesAgo(8),
      }
    ]
  },
  {
    id: 'TK-8402',
    title: 'Tentativa de Ataque Brute Force e Phishing direcionado à Diretoria',
    description: 'SOC identificou múltiplas tentativas de autenticação anômalas originadas de IPs externos na conta do CFO e tentativa de spoofing.',
    squad: 'Segurança da Informação',
    priority: 'P1',
    status: 'em_atendimento',
    requester: {
      name: 'Sistema Automatizado SIEM',
      department: 'Segurança da Informação',
      email: 'soc-alertas@empresa.com.br',
    },
    assignee: INITIAL_TEAM_MEMBERS[1],
    createdAt: minutesAgo(28),
    updatedAt: minutesAgo(5),
    slaMinutesTotal: 45,
    slaDeadline: minutesFromNow(17),
    slaStatus: 'alerta',
    tags: ['SIEM', 'Phishing', 'Bloqueio de IP', 'CFO'],
    systemAffected: 'Microsoft Entra ID / Conditional Access',
    activities: [
      {
        id: 'act-4',
        author: 'Sistema Automatizado SIEM',
        role: 'Automação SOC',
        type: 'sla_alert',
        content: 'Alerta de severidade alta: 120 falhas de login em 2 minutos via VPN.',
        timestamp: minutesAgo(28),
      },
      {
        id: 'act-5',
        author: 'Mariana Silveira',
        role: 'SecOps Lead',
        type: 'comment',
        content: 'Sessões revogadas preventivamente. MFA resetado e bloco de IPs da Europa Oriental adicionado ao WAF.',
        timestamp: minutesAgo(5),
      }
    ]
  },
  {
    id: 'TK-8403',
    title: 'Falha no Deploy do Cluster Kubernetes EKS - 502 Bad Gateway no Checkout',
    description: 'Após publicação da release v2.44, pods do microsserviço de pagamentos entraram em CrashLoopBackOff por erro de variável de ambiente.',
    squad: 'DevOps & Cloud',
    priority: 'P1',
    status: 'aberto',
    requester: {
      name: 'Lucas Siqueira',
      department: 'E-commerce & Vendas',
      email: 'lucas.siqueira@empresa.com.br',
    },
    createdAt: minutesAgo(12),
    updatedAt: minutesAgo(12),
    slaMinutesTotal: 30,
    slaDeadline: minutesFromNow(18),
    slaStatus: 'normal',
    tags: ['EKS', 'Kubernetes', 'Checkout', 'P1'],
    systemAffected: 'AWS EKS Prod Cluster / Pagamentos API',
    activities: [
      {
        id: 'act-6',
        author: 'Lucas Siqueira',
        role: 'Gerente E-commerce',
        type: 'comment',
        content: 'Clientes relatando erro 502 ao clicar em finalizar compra no app.',
        timestamp: minutesAgo(12),
      }
    ]
  },
  {
    id: 'TK-8398',
    title: 'Instalação de Certificado Digital A1 e Configuração de VPN - Diretoria',
    description: 'Necessário renovar o certificado digital ICP-Brasil e configurar acesso VPN no notebook corporativo do novo Diretor de Operações.',
    squad: 'Service Desk (Suporte)',
    priority: 'P2',
    status: 'em_atendimento',
    requester: {
      name: 'Helena Gusmão',
      department: 'Secretaria Executiva',
      email: 'helena.gusmao@empresa.com.br',
    },
    assignee: INITIAL_TEAM_MEMBERS[3],
    createdAt: minutesAgo(110),
    updatedAt: minutesAgo(22),
    slaMinutesTotal: 180,
    slaDeadline: minutesFromNow(70),
    slaStatus: 'normal',
    tags: ['Certificado A1', 'VPN', 'VIP Diretoria'],
    systemAffected: 'Notebook Dell Latitude 7440 / FortiClient VPN',
    activities: [
      {
        id: 'act-7',
        author: 'Helena Gusmão',
        role: 'Secretaria Executiva',
        type: 'comment',
        content: 'Diretor precisa assinar contratos emergenciais com cartório até as 17h.',
        timestamp: minutesAgo(110),
      },
      {
        id: 'act-8',
        author: 'Beatriz Fonseca',
        role: 'Service Desk N2',
        type: 'comment',
        content: 'Atendimento presencial no 8º andar iniciado. Certificado instalado e testado com sucesso.',
        timestamp: minutesAgo(22),
      }
    ]
  },
  {
    id: 'TK-8395',
    title: 'Lentidão nas Rotinas de ETL Noturnas e Dashboards do Power BI Desatualizados',
    description: 'Cargas de dados do Snowflake demoraram 6 horas acima da média. Gestores comerciais sem os relatórios diários de faturamento matinal.',
    squad: 'Dados & BI',
    priority: 'P2',
    status: 'pendente',
    requester: {
      name: 'Guilherme Toledo',
      department: 'Controladoria & Finanças',
      email: 'guilherme.toledo@empresa.com.br',
    },
    assignee: INITIAL_TEAM_MEMBERS[4],
    createdAt: minutesAgo(195),
    updatedAt: minutesAgo(40),
    slaMinutesTotal: 240,
    slaDeadline: minutesFromNow(45),
    slaStatus: 'normal',
    tags: ['Snowflake', 'Power BI', 'ETL', 'Finanças'],
    systemAffected: 'Snowflake Enterprise Warehouse / Azure Data Factory',
    activities: [
      {
        id: 'act-9',
        author: 'Guilherme Toledo',
        role: 'Controladoria',
        type: 'comment',
        content: 'Diretor financeiro solicitou reunião de fechamento mas os dados não batem.',
        timestamp: minutesAgo(195),
      },
      {
        id: 'act-10',
        author: 'Lucas Ferreira',
        role: 'Engenheiro de Dados',
        type: 'comment',
        content: 'Houve um deadlock na tabela de conciliação bancária. Re-execução manual em andamento com warehouse ampliado.',
        timestamp: minutesAgo(40),
      }
    ]
  },
  {
    id: 'TK-8389',
    title: 'Bug na Sincronização de Pedidos do Portal B2B com o SAP S/4HANA',
    description: 'Integração de mensagens Kafka apresentou timeout intermitente na fila de pedidos com status "Aguardando Aprovação de Crédito".',
    squad: 'Engenharia de Software',
    priority: 'P2',
    status: 'em_atendimento',
    requester: {
      name: 'Vanessa Brandão',
      department: 'Comercial B2B',
      email: 'vanessa.brandao@empresa.com.br',
    },
    assignee: INITIAL_TEAM_MEMBERS[5],
    createdAt: minutesAgo(280),
    updatedAt: minutesAgo(15),
    slaMinutesTotal: 240,
    slaDeadline: minutesAgo(40), // SLA Estourado!
    slaStatus: 'estourado',
    tags: ['SAP S/4HANA', 'Kafka', 'Integração', 'Pedidos'],
    systemAffected: 'SAP RFC Connector & Apache Kafka Broker',
    activities: [
      {
        id: 'act-11',
        author: 'Vanessa Brandão',
        role: 'Comercial B2B',
        type: 'comment',
        content: '14 pedidos travados desde as 10h da manhã.',
        timestamp: minutesAgo(280),
      },
      {
        id: 'act-12',
        author: 'Juliana Costa',
        role: 'Tech Lead',
        type: 'comment',
        content: 'Aplicando patch corretivo no consumidor da fila Kafka. Previsão de normalização em 25 minutos.',
        timestamp: minutesAgo(15),
      }
    ]
  },
  {
    id: 'TK-8380',
    title: 'Configuração de Monitoramento e Logs no Datadog para Novos Microsserviços',
    description: 'Criação de monitores de latência p99, taxa de erro HTTP 5xx e dashboards executivos para a nova API de Pix.',
    squad: 'DevOps & Cloud',
    priority: 'P3',
    status: 'resolvido',
    requester: {
      name: 'Juliana Costa',
      department: 'Engenharia de Software',
      email: 'juliana.costa@empresa.com.br',
    },
    assignee: INITIAL_TEAM_MEMBERS[2],
    createdAt: minutesAgo(410),
    updatedAt: minutesAgo(65),
    slaMinutesTotal: 480,
    slaDeadline: minutesFromNow(70),
    slaStatus: 'normal',
    firstContactResolved: true,
    csatRating: 5,
    resolutionNotes: 'Todos os monitores Datadog criados com alertas integrados ao canal Slack #alerta-pagamentos e PagerDuty.',
    resolvedAt: minutesAgo(65),
    tags: ['Datadog', 'Observabilidade', 'APM'],
    systemAffected: 'Datadog APM & AWS CloudWatch',
    activities: [
      {
        id: 'act-13',
        author: 'Thiago Martins',
        role: 'SRE Lead',
        type: 'resolution',
        content: 'Dashboards validados junto ao time de engenharia. Métricas p95 e p99 configuradas.',
        timestamp: minutesAgo(65),
      }
    ]
  },
  {
    id: 'TK-8374',
    title: 'Criação de Usuário e Acesso ao ERP SAP para Nova Analista Contábil',
    description: 'Configuração de perfil FI-CO, permissões de centros de custo e concessão de licença no Microsoft 365 e Teams.',
    squad: 'Service Desk (Suporte)',
    priority: 'P3',
    status: 'resolvido',
    requester: {
      name: 'Marcos Vinicius',
      department: 'Recursos Humanos / Onboarding',
      email: 'marcos.rh@empresa.com.br',
    },
    assignee: INITIAL_TEAM_MEMBERS[3],
    createdAt: minutesAgo(520),
    updatedAt: minutesAgo(120),
    slaMinutesTotal: 360,
    slaDeadline: minutesAgo(160),
    slaStatus: 'normal',
    firstContactResolved: true,
    csatRating: 5,
    resolutionNotes: 'Usuário provisionado com sucesso via Active Directory e SAP GRC aprovado pela gerência.',
    resolvedAt: minutesAgo(120),
    tags: ['Onboarding', 'SAP FI-CO', 'Active Directory'],
    systemAffected: 'SAP ECC & Microsoft Entra ID',
    activities: [
      {
        id: 'act-14',
        author: 'Beatriz Fonseca',
        role: 'Service Desk N2',
        type: 'resolution',
        content: 'Credenciais enviadas com segurança ao gestor imediato.',
        timestamp: minutesAgo(120),
      }
    ]
  },
  {
    id: 'TK-8368',
    title: 'Substituição de Switch de Borda no Setor de Atendimento ao Cliente',
    description: 'Equipamento de 24 portas apresentou queima de fonte após oscilação elétrica no painel secundário.',
    squad: 'Infraestrutura & Redes',
    priority: 'P2',
    status: 'resolvido',
    requester: {
      name: 'Camila Peixoto',
      department: 'SAC / Atendimento',
      email: 'camila.sac@empresa.com.br',
    },
    assignee: INITIAL_TEAM_MEMBERS[0],
    createdAt: minutesAgo(600),
    updatedAt: minutesAgo(180),
    slaMinutesTotal: 240,
    slaDeadline: minutesAgo(360),
    slaStatus: 'normal',
    firstContactResolved: false,
    csatRating: 4,
    resolutionNotes: 'Switch sobressalente Ubiquiti configurado com as VLANs 10, 20 e 30 e instalado no rack.',
    resolvedAt: minutesAgo(180),
    tags: ['Hardware', 'Redes', 'Switch', 'SAC'],
    systemAffected: 'Rack B2 - 3º Andar',
    activities: [
      {
        id: 'act-15',
        author: 'Carlos Eduardo Ramos',
        role: 'Infraestrutura',
        type: 'resolution',
        content: 'Equipamento substituído e conectividade das 22 posições de atendimento restabelecida.',
        timestamp: minutesAgo(180),
      }
    ]
  },
  {
    id: 'TK-8404',
    title: 'Solicitação de Liberação de Permissão de Leitura em Bucket S3 Raw Data',
    description: 'Cientista de dados necessita de acesso temporário aos dados anonimizados de telemetria de veículos.',
    squad: 'Segurança da Informação',
    priority: 'P4',
    status: 'aberto',
    requester: {
      name: 'Fernando Rocha',
      department: 'Inteligência de Mercado',
      email: 'fernando.rocha@empresa.com.br',
    },
    createdAt: minutesAgo(20),
    updatedAt: minutesAgo(20),
    slaMinutesTotal: 480,
    slaDeadline: minutesFromNow(460),
    slaStatus: 'normal',
    tags: ['IAM', 'AWS S3', 'LGPD', 'Acesso'],
    systemAffected: 'AWS IAM Policy / Data Lake',
    activities: [
      {
        id: 'act-16',
        author: 'Fernando Rocha',
        role: 'Solicitante',
        type: 'comment',
        content: 'Acesso já aprovado pelo DPO conforme ticket de governança GOV-3012.',
        timestamp: minutesAgo(20),
      }
    ]
  }
];

// Pool of incoming dynamic tickets for simulation
export const SIMULATED_INCOMING_TICKETS: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'slaDeadline' | 'activities'>[] = [
  {
    title: 'Alerta de Consumo Crítico de Memória RAM no Servidor de Banco Oracle',
    description: 'Instância de produção atingiu 94% de alocação de SGA. Risco iminente de crash nos fechamentos contábeis.',
    squad: 'Infraestrutura & Redes',
    priority: 'P1',
    status: 'aberto',
    requester: {
      name: 'Zabbix Monitor Agent',
      department: 'NOC TI',
      email: 'noc-auto@empresa.com.br'
    },
    slaMinutesTotal: 45,
    slaStatus: 'normal',
    tags: ['Oracle DB', 'RAM', 'Zabbix', 'P1'],
    systemAffected: 'DB-PROD-01 (Oracle 19c Enterprise)'
  },
  {
    title: 'Falha de Autenticação em Massa no Portal de Chamados para Usuários Remotos',
    description: 'Usuários do escritório regional de Curitiba relatam erro 401 Unauthorized após sincronização de certificados SAML.',
    squad: 'Segurança da Informação',
    priority: 'P2',
    status: 'aberto',
    requester: {
      name: 'Débora Lemos',
      department: 'Regional Sul',
      email: 'debora.lemos@empresa.com.br'
    },
    slaMinutesTotal: 120,
    slaStatus: 'normal',
    tags: ['SAML', 'SSO', 'Regional Sul'],
    systemAffected: 'Keycloak SSO / Portal Corporativo'
  },
  {
    title: 'Instalação de Segundo Monitor e Docking Station USB-C - Depto de Engenharia',
    description: 'Engenheiro recém-admitido necessita de setup com dois monitores 4K para modelagem CAD.',
    squad: 'Service Desk (Suporte)',
    priority: 'P4',
    status: 'aberto',
    requester: {
      name: 'Leonardo Dias',
      department: 'Engenharia de Produto',
      email: 'leonardo.dias@empresa.com.br'
    },
    slaMinutesTotal: 480,
    slaStatus: 'normal',
    tags: ['Hardware', 'Docking', 'Setup'],
    systemAffected: 'Estação de Trabalho 412'
  }
];
