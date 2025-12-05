import type {
  Card,
  PanelResponse,
  CardResponse,
  ContactResponse,
  DashboardFilters,
} from './helena-types'

// URL base da API Backend
// Em desenvolvimento usa proxy local, em produção usa a URL do backend no Railway
const API_URL = import.meta.env.DEV 
  ? '/api' 
  : import.meta.env.VITE_API_URL

if (!API_URL) {
  console.error('❌ VITE_API_URL não está configurada no .env')
}

console.log('🔧 [API] Configuração inicializada:', {
  apiUrl: API_URL,
  isDev: import.meta.env.DEV,
})

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

const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  if (!API_URL) {
    console.error('❌ [API] URL da API não configurada')
    throw new HelenaAPIError('URL da API não configurada. Configure VITE_API_URL.')
  }

  const url = `${API_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  }

  const config: RequestInit = {
    ...options,
    headers,
  }

  console.log(`🚀 [API] Fazendo requisição:`, {
    method: options.method || 'GET',
    url,
    endpoint,
  })

  try {
    const startTime = Date.now()
    const response = await fetch(url, config)
    const duration = Date.now() - startTime

    console.log(`⏱️ [API] Resposta recebida em ${duration}ms:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      endpoint,
    })

    const data = await handleResponse<T>(response)
    
    console.log(`✅ [API] Dados recebidos:`, {
      endpoint,
      dataType: Array.isArray(data) ? 'array' : typeof data,
      dataLength: Array.isArray(data) ? data.length : 'N/A',
    })

    return data
  } catch (error) {
    console.error(`❌ [API] Erro na requisição:`, {
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
    console.log('📋 [API] Buscando painéis...')
    const result = await fetchApi<PanelResponse>('/crm/v1/panel')
    console.log(`📋 [API] Painéis encontrados: ${result.items?.length || 0}`)
    return result
  },

  async getPanelById(panelId: string): Promise<any> {
    console.log('📋 [API] Buscando painel completo...', panelId)
    const result = await fetchApi<any>(`/crm/v1/panel/${panelId}`)
    console.log('📋 [API] Painel recebido:', result)
    return result
  },

  // Cards - precisa de panelId obrigatório
  async getCards(filters?: DashboardFilters): Promise<CardResponse> {
    console.log('🎴 [API] Buscando cards...', { filters })
    const params = new URLSearchParams()
    
    // panelId é obrigatório
    if (filters?.panelId) {
      params.append('panelId', filters.panelId)
      console.log('🎴 [API] Usando panelId do filtro:', filters.panelId)
    } else {
      // Se não tiver panelId, buscar do primeiro painel disponível
      console.log('🎴 [API] PanelId não fornecido, buscando primeiro painel...')
      const panels = await this.getPanels()
      if (panels.items && panels.items.length > 0) {
        const firstPanelId = panels.items[0].id
        params.append('panelId', firstPanelId)
        console.log('🎴 [API] Usando primeiro painel encontrado:', firstPanelId)
      } else {
        console.error('❌ [API] Nenhum painel encontrado')
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

    console.log('🎴 [API] Endpoint final:', endpoint)
    const result = await fetchApi<CardResponse>(endpoint)
    console.log(`🎴 [API] Cards encontrados: ${result.items?.length || 0}`)
    return result
  },

  async getCardById(cardId: string): Promise<Card> {
    return fetchApi<Card>(`/crm/v1/panel/card/${cardId}`)
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

    return fetchApi<ContactResponse>(endpoint)
  },

  // Usuários/Vendedores - DESABILITADO: rota não existe na API
  // async getUsers(): Promise<UserResponse> {
  //   return fetchApi<UserResponse>('/core/public/v1/user')
  // },

  // async getUserById(userId: string): Promise<User> {
  //   return fetchApi<User>(`/core/public/v1/user/${userId}`)
  // },

  // Canais - DESABILITADO: rota não existe na API
  // async getChannels(): Promise<{ items: Array<{ id: string; name: string }> }> {
  //   return fetchApi<{ items: Array<{ id: string; name: string }> }>(
  //     '/chat/public/v1/channel'
  //   )
  // },
  
}

export { HelenaAPIError }