// Tipos TypeScript para a API HelenaCRM

export interface Panel {
  id: string
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface Card {
  // Identificação
  id: string
  title: string  
  key: string
  number: number
  
  // Painel e etapa
  panelId: string
  panelTitle?: string | null
  stepId: string
  stepTitle?: string | null
  stepPhase?: string | null
  position: number
  
  // Descrição e valor
  description?: string | null
  monetaryAmount?: number | null // Valor em R$
  
  // Status e datas
  isOverdue: boolean
  dueDate?: string | null
  archived: boolean
  createdAt: string
  updatedAt: string
  
  // Responsável (vendedor)
  responsibleUserId?: string | null
  responsibleUser?: any | null
  
  // Contatos
  contactIds: string[]
  contacts?: any[] | null
  
  // Outros
  companyId: string
  tagIds: string[]
  sessionId?: string | null
  customFields?: any | null
  metadata?: any | null
  
  // Campos legados (compatibilidade)
  name?: string
  stage?: string
  value?: number
  status?: string
  assignedTo?: string
  contactId?: string
  channel?: string
  lostReason?: string
  product?: string
}

export interface Stage {
  id: string
  name: string
  order: number
  cardCount?: number
  totalValue?: number
}

export interface Contact {
  id: string
  name: string
  phone?: string
  email?: string
  channel?: string
  createdAt?: string
  updatedAt?: string
}

export interface User {
  id: string
  name: string
  email?: string
  role?: string
}

export interface Channel {
  id: string
  name: string
  type: 'meta' | 'google' | 'whatsapp'
}

export interface DashboardFilters {
  startDate?: string
  endDate?: string
  userId?: string
  channelId?: string
  panelId?: string
}

export interface FunnelMetrics {
  stage: string
  leads: number
  value: number
  conversionRate: number
  averageTime: number
}

export interface RevenueMetrics {
  totalRevenue: number
  averageTicket: number
  revenueBySeller: Record<string, number>
  revenueByChannel: Record<string, number>
}

export interface ConversionMetrics {
  overallConversionRate: number
  averageSalesCycle: number
  averageResponseTime: number
}

export interface PanelResponse {
  items: Panel[]
  totalItems?: number
  totalPages?: number
  pageNumber?: number
  pageSize?: number
}

export interface CardResponse {
  items: Card[]
  totalItems?: number
  totalPages?: number
  pageNumber?: number
  pageSize?: number
}

export interface ContactResponse {
  items: Contact[]
  totalItems?: number
  totalPages?: number
  pageNumber?: number
  pageSize?: number
}

export interface UserResponse {
  items: User[]
  totalItems?: number
  totalPages?: number
  pageNumber?: number
  pageSize?: number
}

