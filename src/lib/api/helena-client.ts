import type {
  Panel,
  Card,
  Agent,
  ApiResponse,
  ListData,
  PaginatedData,
  GetCardsParams,
} from '@/types/crm'

// URL base da API Backend (SEM /api no final)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

console.log('🔧 [API] Configuração inicializada:', {
  apiUrl: API_URL,
  isDev: import.meta.env.DEV,
})

class HelenaAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'HelenaAPIError'
  }
}

// Função para obter headers com autenticação
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token')
  
  if (!token) {
    throw new HelenaAPIError('Token não encontrado. Faça login novamente.', 401, 'UNAUTHORIZED')
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}

// Função para fazer requisições autenticadas
const fetchWithAuth = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_URL}${endpoint}`

  console.log(`🚀 [API] Fazendo requisição:`, {
    method: options.method || 'GET',
    url,
    endpoint,
  })

  try {
    const headers = getAuthHeaders()
    const startTime = Date.now()
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })
    
    const duration = Date.now() - startTime

    console.log(`⏱️ [API] Resposta recebida em ${duration}ms:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      endpoint,
    })

    if (!response.ok) {
      // Token expirado ou inválido
      if (response.status === 401) {
        console.error('❌ [API] Token inválido ou expirado, redirecionando para login...')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        window.location.href = '/login'
        throw new HelenaAPIError('Sessão expirada. Por favor, faça login novamente.', 401, 'UNAUTHORIZED')
      }

      // Rate limit
      if (response.status === 429) {
        throw new HelenaAPIError('Muitas requisições. Aguarde alguns minutos.', 429, 'TOO_MANY_REQUESTS')
      }

      let errorMessage = `Erro na requisição: ${response.status}`
      let errorCode = 'UNKNOWN_ERROR'
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
        errorCode = errorData.code || errorCode
      } catch {
        // Se não conseguir parsear o JSON, usar a mensagem padrão
      }

      throw new HelenaAPIError(errorMessage, response.status, errorCode)
    }

    const data = await response.json()

    console.log(`✅ [API] Dados recebidos:`, {
      endpoint,
      success: data.success,
      hasData: !!data.data,
    })

    // A API retorna { success, data, message }
    // Retornamos apenas os dados
    if (data.success === false) {
      throw new HelenaAPIError(data.error || data.message || 'Erro desconhecido', response.status, data.code)
    }

    return data.data as T
  } catch (error) {
    if (error instanceof HelenaAPIError) {
      console.error(`❌ [API] Erro na requisição:`, {
        endpoint,
        error: error.message,
        status: error.status,
        code: error.code,
      })
      throw error
    }

    console.error(`❌ [API] Erro de rede:`, {
      endpoint,
      error: error instanceof Error ? error.message : error,
    })
    
    throw new HelenaAPIError(
      `Erro de rede: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      0,
      'NETWORK_ERROR'
    )
  }
}

export const helenaClient = {
  // ========================================
  // PAINÉIS
  // ========================================
  
  /**
   * Lista todos os painéis CRM do usuário autenticado
   * GET /api/crm/panels
   */
  async getPanels(): Promise<ListData<Panel>> {
    console.log('📋 [API] Buscando painéis...')
    const result = await fetchWithAuth<ListData<Panel>>('/api/crm/panels')
    console.log(`📋 [API] Painéis encontrados: ${result.items?.length || 0}`)
    return result
  },

  /**
   * Obtém detalhes de um painel específico
   * GET /api/crm/panels/:id
   */
  async getPanelById(panelId: string): Promise<Panel> {
    console.log('📋 [API] Buscando painel:', panelId)
    const result = await fetchWithAuth<Panel>(`/api/crm/panels/${panelId}`)
    console.log('📋 [API] Painel recebido:', result.name)
    return result
  },

  // ========================================
  // CARDS
  // ========================================

  /**
   * Lista cards com filtros opcionais
   * GET /api/crm/cards?panelId=xxx&startDate=xxx&endDate=xxx
   */
  async getCards(params: GetCardsParams): Promise<PaginatedData<Card>> {
    console.log('🎴 [API] Buscando cards...', { params })
    
    const queryParams = new URLSearchParams()
    
    // panelId é obrigatório
    queryParams.append('panelId', params.panelId)
    
    if (params.startDate) queryParams.append('startDate', params.startDate)
    if (params.endDate) queryParams.append('endDate', params.endDate)
    if (params.userId) queryParams.append('userId', params.userId)
    if (params.channelId) queryParams.append('channelId', params.channelId)
    if (params.stepId) queryParams.append('stepId', params.stepId)
    if (params.page) queryParams.append('page', String(params.page))
    if (params.pageSize) queryParams.append('pageSize', String(params.pageSize))

    const endpoint = `/api/crm/cards?${queryParams.toString()}`
    const result = await fetchWithAuth<PaginatedData<Card>>(endpoint)
    
    console.log(`🎴 [API] Cards encontrados: ${result.items?.length || 0}`)
    return result
  },

  /**
   * Obtém detalhes de um card específico
   * GET /api/crm/cards/:id
   */
  async getCardById(cardId: string): Promise<Card> {
    console.log('🎴 [API] Buscando card:', cardId)
    const result = await fetchWithAuth<Card>(`/api/crm/cards/${cardId}`)
    console.log('🎴 [API] Card recebido:', result.title)
    return result
  },

  // ========================================
  // AGENTES
  // ========================================

  /**
   * Lista agentes de um painel
   * GET /api/crm/agents?panelId=xxx
   */
  async getAgents(panelId: string): Promise<ListData<Agent>> {
    console.log('👥 [API] Buscando agentes...')
    const params = new URLSearchParams({ panelId })
    const result = await fetchWithAuth<ListData<Agent>>(`/api/crm/agents?${params}`)
    console.log(`👥 [API] Agentes encontrados: ${result.items?.length || 0}`)
    return result
  },

  /**
   * Obtém detalhes de um agente específico
   * GET /api/crm/agents/:id
   */
  async getAgentById(agentId: string): Promise<Agent> {
    console.log('👥 [API] Buscando agente:', agentId)
    const result = await fetchWithAuth<Agent>(`/api/crm/agents/${agentId}`)
    console.log('👥 [API] Agente recebido:', result.name)
    return result
  },
}

export { HelenaAPIError }
