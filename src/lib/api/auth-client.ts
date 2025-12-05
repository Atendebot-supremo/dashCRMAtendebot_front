const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

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
  code?: string
  details?: unknown[]
}

const handleApiError = async (response: Response): Promise<never> => {
  let errorData: ApiError
  try {
    errorData = await response.json()
  } catch {
    throw new Error(`Erro ${response.status}: ${response.statusText}`)
  }

  throw new Error(errorData.error || 'Erro na requisição')
}

export const authClient = {
  async login(credentials: LoginRequest): Promise<LoginResponse['data']> {
    const loginUrl = `${API_URL}/api/auth/login`
    
    console.group('🔐 [AUTH] Login Request')
    console.log('📍 URL:', loginUrl)
    console.log('🌐 API_URL configurada:', API_URL)
    console.log('📤 Payload:', credentials)
    console.log('⏰ Timestamp:', new Date().toISOString())
    
    const startTime = Date.now()
    
    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const duration = Date.now() - startTime
      
      console.log('📥 Response Status:', response.status, response.statusText)
      console.log('⏱️ Duration:', `${duration}ms`)
      console.log('📋 Headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error Response:', errorText)
        console.groupEnd()
        await handleApiError(response)
      }

      const data: LoginResponse = await response.json()
      
      console.log('✅ Response Data:', {
        success: data.success,
        hasToken: !!data.data?.token,
        hasUser: !!data.data?.user,
        hasHelena: !!data.data?.helena,
        user: data.data?.user,
        message: data.message,
      })

      if (!data.success) {
        console.error('❌ Login failed:', data.message)
        console.groupEnd()
        throw new Error(data.message || 'Erro ao fazer login')
      }

      // Salvar token no localStorage
      localStorage.setItem('authToken', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      localStorage.setItem('helena', JSON.stringify(data.data.helena))
      
      console.log('💾 Token salvo no localStorage')
      console.log('✅ Login realizado com sucesso!')
      console.groupEnd()

      return data.data
    } catch (error) {
      const duration = Date.now() - startTime
      console.error('❌ [AUTH] Erro na requisição:', {
        error: error instanceof Error ? error.message : error,
        duration: `${duration}ms`,
        url: loginUrl,
      })
      console.groupEnd()
      throw error
    }
  },

  logout(): void {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('helena')
  },

  getToken(): string | null {
    return localStorage.getItem('authToken')
  },

  getUser(): LoginResponse['data']['user'] | null {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },
}

