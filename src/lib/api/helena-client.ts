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
    console.log(`✅ [API] Resposta completa:`, JSON.stringify(data, null, 2))

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
    console.log('📋 [API] ==========================================')
    console.log('📋 [API] GET /api/crm/panels')
    console.log('📋 [API] Buscando painéis...')
    const result = await fetchWithAuth<ListData<Panel>>('/api/crm/panels')
    console.log(`📋 [API] ✅ Painéis encontrados: ${result.items?.length || 0}`)
    console.log('📋 [API] Dados completos:', JSON.stringify(result, null, 2))
    console.log('📋 [API] ==========================================')
    return result
  },

  /**
   * Obtém detalhes de um painel específico
   * GET /api/crm/panels/:id
   */
  async getPanelById(panelId: string): Promise<Panel> {
    console.log('📋 [API] ==========================================')
    console.log(`📋 [API] GET /api/crm/panels/${panelId}`)
    console.log('📋 [API] Buscando painel:', panelId)
    const result = await fetchWithAuth<Panel>(`/api/crm/panels/${panelId}`)
    console.log('📋 [API] ✅ Painel recebido:', result.title || result.name || panelId)
    console.log(`📋 [API] Total de etapas (steps): ${result.steps?.length || 0}`)
    console.log('📋 [API] Etapas (steps):', JSON.stringify(result.steps, null, 2))
    console.log('📋 [API] Dados completos do painel:', JSON.stringify(result, null, 2))
    console.log('📋 [API] ==========================================')
    return result
  },

  // ========================================
  // CARDS
  // ========================================

  /**
   * Lista cards com filtros opcionais - BUSCA TODAS AS PÁGINAS
   * GET /api/crm/cards?panelId=xxx&startDate=xxx&endDate=xxx
   */
  async getCards(params: GetCardsParams): Promise<PaginatedData<Card>> {
    console.log('🎴 [API] ==========================================')
    console.log('🎴 [API] GET /api/crm/cards (BUSCANDO TODAS AS PÁGINAS)')
    console.log('🎴 [API] Parâmetros:', JSON.stringify(params, null, 2))
    
    const allCards: Card[] = []
    const seenCardIds = new Set<string>()
    let duplicateCount = 0
    let currentPage = 1
    let totalPages = 1
    const pageSize = 100 // Buscar 100 por vez para reduzir requisições
    
    // Loop para buscar todas as páginas
    do {
      const queryParams = new URLSearchParams()
      
      // panelId é obrigatório
      queryParams.append('panelId', params.panelId)
      
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      if (params.userId) queryParams.append('userId', params.userId)
      if (params.channelId) queryParams.append('channelId', params.channelId)
      if (params.stepId) queryParams.append('stepId', params.stepId)
      
      // Paginação
      queryParams.append('page', String(currentPage))
      queryParams.append('pageSize', String(pageSize))

      const endpoint = `/api/crm/cards?${queryParams.toString()}`
      console.log(`🎴 [API] Buscando página ${currentPage}...`)
      console.log('🎴 [API] URL:', `${API_URL}${endpoint}`)
      
      const result = await fetchWithAuth<PaginatedData<Card>>(endpoint)
      
      // Adicionar cards da página atual
      if (result.items && result.items.length > 0) {
        result.items.forEach((card) => {
          if (seenCardIds.has(card.id)) {
            duplicateCount += 1
            return
          }

          seenCardIds.add(card.id)
          allCards.push(card)
        })
      }
      
      // Atualizar totalPages a partir da resposta da API
      // A API pode retornar em dois formatos:
      // 1. { totalItems, totalPages, pageNumber, pageSize } (diretamente)
      // 2. { pagination: { totalItems, totalPages, ... } } (aninhado)
      const apiTotalPages = (result as any).totalPages || result.pagination?.totalPages
      const apiTotalItems = (result as any).totalItems || result.pagination?.totalItems
      totalPages = apiTotalPages || Math.ceil((apiTotalItems || 0) / pageSize) || 1
      
      console.log(`🎴 [API] Página ${currentPage}/${totalPages}: ${result.items?.length || 0} cards`)
      
      currentPage++
    } while (currentPage <= totalPages)
    
    console.log(`🎴 [API] ✅ TOTAL DE CARDS CARREGADOS: ${allCards.length}`)
    if (duplicateCount > 0) {
      console.warn(`🎴 [API] ⚠️ Cards duplicados ignorados: ${duplicateCount}`)
    }

    const cardsWithCustomFields = allCards.filter((card) => {
      if (!card.customFields) return false
      return Object.keys(card.customFields).length > 0
    })
    const cardsWithMonetaryAmount = allCards.filter((card) => {
      return card.monetaryAmount !== null && card.monetaryAmount !== undefined
    })
    const customFieldKeysCount: Record<string, number> = {}
    cardsWithCustomFields.forEach((card) => {
      Object.keys(card.customFields || {}).forEach((key) => {
        customFieldKeysCount[key] = (customFieldKeysCount[key] || 0) + 1
      })
    })

    console.log('🎴 [API] Diagnóstico de campos monetários:', {
      totalCards: allCards.length,
      cardsWithCustomFields: cardsWithCustomFields.length,
      cardsWithMonetaryAmount: cardsWithMonetaryAmount.length,
      cardsWithNullCustomFields: allCards.length - cardsWithCustomFields.length,
    })
    console.log(
      '🎴 [API] Top chaves customFields:',
      Object.entries(customFieldKeysCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
    )
    
    // Agrupar cards por stepTitle para debug
    const cardsByStep: Record<string, number> = {}
    allCards.forEach(card => {
      const step = card.stepTitle || 'Sem etapa'
      cardsByStep[step] = (cardsByStep[step] || 0) + 1
    })
    console.log('🎴 [API] Cards por etapa:', JSON.stringify(cardsByStep, null, 2))
    
    // Agrupar cards por mês de criação para debug
    const cardsByMonth: Record<string, number> = {}
    const allDates: string[] = []
    allCards.forEach(card => {
      if (card.createdAt) {
        const date = new Date(card.createdAt)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        cardsByMonth[key] = (cardsByMonth[key] || 0) + 1
        allDates.push(card.createdAt)
      }
    })
    console.log('🎴 [API] Cards por mês de criação:', JSON.stringify(cardsByMonth, null, 2))
    if (allDates.length > 0) {
      const sortedDates = allDates.sort()
      console.log('🎴 [API] Data de criação mais antiga:', sortedDates[0])
      console.log('🎴 [API] Data de criação mais recente:', sortedDates[sortedDates.length - 1])
      console.log('🎴 [API] Total de meses únicos:', Object.keys(cardsByMonth).length)
    }
    
    console.log('🎴 [API] ==========================================')
    
    // Retornar todos os cards como se fosse uma única página
    return {
      items: allCards,
      totalItems: allCards.length,
      totalPages: 1,
      pageNumber: 1,
      pageSize: allCards.length,
    }
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
    console.log('👥 [API] ==========================================')
    console.log(`👥 [API] GET /api/crm/agents?panelId=${panelId}`)
    console.log('👥 [API] Buscando agentes...')
    const params = new URLSearchParams({ panelId })
    const result = await fetchWithAuth<ListData<Agent>>(`/api/crm/agents?${params}`)
    console.log(`👥 [API] ✅ Agentes encontrados: ${result.items?.length || 0}`)
    console.log('👥 [API] Dados completos:', JSON.stringify(result, null, 2))
    console.log('👥 [API] ==========================================')
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
