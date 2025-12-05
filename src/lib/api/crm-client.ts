const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  console.error('❌ VITE_API_URL não está configurada no .env')
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  success: false
  error: string
  code?: string
  details?: unknown[]
}

export interface Panel {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
  companyId: string
  archived: boolean
  scope?: string
  departmentIds?: string[] | null
  userId?: string
  thumbnailId?: string | null
  thumbnailFile?: string | null
  key?: string
  overdueCardCount?: number
  stepTitles?: string[] | null
  tags?: any[] | null
  steps: Array<{
    id: string
    title: string
    phase: string
    position: number
  }>
}

export interface PanelsResponse {
  items: Panel[]
  totalItems: number
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
  responsibleUser: any | null
  contactIds: string[]
  contacts: any[]
  companyId: string
  tagIds: string[]
  sessionId: string | null
  customFields: any | null
  metadata: any | null
}

export interface CardsResponse {
  items: Card[]
  pagination: {
    totalItems: number
    totalPages: number
    pageNumber: number
    pageSize: number
  }
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
  departments: Array<{
    agentId: string
    departmentId: string
    isAgent: boolean
    isSupervisor: boolean
  }>
}

export interface AgentsResponse {
  items: Agent[]
  totalItems: number
}

export interface CardsFilters {
  panelId: string
  startDate?: string
  endDate?: string
  userId?: string
  channelId?: string
  stepId?: string
  page?: number
  pageSize?: number
}

const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken')
}

const handleApiError = async (response: Response): Promise<never> => {
  let errorData: ApiError
  try {
    errorData = await response.json()
  } catch {
    throw new Error(`Erro ${response.status}: ${response.statusText}`)
  }

  // Se for erro 401, remover token e redirecionar para login
  if (response.status === 401) {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('helena')
    window.location.href = '/login'
  }

  throw new Error(errorData.error || 'Erro na requisição')
}

const fetchWithAuth = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken()

  if (!token) {
    console.error('❌ [CRM API] Token não encontrado no localStorage')
    throw new Error('Token não encontrado. Faça login novamente.')
  }

  const url = `${API_URL}${endpoint}`
  const method = options.method || 'GET'
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token.substring(0, 20)}...`, // Log apenas parte do token por segurança
    ...options.headers,
  }

  console.group(`🚀 [CRM API] ${method} ${endpoint}`)
  console.log('📍 URL completa:', url)
  console.log('🌐 API_URL:', API_URL)
  console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'NÃO ENCONTRADO')
  console.log('📤 Method:', method)
  console.log('📋 Headers:', {
    'Content-Type': headers['Content-Type'],
    'Authorization': headers['Authorization'],
  })
  
  if (options.body) {
    try {
      const bodyObj = typeof options.body === 'string' 
        ? JSON.parse(options.body) 
        : options.body
      console.log('📦 Request Body:', bodyObj)
    } catch {
      console.log('📦 Request Body:', options.body)
    }
  }
  
  console.log('⏰ Timestamp:', new Date().toISOString())
  
  const startTime = Date.now()

  try {
    // Usar token completo na requisição real
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers: requestHeaders,
    })

    const duration = Date.now() - startTime

    console.log('📥 Response Status:', response.status, response.statusText)
    console.log('⏱️ Duration:', `${duration}ms`)
    console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error Response:', errorText)
      console.groupEnd()
      await handleApiError(response)
    }

    const data: ApiResponse<T> = await response.json()

    console.log('✅ Response Data:', {
      success: data.success,
      message: data.message,
      dataType: Array.isArray(data.data) 
        ? `Array[${(data.data as any[]).length}]` 
        : typeof data.data,
      dataPreview: Array.isArray(data.data)
        ? `Primeiros 3 itens: ${JSON.stringify((data.data as any[]).slice(0, 3), null, 2)}`
        : (typeof data.data === 'object' && data.data !== null
          ? `Keys: ${Object.keys(data.data).join(', ')}`
          : data.data),
    })

    if (!data.success) {
      console.error('❌ API retornou success: false', data.message)
      console.groupEnd()
      throw new Error(data.message || 'Erro na requisição')
    }

    console.log('✅ Requisição concluída com sucesso!')
    console.groupEnd()

    return data.data
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('❌ [CRM API] Erro na requisição:', {
      endpoint,
      method,
      url,
      error: error instanceof Error ? error.message : error,
      errorStack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`,
    })
    console.groupEnd()
    throw error
  }
}

export const crmClient = {
  // Painéis
  async getPanels(): Promise<PanelsResponse> {
    console.log('📋 [CRM Client] getPanels() chamado')
    const data = await fetchWithAuth<PanelsResponse>('/api/crm/panels')
    console.log('📋 [CRM Client] getPanels() retornou:', {
      totalItems: data.totalItems,
      itemsCount: data.items?.length || 0,
    })
    return data
  },

  async getPanelById(id: string): Promise<Panel> {
    console.log('📋 [CRM Client] getPanelById() chamado com id:', id)
    const data = await fetchWithAuth<Panel>(`/api/crm/panels/${id}`)
    console.log('📋 [CRM Client] getPanelById() retornou:', {
      id: data.id,
      name: data.name,
      stepsCount: data.steps?.length || 0,
    })
    return data
  },

  // Cards
  async getCards(filters: CardsFilters): Promise<CardsResponse> {
    console.log('🎴 [CRM Client] getCards() chamado com filters:', filters)
    
    const params = new URLSearchParams()
    
    // panelId é obrigatório
    params.append('panelId', filters.panelId)
    
    if (filters.startDate) {
      params.append('startDate', filters.startDate)
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate)
    }
    if (filters.userId) {
      params.append('userId', filters.userId)
    }
    if (filters.channelId) {
      params.append('channelId', filters.channelId)
    }
    if (filters.stepId) {
      params.append('stepId', filters.stepId)
    }
    if (filters.page) {
      params.append('page', String(filters.page))
    }
    if (filters.pageSize) {
      params.append('pageSize', String(filters.pageSize))
    }

    const queryString = params.toString()
    const endpoint = `/api/crm/cards${queryString ? `?${queryString}` : ''}`
    
    console.log('🎴 [CRM Client] Query string:', queryString)
    
    const data = await fetchWithAuth<CardsResponse>(endpoint)
    
    console.log('🎴 [CRM Client] getCards() retornou:', {
      totalItems: data.pagination?.totalItems || 0,
      itemsCount: data.items?.length || 0,
      page: data.pagination?.pageNumber,
      pageSize: data.pagination?.pageSize,
    })
    
    return data
  },

  async getCardById(id: string): Promise<Card> {
    console.log('🎴 [CRM Client] getCardById() chamado com id:', id)
    const data = await fetchWithAuth<Card>(`/api/crm/cards/${id}`)
    console.log('🎴 [CRM Client] getCardById() retornou:', {
      id: data.id,
      title: data.title,
      key: data.key,
    })
    return data
  },

  // Agentes
  async getAgents(panelId: string): Promise<AgentsResponse> {
    console.log('👥 [CRM Client] getAgents() chamado com panelId:', panelId)
    const params = new URLSearchParams()
    params.append('panelId', panelId)
    
    const data = await fetchWithAuth<AgentsResponse>(`/api/crm/agents?${params.toString()}`)
    
    console.log('👥 [CRM Client] getAgents() retornou:', {
      totalItems: data.totalItems,
      itemsCount: data.items?.length || 0,
    })
    
    return data
  },

  async getAgentById(id: string): Promise<Agent> {
    console.log('👥 [CRM Client] getAgentById() chamado com id:', id)
    const data = await fetchWithAuth<Agent>(`/api/crm/agents/${id}`)
    console.log('👥 [CRM Client] getAgentById() retornou:', {
      id: data.id,
      name: data.name,
      email: data.email,
    })
    return data
  },
}


