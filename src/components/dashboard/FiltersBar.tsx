import { useMemo } from 'react'
import { Calendar, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useCards } from '@/lib/api/queries'
import { extractUniqueResponsibles, extractUniqueChannels } from '@/lib/utils/stage-mapping'
import type { DashboardFilters } from '@/lib/api/helena-types'
import type { Panel } from '@/lib/api/crm-client'

interface FiltersBarProps {
  filters: DashboardFilters
  panels: Panel[]
  onFiltersChange: (filters: DashboardFilters) => void
}

const FiltersBar = ({ filters, panels, onFiltersChange }: FiltersBarProps) => {
  // Debug: verificar estrutura dos painéis
  console.log('🔍 [FiltersBar] Painéis recebidos:', panels)
  console.log('🔍 [FiltersBar] Primeiro painel:', panels[0])
  console.log('🔍 [FiltersBar] Título do primeiro painel:', panels[0]?.title)
  
  // Buscar cards para extrair responsáveis e canais únicos
  // Só buscar se tiver panelId
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
  
  // Extrair responsáveis únicos dos cards
  const users = useMemo(() => {
    return extractUniqueResponsibles(allCards)
  }, [allCards])
  
  // Extrair canais únicos dos cards
  const channels = useMemo(() => {
    return extractUniqueChannels(allCards)
  }, [allCards])
  
  const usersLoading = false
  const channelsLoading = false

  const handlePanelChange = (value: string) => {
    // Quando o painel muda, limpar filtros de vendedor e canal
    // pois são específicos do painel
    onFiltersChange({
      ...filters,
      panelId: value,
      userId: undefined,
      channelId: undefined,
    })
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

