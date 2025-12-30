// URL base da API Backend (SEM /api no final)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

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
  data?: {
    token?: string
    helena?: {
      accessToken: string
      userId: string
      tenantId: string
      expiresIn?: string
      refreshToken?: string
      urlRedirect?: string
    }
    user?: {
      id: string
      name: string
      phone: string
      userName?: string
      email?: string
    }
  }
  message: string
}

export interface VerifyCodeRequest {
  phone?: string
  email?: string
  code: string
}

export interface VerifyCodeResponse {
  success: boolean
  data: {
    token: string
    helena: {
      accessToken: string
      userId: string
      tenantId: string
      expiresIn?: string
      refreshToken?: string
      urlRedirect?: string
    }
    user: {
      id: string
      name: string
      phone: string
      userName?: string
      email?: string
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
  // Autenticação - Login com phone e/ou email (envia código OTP)
  async login(phone?: string, email?: string): Promise<LoginResponse> {
    // Validar que pelo menos um campo foi enviado
    if (!phone?.trim() && !email?.trim()) {
      throw new Error('Telefone ou email é obrigatório')
    }

    const body: LoginRequest = {}
    if (phone?.trim()) body.phone = phone.trim()
    if (email?.trim()) body.email = email.trim()

    console.log('🔐 [Login] Enviando código OTP...', { hasPhone: !!phone, hasEmail: !!email })

    const response = await fetch(`${API_URL}/api/auth/login`, {
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
      throw new Error(error.error || 'Erro ao enviar código')
    }

    // NÃO salvar token aqui - apenas após verificação do código
    console.log('✅ [Login] Código OTP enviado com sucesso!', data.message)

    return data as LoginResponse
  },

  // Verificar código OTP e fazer login
  async verifyCode(phone: string | undefined, email: string | undefined, code: string): Promise<VerifyCodeResponse> {
    if (!phone?.trim() && !email?.trim()) {
      throw new Error('Telefone ou email é obrigatório')
    }

    if (!code || code.length !== 6) {
      throw new Error('Código deve ter 6 dígitos')
    }

    const body: VerifyCodeRequest = {
      code: code.trim()
    }
    if (phone?.trim()) body.phone = phone.trim()
    if (email?.trim()) body.email = email.trim()

    console.log('🔐 [VerifyCode] Verificando código OTP...', { hasPhone: !!phone, hasEmail: !!email })

    const response = await fetch(`${API_URL}/api/auth/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    if (!response.ok) {
      const error = data as ApiError
      console.error('❌ [VerifyCode] Erro:', error)
      
      // Tratar bloqueio por tentativas
      if (error.code === 'TOO_MANY_ATTEMPTS' || error.error?.toLowerCase().includes('bloqueado')) {
        throw new Error('Muitas tentativas incorretas. Você foi bloqueado por 15 minutos.')
      }
      
      throw new Error(error.error || 'Código inválido')
    }

    // Salvar token e dados do usuário após verificação bem-sucedida
    if (data.success && data.data?.token) {
      localStorage.setItem('auth_token', data.data.token)
      localStorage.setItem('user_data', JSON.stringify(data.data.user))
      console.log('✅ [VerifyCode] Código verificado! Token salvo.', { user: data.data.user })
    }

    return data as VerifyCodeResponse
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

  // Buscar dados completos do usuário (incluindo userName e email)
  async getUserProfile() {
    return fetchWithAuth<{ success: boolean; data: { id: string; name: string; phone: string; userName?: string; email?: string } }>('/api/auth/profile')
  },

  // CRM - Painéis
  async getPanels() {
    return fetchWithAuth('/api/crm/panels')
  },

  async getPanelById(panelId: string) {
    return fetchWithAuth(`/api/crm/panels/${panelId}`)
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
    return fetchWithAuth(`/api/crm/cards${queryString ? `?${queryString}` : ''}`)
  },

  async getCardById(cardId: string) {
    return fetchWithAuth(`/api/crm/cards/${cardId}`)
  },

  // CRM - Agentes
  async getAgents() {
    return fetchWithAuth('/api/crm/agents')
  },

  async getAgentById(agentId: string) {
    return fetchWithAuth(`/api/crm/agents/${agentId}`)
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
    return fetchWithAuth(`/api/metrics/funnel?${params.toString()}`)
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
    return fetchWithAuth(`/api/metrics/revenue?${params.toString()}`)
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
    return fetchWithAuth(`/api/metrics/conversion?${params.toString()}`)
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
    return fetchWithAuth(`/api/metrics/dashboard?${params.toString()}`)
  },
}
