import { useMemo } from 'react'
import { Calendar, LayoutDashboard, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useCards, useAgents } from '@/lib/api/queries'
import { extractUniqueChannels } from '@/lib/utils/stage-mapping'
import type { DashboardFilters } from '@/lib/api/helena-types'
import type { Panel } from '@/lib/api/crm-client'

interface FiltersBarProps {
  filters: DashboardFilters
  panels: Panel[]
  onFiltersChange: (filters: DashboardFilters) => void
}

const FiltersBar = ({ filters, panels, onFiltersChange }: FiltersBarProps) => {
  // Buscar agentes do painel selecionado
  const { data: agents = [], isLoading: agentsLoading } = useAgents(
    filters.panelId || '',
    !!filters.panelId
  )
  
  // Buscar cards para extrair canais únicos
  const { data: allCards = [] } = useCards(
    filters.panelId 
      ? {
          panelId: filters.panelId,
          startDate: filters.startDate,
          endDate: filters.endDate,
        }
      : undefined,
    !!filters.panelId
  )
  
  // Obter painel selecionado e seus steps (funil)
  const selectedPanel = useMemo(() => {
    if (!filters.panelId || panels.length === 0) return null
    return panels.find(p => p.id === filters.panelId) || null
  }, [panels, filters.panelId])
  
  // Steps (etapas do funil) do painel selecionado
  const steps = useMemo(() => {
    if (!selectedPanel?.steps || selectedPanel.steps.length === 0) {
      // Tentar extrair steps únicos dos cards como fallback
      const uniqueSteps = new Map<string, string>()
      allCards.forEach(card => {
        if (card.stepId) {
          // Se tem stepTitle, usar; senão, criar um nome amigável
          const stepTitle = card.stepTitle || `Etapa ${card.stepId.substring(0, 8)}`
          uniqueSteps.set(card.stepId, stepTitle)
        }
      })
      
      if (uniqueSteps.size > 0) {
        return Array.from(uniqueSteps.entries()).map(([id, title]) => ({
          id,
          title,
        }))
      }
      
      return []
    }
    
    // Ordenar por position se disponível
    return [...selectedPanel.steps].sort((a, b) => (a.position || 0) - (b.position || 0))
  }, [selectedPanel, allCards])
  
  // Debug: verificar steps
  console.log('🔄 [FiltersBar] Painel selecionado:', selectedPanel?.title)
  console.log('🔄 [FiltersBar] Steps do painel:', steps)
  
  // Usar agentes ao invés de extrair dos cards
  const users = useMemo(() => {
    if (agents.length > 0) {
      // Mapear agentes para o formato esperado
      // userId do agente = responsibleUserId dos cards
      return agents.map((agent) => ({
        id: agent.userId,
        name: agent.name || agent.shortName || 'Sem nome',
      }))
    }
    return []
  }, [agents])
  
  // Debug: verificar agentes
  console.log('👥 [FiltersBar] Agentes carregados:', agents)
  console.log('👥 [FiltersBar] Usuários mapeados:', users)
  
  // Extrair canais únicos dos cards
  const channels = useMemo(() => {
    return extractUniqueChannels(allCards)
  }, [allCards])
  
  const usersLoading = agentsLoading
  const stepsLoading = false
  const channelsLoading = false

  const handlePanelChange = (value: string) => {
    // Quando o painel muda, limpar filtros de vendedor, canal e etapa
    // pois são específicos do painel
    onFiltersChange({
      ...filters,
      panelId: value,
      userId: undefined,
      channelId: undefined,
      stepId: undefined,
    })
  }
  
  const handleStepChange = (value: string) => {
    onFiltersChange({ ...filters, stepId: value === 'all' ? undefined : value })
  }

  const handleUserChange = (value: string) => {
    onFiltersChange({ ...filters, userId: value === 'all' ? undefined : value })
  }

  const handleChannelChange = (value: string) => {
    onFiltersChange({
      ...filters,
      channelId: value === 'all' ? undefined : value,
    })
  }

  const handlePeriodChange = (period: 'today' | 'week' | 'month' | 'year') => {
    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        const day = now.getDay()
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    onFiltersChange({
      ...filters,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    })
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Painel - PRIMEIRO FILTRO */}
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            <Select
              value={filters.panelId || undefined}
              onValueChange={handlePanelChange}
              disabled={panels.length === 0}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue 
                  placeholder={panels.length === 0 ? "Carregando painéis..." : "Selecione um painel"}
                >
                  {filters.panelId 
                    ? panels.find(p => p.id === filters.panelId)?.title || 'Painel selecionado'
                    : undefined
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {panels.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Nenhum painel disponível
                  </div>
                ) : (
                  panels.map((panel) => {
                    const panelTitle = panel.title || panel.key || 'Painel sem título'
                    return (
                      <SelectItem key={panel.id} value={panel.id}>
                        {panelTitle}
                      </SelectItem>
                    )
                  })
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Período */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select
              onValueChange={handlePeriodChange}
              defaultValue="month"
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="year">Este Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Etapa/Funil */}
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <Select
              value={filters.stepId || 'all'}
              onValueChange={handleStepChange}
              disabled={stepsLoading || steps.length === 0}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todas as etapas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as etapas</SelectItem>
                {steps.map((step) => (
                  <SelectItem key={step.id} value={step.id}>
                    {step.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Usuário/Vendedor */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Vendedor:</span>
            <Select
              value={filters.userId || 'all'}
              onValueChange={handleUserChange}
              disabled={usersLoading}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos os vendedores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os vendedores</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Canal */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Canal:</span>
            <Select
              value={filters.channelId || 'all'}
              onValueChange={handleChannelChange}
              disabled={channelsLoading}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos os canais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os canais</SelectItem>
                {channels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    {channel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reset */}
          <Button
            variant="outline"
            onClick={() => {
              // Manter o panelId ao limpar, mas limpar os outros filtros
              onFiltersChange({
                panelId: filters.panelId,
                stepId: undefined,
                userId: undefined,
                channelId: undefined,
                startDate: undefined,
                endDate: undefined,
              })
            }}
          >
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default FiltersBar

