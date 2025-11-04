import type {
  Panel,
  Card,
  PanelResponse,
  CardResponse,
  ContactResponse,
  DashboardFilters,
} from './helena-types'

// URL base da API HelenaCRM - usar proxy em desenvolvimento para evitar CORS
const API_URL = import.meta.env.DEV 
  ? '/api' 
  : (import.meta.env.VITE_HELENA_API_URL || 'https://api.flw.chat')
const API_TOKEN = import.meta.env.VITE_HELENA_API_TOKEN

console.log('🔧 [HelenaAPI] Configuração inicializada:', {
  apiUrl: API_URL,
  isDev: import.meta.env.DEV,
  hasToken: !!API_TOKEN,
  tokenPreview: API_TOKEN ? `${API_TOKEN.substring(0, 10)}...` : 'N/A',
})

if (!API_TOKEN) {
  console.warn(
    '⚠️ [HelenaAPI] VITE_HELENA_API_TOKEN não configurado. Configure no arquivo .env.local'
  )
}

class HelenaAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message)
    this.name = 'HelenaAPIError'
  }
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = `Erro na requisição: ${response.status}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch {
      // Se não conseguir parsear o JSON, usar a mensagem padrão
    }

    throw new HelenaAPIError(errorMessage, response.status, response)
  }

  return response.json()
}

const fetchWithAuth = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  if (!API_TOKEN) {
    console.error('❌ [HelenaAPI] Token de autenticação não configurado')
    throw new HelenaAPIError('Token de autenticação não configurado')
  }

  const url = `${API_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${API_TOKEN}`,
    ...options.headers,
  }

  const config: RequestInit = {
    ...options,
    headers,
  }

  console.log(`🚀 [HelenaAPI] Fazendo requisição:`, {
    method: options.method || 'GET',
    url,
    endpoint,
  })

  try {
    const startTime = Date.now()
    const response = await fetch(url, config)
    const duration = Date.now() - startTime

    console.log(`⏱️ [HelenaAPI] Resposta recebida em ${duration}ms:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      endpoint,
    })

    const data = await handleResponse<T>(response)
    
    console.log(`✅ [HelenaAPI] Dados recebidos:`, {
      endpoint,
      dataType: Array.isArray(data) ? 'array' : typeof data,
      dataLength: Array.isArray(data) ? data.length : 'N/A',
      dataPreview: Array.isArray(data) 
        ? data.slice(0, 3) 
        : (typeof data === 'object' && data !== null 
          ? Object.keys(data).slice(0, 5) 
          : data),
    })

    return data
  } catch (error) {
    console.error(`❌ [HelenaAPI] Erro na requisição:`, {
      endpoint,
      error: error instanceof Error ? error.message : error,
      errorType: error instanceof HelenaAPIError ? 'HelenaAPIError' : 'NetworkError',
    })
    
    if (error instanceof HelenaAPIError) {
      throw error
    }
    throw new HelenaAPIError(
      `Erro de rede: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    )
  }
}

export const helenaClient = {
  // Painéis
  async getPanels(): Promise<PanelResponse> {
    console.log('📋 [HelenaAPI] Buscando painéis...')
    const result = await fetchWithAuth<PanelResponse>('/crm/v1/panel')
    console.log(`📋 [HelenaAPI] Painéis encontrados: ${result.items?.length || 0}`)
    return result
  },

  async getPanelById(panelId: string): Promise<Panel> {
    return fetchWithAuth<Panel>(`/crm/v1/panel/${panelId}`)
  },

  // Cards - precisa de panelId obrigatório
  async getCards(filters?: DashboardFilters): Promise<CardResponse> {
    console.log('🎴 [HelenaAPI] Buscando cards...', { filters })
    const params = new URLSearchParams()
    
    // panelId é obrigatório
    if (filters?.panelId) {
      params.append('panelId', filters.panelId)
      console.log('🎴 [HelenaAPI] Usando panelId do filtro:', filters.panelId)
    } else {
      // Se não tiver panelId, buscar do primeiro painel disponível
      console.log('🎴 [HelenaAPI] PanelId não fornecido, buscando primeiro painel...')
      const panels = await this.getPanels()
      if (panels.items && panels.items.length > 0) {
        const firstPanelId = panels.items[0].id
        params.append('panelId', firstPanelId)
        console.log('🎴 [HelenaAPI] Usando primeiro painel encontrado:', firstPanelId)
      } else {
        console.error('❌ [HelenaAPI] Nenhum painel encontrado')
        throw new HelenaAPIError('Nenhum painel encontrado. É necessário ter pelo menos um painel.')
      }
    }
    
    if (filters?.startDate) {
      params.append('startDate', filters.startDate)
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate)
    }
    if (filters?.userId) {
      params.append('userId', filters.userId)
    }
    if (filters?.channelId) {
      params.append('channelId', filters.channelId)
    }

    const queryString = params.toString()
    const endpoint = `/crm/v1/panel/card?${queryString}`

    console.log('🎴 [HelenaAPI] Endpoint final:', endpoint)
    const result = await fetchWithAuth<CardResponse>(endpoint)
    console.log(`🎴 [HelenaAPI] Cards encontrados: ${result.items?.length || 0}`)
    return result
  },

  async getCardById(cardId: string): Promise<Card> {
    return fetchWithAuth<Card>(`/crm/v1/panel/card/${cardId}`)
  },

  // Contatos
  async getContacts(filters?: DashboardFilters): Promise<ContactResponse> {
    const params = new URLSearchParams()
    if (filters?.startDate) {
      params.append('startDate', filters.startDate)
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate)
    }
    if (filters?.channelId) {
      params.append('channelId', filters.channelId)
    }

    const queryString = params.toString()
    const endpoint = `/core/public/v1/contact${queryString ? `?${queryString}` : ''}`

    return fetchWithAuth<ContactResponse>(endpoint)
  },

  // Usuários/Vendedores - DESABILITADO: rota não existe na API
  // async getUsers(): Promise<UserResponse> {
  //   return fetchWithAuth<UserResponse>('/core/public/v1/user')
  // },

  // async getUserById(userId: string): Promise<User> {
  //   return fetchWithAuth<User>(`/core/public/v1/user/${userId}`)
  // },

  // Canais - DESABILITADO: rota não existe na API
  // async getChannels(): Promise<{ items: Array<{ id: string; name: string }> }> {
  //   return fetchWithAuth<{ items: Array<{ id: string; name: string }> }>(
  //     '/chat/public/v1/channel'
  //   )
  // },
  
}

export { HelenaAPIError }