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

export interface AuthUser {
  id: string
  name: string
  phone: string
}

