import { useMemo } from 'react'
import { Target, Clock, Zap } from 'lucide-react'
import TremorMetricCard from '@/components/dashboard/TremorMetricCard'
import { useCards } from '@/lib/api/queries'
import { calculateConversionMetrics } from '@/lib/utils/calculations'
import {
  filterCardsByPeriod,
  filterCardsByUser,
  filterCardsByChannel,
} from '@/lib/utils/calculations'
import { formatPercentage, formatDays, formatMinutes } from '@/lib/utils/format'
import type { DashboardFilters, Card } from '@/types/crm'

interface ConversionMetricsProps {
  filters?: DashboardFilters
}

const ConversionMetrics = ({ filters }: ConversionMetricsProps) => {
  const { data: cards = [], isLoading, isError } = useCards(filters)

  const filteredCards = useMemo(() => {
    let filtered: Card[] = Array.isArray(cards) ? cards : []

    if (filters?.startDate || filters?.endDate) {
      filtered = filterCardsByPeriod(
        filtered,
        filters.startDate,
        filters.endDate
      )
    }

    if (filters?.userId) {
      filtered = filterCardsByUser(filtered, filters.userId)
    }

    if (filters?.channelId) {
      filtered = filterCardsByChannel(filtered, filters.channelId)
    }

    return filtered
  }, [cards, filters])

  const conversionMetrics = useMemo(() => {
    return calculateConversionMetrics(filteredCards)
  }, [filteredCards])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-[140px] animate-pulse rounded-xl bg-gray-800/50 border border-gray-700/50" />
        <div className="h-[140px] animate-pulse rounded-xl bg-gray-800/50 border border-gray-700/50" />
        <div className="h-[140px] animate-pulse rounded-xl bg-gray-800/50 border border-gray-700/50" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <Target className="h-4 w-4 text-red-400" />
          <p className="text-red-400 text-sm font-medium">
            Erro ao carregar métricas de conversão
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <TremorMetricCard
        title="Taxa de Conversão Geral"
        value={formatPercentage(conversionMetrics.overallConversionRate)}
        description="Lead → Venda"
        icon={Target}
      />
      <TremorMetricCard
        title="Ciclo de Vendas Médio"
        value={formatDays(conversionMetrics.averageSalesCycle)}
        description="Tempo médio de fechamento"
        icon={Clock}
      />
      <TremorMetricCard
        title="Velocidade de Resposta"
        value={formatMinutes(conversionMetrics.averageResponseTime)}
        description="Tempo médio de primeira resposta"
        icon={Zap}
      />
    </div>
  )
}

export default ConversionMetrics
