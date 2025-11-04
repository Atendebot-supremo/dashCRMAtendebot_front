import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const TestApiPage = () => {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testEndpoint = async (endpoint: string, method = 'GET') => {
    setLoading(true)
    setResult('Testando...')
    
    try {
      const token = import.meta.env.VITE_HELENA_API_TOKEN
      const baseUrl = import.meta.env.DEV ? '/api' : 'https://api.helena.run'
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      const data = await response.json()
      setResult(JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        data: data
      }, null, 2))
    } catch (error: any) {
      setResult(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Teste de Endpoints da API HelenaCRM</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Endpoints Disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={() => testEndpoint('/crm/v1/panel')} 
              disabled={loading}
              className="w-full justify-start"
            >
              GET /crm/v1/panel (Listar Painéis)
            </Button>
            
            <Button 
              onClick={() => testEndpoint('/core/public/v1/contact')} 
              disabled={loading}
              className="w-full justify-start"
            >
              GET /core/public/v1/contact (Listar Contatos)
            </Button>
            
            <Button 
              onClick={() => testEndpoint('/core/public/v1/field')} 
              disabled={loading}
              className="w-full justify-start"
            >
              GET /core/public/v1/field (Listar Campos)
            </Button>

            <Button 
              onClick={() => testEndpoint('/core/public/v1/tag')} 
              disabled={loading}
              className="w-full justify-start"
            >
              GET /core/public/v1/tag (Listar Etiquetas)
            </Button>

            <Button 
              onClick={() => testEndpoint('/chat/public/v1/channel')} 
              disabled={loading}
              className="w-full justify-start"
            >
              GET /chat/public/v1/channel (Listar Canais)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[500px] text-sm">
              {result || 'Clique em um botão para testar...'}
            </pre>
          </CardContent>
        </Card>

        <div className="text-sm text-muted-foreground">
          <p><strong>Token configurado:</strong> {import.meta.env.VITE_HELENA_API_TOKEN ? '✅ Sim' : '❌ Não'}</p>
          <p><strong>Ambiente:</strong> {import.meta.env.DEV ? 'Desenvolvimento (com proxy)' : 'Produção'}</p>
        </div>
      </div>
    </div>
  )
}

export default TestApiPage

