import { useMemo, useState } from 'react'
import { Calendar, Filter, RotateCcw, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCards } from '@/lib/api/queries'
import { extractUniqueResponsibles, extractUniqueChannels } from '@/lib/utils/stage-mapping'
import type { DashboardFilters } from '@/types/crm'

interface FiltersBarProps {
  filters: DashboardFilters
  onFiltersChange: (filters: DashboardFilters) => void
}

const FiltersBar = ({ filters, onFiltersChange }: FiltersBarProps) => {
  // Estado para controlar se a seção está expandida
  const [isExpanded, setIsExpanded] = useState(true)
  // Estado para controlar se usa período pré-definido ou data customizada
  const [dateMode, setDateMode] = useState<'preset' | 'custom'>('preset')
  
  // Buscar cards para extrair responsáveis e canais únicos
  const { data: allCards = [] } = useCards({})
  
  // Extrair responsáveis únicos dos cards
  const users = useMemo(() => {
    const extracted = extractUniqueResponsibles(allCards)
    console.log('👥 [FiltersBar] Vendedores extraídos:', extracted)
    console.log('👥 [FiltersBar] Total de cards analisados:', allCards.length)
    return extracted
  }, [allCards])
  
  // Extrair canais únicos dos cards (do campo customFields.origem-11)
  const channels = useMemo(() => {
    const extracted = extractUniqueChannels(allCards)
    console.log('📡 [FiltersBar] Canais extraídos:', extracted)
    return extracted
  }, [allCards])
  
  const usersLoading = false
  const channelsLoading = false

  const handleUserChange = (value: string) => {
    onFiltersChange({ ...filters, userId: value === 'all' ? undefined : value })
  }

  const handleChannelChange = (value: string) => {
    onFiltersChange({
      ...filters,
      channelId: value === 'all' ? undefined : value,
    })
  }

  const handleDateModeChange = (mode: 'preset' | 'custom') => {
    setDateMode(mode)
    // Ao trocar de modo
    if (mode === 'preset') {
      // Aplicar período padrão (mês atual) se não houver datas customizadas
      if (!filters.startDate || !filters.endDate) {
        const now = new Date()
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        onFiltersChange({
          ...filters,
          startDate: startDate.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0],
        })
      }
      // Se já houver datas, mantém elas (pode ter vindo de custom)
    } else {
      // Modo custom: mantém as datas se existirem, senão deixa vazio para o usuário preencher
      // Não precisa fazer nada, apenas manter o estado atual
    }
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

  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value || undefined,
    })
  }

  return (
    <div className="space-y-3">
      {/* Header - Clicável para expandir/colapsar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-2 hover:bg-gray-700/30 rounded-lg p-2 -m-2 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8fa00]/10">
            <Filter className="h-4 w-4 text-[#c8fa00]" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-white">Filtros</h3>
            <p className="text-xs text-gray-500">Refine sua visualização</p>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Filters - Layout Vertical - Colapsável */}
      {isExpanded && (
        <div className="space-y-2.5">
        {/* Tipo de Filtro de Data */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#c8fa00]" />
            <label className="text-xs font-medium text-gray-400">Filtro de Data</label>
          </div>
          <Select
            value={dateMode}
            onValueChange={(value) => handleDateModeChange(value as 'preset' | 'custom')}
          >
            <SelectTrigger className="w-full h-10 bg-gray-700/50 border-gray-600/50 text-white hover:bg-gray-700/70 focus:border-[#c8fa00] focus:ring-[#c8fa00]/20 transition-all">
              <SelectValue placeholder="Tipo de filtro" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="preset" className="hover:bg-gray-700 focus:bg-gray-700 focus:text-white">
                Período Pré-definido
              </SelectItem>
              <SelectItem value="custom" className="hover:bg-gray-700 focus:bg-gray-700 focus:text-white">
                Data Customizada
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Período Pré-definido ou Data Customizada */}
        {dateMode === 'preset' ? (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Período</label>
            <Select
              onValueChange={handlePeriodChange}
              defaultValue="month"
            >
              <SelectTrigger className="w-full h-10 bg-gray-700/50 border-gray-600/50 text-white hover:bg-gray-700/70 focus:border-[#c8fa00] focus:ring-[#c8fa00]/20 transition-all">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="today" className="hover:bg-gray-700 focus:bg-gray-700 focus:text-white">Hoje</SelectItem>
                <SelectItem value="week" className="hover:bg-gray-700 focus:bg-gray-700 focus:text-white">Esta Semana</SelectItem>
                <SelectItem value="month" className="hover:bg-gray-700 focus:bg-gray-700 focus:text-white">Este Mês</SelectItem>
                <SelectItem value="year" className="hover:bg-gray-700 focus:bg-gray-700 focus:text-white">Este Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Data Início</label>
              <DatePicker
                value={filters.startDate || ''}
                onChange={(value) => handleCustomDateChange('startDate', value)}
                placeholder="Selecione a data de início"
                max={filters.endDate || undefined}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Data Fim</label>
              <DatePicker
                value={filters.endDate || ''}
                onChange={(value) => handleCustomDateChange('endDate', value)}
                placeholder="Selecione a data de fim"
                min={filters.startDate || undefined}
              />
            </div>
          </div>
        )}

        {/* Usuário/Vendedor */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400">Vendedor</label>
          <Select
            value={filters.userId || 'all'}
            onValueChange={handleUserChange}
            disabled={usersLoading}
          >
            <SelectTrigger className="w-full h-10 bg-gray-700/50 border-gray-600/50 text-white hover:bg-gray-700/70 focus:border-[#c8fa00] focus:ring-[#c8fa00]/20 transition-all">
              <SelectValue placeholder="Todos os vendedores" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="all" className="hover:bg-gray-700 focus:bg-gray-700 focus:text-white">Todos os vendedores</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id} className="hover:bg-gray-700 focus:bg-gray-700 focus:text-white">
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Canal */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400">Canal</label>
          <Select
            value={filters.channelId || 'all'}
            onValueChange={handleChannelChange}
            disabled={channelsLoading}
          >
            <SelectTrigger className="w-full h-10 bg-gray-700/50 border-gray-600/50 text-white hover:bg-gray-700/70 focus:border-[#c8fa00] focus:ring-[#c8fa00]/20 transition-all">
              <SelectValue placeholder="Todos os canais" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="all" className="hover:bg-gray-700 focus:bg-gray-700 focus:text-white">Todos os canais</SelectItem>
              {channels.map((channel) => (
                <SelectItem key={channel.id} value={channel.id} className="hover:bg-gray-700 focus:bg-gray-700 focus:text-white">
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
            setDateMode('preset')
            onFiltersChange({})
          }}
          className="w-full h-10 bg-transparent border-gray-600/50 text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-gray-500 transition-all"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Limpar Filtros
        </Button>
        </div>
      )}
    </div>
  )
}

export default FiltersBar
