import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api/client'
import { Loader2, AlertCircle, ArrowLeft, Shield } from 'lucide-react'

interface LocationState {
  phone?: string
  email?: string
}

const VerifyCodePage = () => {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [blocked, setBlocked] = useState(false)
  const [blockedUntil, setBlockedUntil] = useState<Date | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const state = location.state as LocationState | null
  const phone = state?.phone
  const email = state?.email

  // Verificar se há dados de login
  useEffect(() => {
    if (!phone && !email) {
      navigate('/login', { replace: true })
    }
  }, [phone, email, navigate])

  // Verificar bloqueio
  useEffect(() => {
    if (blockedUntil) {
      const interval = setInterval(() => {
        const now = new Date()
        if (now >= blockedUntil) {
          setBlocked(false)
          setBlockedUntil(null)
          setAttempts(0)
          clearInterval(interval)
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [blockedUntil])

  const handleCodeChange = (index: number, value: string) => {
    // Aceitar apenas números
    const numericValue = value.replace(/\D/g, '').slice(0, 1)
    
    if (numericValue) {
      const newCode = [...code]
      newCode[index] = numericValue
      setCode(newCode)
      setError('')

      // Focar no próximo input
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus()
      }
    } else {
      // Permitir apagar
      const newCode = [...code]
      newCode[index] = ''
      setCode(newCode)
      setError('')

      // Focar no input anterior ao apagar
      if (index > 0 && !numericValue && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('')
      setCode(newCode)
      setError('')
      // Focar no último input
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (blocked) {
      return
    }

    const fullCode = code.join('')
    
    if (fullCode.length !== 6) {
      setError('Por favor, informe o código completo de 6 dígitos')
      return
    }

    setError('')
    setLoading(true)

    try {
      await apiClient.verifyCode(phone, email, fullCode)
      navigate('/', { replace: true })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Código inválido'
      setError(errorMessage)
      
      // Verificar se foi bloqueado
      if (errorMessage.includes('bloqueado') || errorMessage.includes('15 minutos')) {
        setBlocked(true)
        const blockUntil = new Date()
        blockUntil.setMinutes(blockUntil.getMinutes() + 15)
        setBlockedUntil(blockUntil)
      } else {
        // Incrementar tentativas
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        
        if (newAttempts >= 4) {
          // Próxima tentativa será a 5ª, então bloquear
          setBlocked(true)
          const blockUntil = new Date()
          blockUntil.setMinutes(blockUntil.getMinutes() + 15)
          setBlockedUntil(blockUntil)
        }
      }
      
      // Limpar código
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const getMaskedContact = () => {
    if (phone) {
      const numbers = phone.replace(/\D/g, '')
      if (numbers.length === 11) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
      }
      return phone
    }
    if (email) {
      const [local, domain] = email.split('@')
      if (local && domain) {
        const maskedLocal = local.slice(0, 2) + '***'
        return `${maskedLocal}@${domain}`
      }
      return email
    }
    return ''
  }

  const getTimeRemaining = () => {
    if (!blockedUntil) return ''
    const now = new Date()
    const diff = blockedUntil.getTime() - now.getTime()
    if (diff <= 0) return ''
    
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#c8fa00]/10 via-transparent to-transparent rotate-12" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#c8fa00]/5 via-transparent to-transparent -rotate-12" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-gray-700/50 bg-gray-800/80 backdrop-blur-xl shadow-2xl">
        <CardContent className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="/logo_verde-300x78.png" 
              alt="AtendeBot" 
              className="h-12 object-contain"
            />
          </div>

          {/* Botão Voltar */}
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          {/* Título */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-[#c8fa00]/10 border border-[#c8fa00]/20">
                <Shield className="h-8 w-8 text-[#c8fa00]" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Verificação de Código
            </h1>
            <p className="text-gray-400 text-sm">
              Enviamos um código de 6 dígitos para
            </p>
            <p className="text-[#c8fa00] font-semibold mt-1">
              {getMaskedContact()}
            </p>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Aviso de bloqueio */}
          {blocked && blockedUntil && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-lg mb-6 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>
                Muitas tentativas incorretas. Tente novamente em {getTimeRemaining()}
              </span>
            </div>
          )}

          {/* Inputs de código */}
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-2 mb-6">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={loading || blocked}
                  className="w-12 h-14 text-center text-2xl font-bold bg-gray-700/50 border-gray-600 text-white focus:border-[#c8fa00] focus:ring-[#c8fa00]/20"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#c8fa00] hover:bg-[#b8ea00] text-gray-900 font-semibold text-base transition-all duration-200 hover:shadow-lg hover:shadow-[#c8fa00]/20" 
              disabled={loading || blocked || code.join('').length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar Código'
              )}
            </Button>
          </form>

          {/* Informações adicionais */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              Não recebeu o código? Verifique seu {phone ? 'WhatsApp' : 'email'} ou tente novamente.
            </p>
            {attempts > 0 && !blocked && (
              <p className="text-amber-400 text-xs mt-2">
                Tentativas: {attempts}/5
              </p>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-xs mt-8">
            © {new Date().getFullYear()} AtendeBot. Todos os direitos reservados.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default VerifyCodePage

