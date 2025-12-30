import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiClient } from '@/lib/api/client'
import { Mail, Phone, Loader2, AlertCircle } from 'lucide-react'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (activeTab === 'phone') {
        if (!phone.trim()) {
          throw new Error('Por favor, informe seu telefone')
        }
        await apiClient.login(phone.trim(), undefined)
      } else {
        if (!email.trim()) {
          throw new Error('Por favor, informe seu email')
        }
        await apiClient.login(undefined, email.trim())
      }
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Limita a 11 dígitos
    const limited = numbers.slice(0, 11)
    
    // Formata (XX) XXXXX-XXXX
    if (limited.length <= 2) {
      return limited
    }
    if (limited.length <= 7) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`
    }
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
  }

  // Extrai apenas números do telefone para enviar à API
  const getPhoneNumbers = () => phone.replace(/\D/g, '')

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (activeTab === 'phone') {
        const phoneNumbers = getPhoneNumbers()
        if (!phoneNumbers || phoneNumbers.length < 10) {
          throw new Error('Por favor, informe um telefone válido com DDD')
        }
        await apiClient.login(phoneNumbers, undefined)
        // Navegar para página de verificação com o telefone
        navigate('/verify-code', { 
          state: { phone: phoneNumbers } 
        })
      } else {
        if (!email.trim()) {
          throw new Error('Por favor, informe seu email')
        }
        await apiClient.login(undefined, email.trim())
        // Navegar para página de verificação com o email
        navigate('/verify-code', { 
          state: { email: email.trim() } 
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar código')
    } finally {
      setLoading(false)
    }
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

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              Bem-vindo ao Dashboard
            </h1>
            <p className="text-gray-400 text-sm">
              Entre com seu telefone ou email para receber o código de verificação
            </p>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tabs de Login */}
          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as 'phone' | 'email')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-gray-700/50 p-1 mb-6">
              <TabsTrigger 
                value="phone"
                className="data-[state=active]:bg-[#c8fa00] data-[state=active]:text-gray-900 text-gray-300 font-medium"
              >
                <Phone className="h-4 w-4 mr-2" />
                Telefone
              </TabsTrigger>
              <TabsTrigger 
                value="email"
                className="data-[state=active]:bg-[#c8fa00] data-[state=active]:text-gray-900 text-gray-300 font-medium"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleFormSubmit}>
              <TabsContent value="phone" className="mt-0">
                <div className="space-y-2">
                  <label 
                    htmlFor="phone" 
                    className="block text-sm font-medium text-gray-300"
                  >
                    Número de telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="(31) 99999-9999"
                      disabled={loading}
                      className="pl-10 h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#c8fa00] focus:ring-[#c8fa00]/20"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Informe seu número com DDD
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="email" className="mt-0">
                <div className="space-y-2">
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-medium text-gray-300"
                  >
                    Endereço de email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      disabled={loading}
                      className="pl-10 h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#c8fa00] focus:ring-[#c8fa00]/20"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Use o email cadastrado na sua conta
                  </p>
                </div>
              </TabsContent>

              <Button 
                type="submit" 
                className="w-full h-12 mt-6 bg-[#c8fa00] hover:bg-[#b8ea00] text-gray-900 font-semibold text-base transition-all duration-200 hover:shadow-lg hover:shadow-[#c8fa00]/20" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </Tabs>

          {/* Footer */}
          <p className="text-center text-gray-500 text-xs mt-8">
            © {new Date().getFullYear()} AtendeBot. Todos os direitos reservados.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
