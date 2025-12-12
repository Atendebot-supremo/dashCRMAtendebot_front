// Tipos para o CRM baseados na documentação do backend

export interface Panel {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  steps: PanelStep[]
}

export interface PanelStep {
  id: string
  title: string
  phase: string
  position: number
}

export interface Card {
  id: string
  title: string
  key: string
  number: number
  panelId: string
  panelTitle: string | null
  stepId: string
  stepTitle: string | null
  stepPhase: string | null
  position: number
  description: string
  monetaryAmount: number | null
  isOverdue: boolean
  dueDate: string | null
  archived: boolean
  createdAt: string
  updatedAt: string
  responsibleUserId: string
  responsibleUser: Agent | null
  contactIds: string[]
  contacts: Contact[]
  companyId: string
  tagIds: string[]
  sessionId: string | null
  customFields: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
}

export interface Agent {
  id: string
  createdAt: string
  updatedAt: string
  companyId: string
  userId: string
  name: string
  shortName: string
  email: string
  phoneNumber: string
  phoneNumberFormatted: string
  profile: string
  isOwner: boolean
  departments: AgentDepartment[]
}

export interface AgentDepartment {
  agentId: string
  departmentId: string
  isAgent: boolean
  isSupervisor: boolean
}

export interface Contact {
  id: string
  name: string
  phone?: string
  email?: string
}

// Responses da API
export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export interface PaginatedData<T> {
  items: T[]
  pagination: {
    totalItems: number
    totalPages: number
    pageNumber: number
    pageSize: number
  }
}

export interface ListData<T> {
  items: T[]
  totalItems: number
}

// Parâmetros de filtro
export interface GetCardsParams {
  panelId: string
  startDate?: string
  endDate?: string
  userId?: string
  channelId?: string
  stepId?: string
  page?: number
  pageSize?: number
}

export interface DashboardFilters {
  panelId?: string
  startDate?: string
  endDate?: string
  userId?: string
  channelId?: string
}

// Dados do usuário logado
export interface AuthUser {
  id: string
  name: string
  phone: string
  userName?: string
  email?: string
}

export interface HelenaData {
  userId: string
  accessToken: string
  expiresIn: string
  refreshToken: string
  tenantId: string
  urlRedirect: string
}

export interface LoginResponseData {
  token: string
  helena: HelenaData
  user: AuthUser
}

