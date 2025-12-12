// URL base da API Backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

if (!API_URL) {
  console.error('❌ VITE_API_URL não está configurada no .env')
}

console.log('🔧 [API Client] Configuração:', { apiUrl: API_URL })

// Tipos de autenticação
export interface LoginRequest {
  phone?: string
  email?: string
}

export interface LoginResponse {
  success: boolean
  data: {
    token: string
    helena: {
      accessToken: string
      userId: string
      tenantId: string
    }
    user: {
      id: string
      name: string
      phone: string
    }
  }
  message: string
}

export interface ApiError {
  success: false
  error: string
  code: string
  details?: Array<{ field: string; message: string }>
}

// Função auxiliar para fazer requisições autenticadas
const fetchWithAuth = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = localStorage.getItem('auth_token')
  
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`

  console.log('🚀 [API] Request:', { url, method: options.method || 'GET' })

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    if (response.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      window.location.href = '/login'
      throw new Error('Sessão expirada. Por favor, faça login novamente.')
    }

    if (response.status === 429) {
      throw new Error('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.')
    }

    let errorMessage = `Erro na requisição: ${response.status}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorData.message || errorMessage
    } catch {
      // Se não conseguir parsear o JSON, usar a mensagem padrão
    }

    throw new Error(errorMessage)
  }

  return response.json()
}

// Função para obter headers de autenticação
export const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token')
  
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

export const apiClient = {
  // Autenticação - Login com phone e/ou email
  async login(phone?: string, email?: string): Promise<LoginResponse> {
    // Validar que pelo menos um campo foi enviado
    if (!phone?.trim() && !email?.trim()) {
      throw new Error('Telefone ou email é obrigatório')
    }

    const body: LoginRequest = {}
    if (phone?.trim()) body.phone = phone.trim()
    if (email?.trim()) body.email = email.trim()

    console.log('🔐 [Login] Tentando login...', { hasPhone: !!phone, hasEmail: !!email })

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    if (!response.ok) {
      const error = data as ApiError
      console.error('❌ [Login] Erro:', error)
      throw new Error(error.error || 'Erro ao fazer login')
    }

    // Salvar token e dados do usuário
    if (data.success && data.data?.token) {
      localStorage.setItem('auth_token', data.data.token)
      localStorage.setItem('user_data', JSON.stringify(data.data.user))
      console.log('✅ [Login] Sucesso! Token salvo.')
    }

    return data as LoginResponse
  },

  async logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    window.location.href = '/login'
  },

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token')
  },

  // Obter dados do usuário
  getUserData() {
    const userData = localStorage.getItem('user_data')
    return userData ? JSON.parse(userData) : null
  },

  // CRM - Painéis
  async getPanels() {
    return fetchWithAuth('/crm/panels')
  },

  async getPanelById(panelId: string) {
    return fetchWithAuth(`/crm/panels/${panelId}`)
  },

  // CRM - Cards
  async getCards(filters?: { panelId?: string; startDate?: string; endDate?: string }) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }
    const queryString = params.toString()
    return fetchWithAuth(`/crm/cards${queryString ? `?${queryString}` : ''}`)
  },

  async getCardById(cardId: string) {
    return fetchWithAuth(`/crm/cards/${cardId}`)
  },

  // CRM - Agentes
  async getAgents() {
    return fetchWithAuth('/crm/agents')
  },

  async getAgentById(agentId: string) {
    return fetchWithAuth(`/crm/agents/${agentId}`)
  },

  // Métricas
  async getFunnelMetrics(filters: {
    panelId: string
    startDate?: string
    endDate?: string
    userId?: string
    channelId?: string
  }) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    return fetchWithAuth(`/metrics/funnel?${params.toString()}`)
  },

  async getRevenueMetrics(filters: {
    panelId: string
    startDate?: string
    endDate?: string
    userId?: string
    channelId?: string
  }) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    return fetchWithAuth(`/metrics/revenue?${params.toString()}`)
  },

  async getConversionMetrics(filters: {
    panelId: string
    startDate?: string
    endDate?: string
  }) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    return fetchWithAuth(`/metrics/conversion?${params.toString()}`)
  },

  async getDashboard(filters: {
    panelId: string
    startDate?: string
    endDate?: string
    userId?: string
    channelId?: string
  }) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    return fetchWithAuth(`/metrics/dashboard?${params.toString()}`)
  },
}
