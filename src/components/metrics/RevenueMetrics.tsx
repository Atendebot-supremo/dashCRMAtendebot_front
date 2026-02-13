import { useMemo } from 'react'
import { DollarSign, TrendingUp, Users, BarChart3, PieChart } from 'lucide-react'
import TremorMetricCard from '@/components/dashboard/TremorMetricCard'
import ChartCard from '@/components/dashboard/ChartCard'
import { useCards } from '@/lib/api/queries'
import { calculateRevenueMetrics } from '@/lib/utils/calculations'
import {
  filterCardsByPeriod,
  filterCardsByUser,
  filterCardsByChannel,
} from '@/lib/utils/calculations'
import { isCardInFinalStage } from '@/lib/utils/stage-mapping'
import { formatCurrency } from '@/lib/utils/format'
import type { DashboardFilters, Card } from '@/types/crm'

interface RevenueMetricsProps {
  filters?: DashboardFilters
}

const RevenueMetrics = ({ filters }: RevenueMetricsProps) => {
  const { data: cards = [], isLoading, isError } = useCards(filters)

  const filteredCards = useMemo(() => {
    let filtered: Card[] = cards

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

  const revenueMetrics = useMemo(() => {
    return calculateRevenueMetrics(filteredCards, filters)
  }, [filteredCards, filters])

  const sellerChartData = useMemo(() => {
    return Object.entries(revenueMetrics.revenueBySeller).map(
      ([sellerId, value]) => ({
        name: sellerId,
        value,
      })
    )
  }, [revenueMetrics.revenueBySeller])

  const channelChartData = useMemo(() => {
    return Object.entries(revenueMetrics.revenueByChannel).map(
      ([channel, value]) => ({
        name: channel,
        value,
      })
    )
  }, [revenueMetrics.revenueByChannel])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          <DollarSign className="h-4 w-4 text-red-400" />
          <p className="text-red-400 text-sm font-medium">Erro ao carregar métricas de receita</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TremorMetricCard
          title="Receita Total"
          value={formatCurrency(revenueMetrics.totalRevenue)}
          description="Total fechado no período"
          icon={DollarSign}
        />
        <TremorMetricCard
          title="Ticket Médio"
          value={formatCurrency(revenueMetrics.averageTicket)}
          description="Valor médio por venda"
          icon={TrendingUp}
        />
        <TremorMetricCard
          title="Vendas Fechadas"
          value={filteredCards.filter((card) => isCardInFinalStage(card)).length}
          description="Total de vendas concluídas"
          icon={Users}
        />
      </div>

      {/* Gráficos */}
      {sellerChartData.length > 0 && (
        <ChartCard 
          title="Receita por Vendedor"
          icon={<BarChart3 className="h-4 w-4 text-[#c8fa00]" />}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {sellerChartData.map((item, index) => (
              <div 
                key={index}
                className="group relative p-4 rounded-xl bg-gray-700/30 border border-gray-600/30 hover:border-[#c8fa00]/30 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#c8fa00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-xs text-gray-400 truncate mb-2">{item.name}</p>
                <p className="text-lg font-bold text-white">{formatCurrency(item.value)}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {channelChartData.length > 0 && (
        <ChartCard 
          title="Receita por Canal"
          icon={<PieChart className="h-4 w-4 text-[#c8fa00]" />}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {channelChartData.map((item, index) => (
              <div 
                key={index}
                className="group relative p-4 rounded-xl bg-gray-700/30 border border-gray-600/30 hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-xs text-gray-400 truncate mb-2">{item.name}</p>
                <p className="text-lg font-bold text-white">{formatCurrency(item.value)}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  )
}

export default RevenueMetrics
