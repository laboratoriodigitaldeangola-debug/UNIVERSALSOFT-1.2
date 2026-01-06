
export interface Broker {
  id: string;
  nome: string;
  nif: string;
  telefone: string;
  telefoneAlt?: string;
  endereco: string;
  email: string;
  website?: string;
  coordenadasBancarias: string;
  logoUrl?: string;
  regimeFiscal: 'GERAL' | 'EXCLUSAO';
  bancoNome?: string;
  contaNumero?: string;
  provincia?: string;
  municipio?: string;
  status: 'active' | 'pending' | 'inactive';
  activatedAt?: string;
  activatedBy?: string;
}

export interface Permission {
  id: string;
  label: string;
  module: string;
  description: string;
}

export interface AccessProfile {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // IDs das permissões
  isSystem?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
  resourceId?: string;
}

export interface SystemUser {
  id: string;
  email: string;
  fullName: string;
  role: string; // Refere-se ao AccessProfile.id ou 'admin'/'user'
  status: 'active' | 'pending' | 'inactive';
  createdAt: string;
  activatedAt?: string;
  activatedBy?: string;
}

export interface ManagedClient {
  id: string;
  tipo: 'colectivo' | 'individual';
  nome: string;
  nif: string;
  endereco: string;
  telefone?: string;
  email?: string;
  observacoes?: string;
  status: 'active' | 'inactive';
}

export interface ManagedProduct {
  id: string;
  tipo: 'produto' | 'serviço';
  codigo: string;
  descricao: string;
  precoUnitario: number;
  unidade: string;
  taxaIVA: number;
  status: 'active' | 'inactive';
}

export interface SaftSubmission {
  id: string;
  companyId: string;
  companyName: string;
  nif: string;
  mes: number;
  ano: number;
  tipo: 'Normal' | 'Substituição';
  dataGeracao: string;
  dataSubmissao?: string;
  comprovativoNr?: string;
  estado: 'Gerado' | 'Submetido' | 'Rejeitado';
  utilizador: string;
  xmlUrl?: string;
}

export interface Client {
  nome: string;
  nif: string;
  endereco: string;
  email: string;
}

export interface InvoiceItem {
  id: string;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
}

export type TemplateId = 'classic' | 'simplified' | 'corporate';

export interface Invoice {
  id: string;
  numero: string;
  data: string;
  vencimento: string;
  broker: Broker;
  client: Client;
  items: InvoiceItem[];
  taxaIVA: number;
  taxaRetencao: number;
  notas: string;
  templateId: TemplateId;
}

export interface BackupStatus {
  lastLocal: string | null;
  lastCloud: string | null;
  isSyncing: boolean;
}

export const DEFAULT_BROKER: Broker = {
  id: "emp-001",
  nome: "NOME DA SUA EMPRESA, LDA",
  nif: "5000000000",
  telefone: "+244 900 000 000",
  telefoneAlt: "",
  endereco: "Endereço da Sede, Luanda, Angola",
  email: "contacto@empresa.ao",
  coordenadasBancarias: "AO06 0000 0000 0000 0000 0000 0",
  logoUrl: "",
  regimeFiscal: 'GERAL',
  bancoNome: 'BFA',
  status: 'active'
};

export const INITIAL_INVOICE: Invoice = {
  id: crypto.randomUUID(),
  numero: `FT ${new Date().getFullYear()}/001`,
  data: new Date().toISOString().split('T')[0],
  vencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  broker: DEFAULT_BROKER,
  client: {
    nome: "",
    nif: "",
    endereco: "",
    email: ""
  },
  items: [
    {
      id: "1",
      descricao: "Prestação de Serviços Gerais",
      quantidade: 1,
      precoUnitario: 0
    }
  ],
  taxaIVA: 14,
  taxaRetencao: 6.5,
  notas: "Agradecemos a preferência pelos nossos serviços.",
  templateId: 'classic'
};
