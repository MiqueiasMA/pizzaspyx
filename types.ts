
export enum LeadStatus {
  NEW = 'novo',
  CONTACTED = 'contactado',
  NEGOTIATING = 'negociando',
  CONVERTED = 'convertido'
}

export interface Lead {
  id: string;
  nome: string;
  endereco: string;
  nota: number | string;
  reviews: number | string;
  whatsapp?: string;
  website?: string;
  insight: string;
  status: LeadStatus;
  dateAdded: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}
