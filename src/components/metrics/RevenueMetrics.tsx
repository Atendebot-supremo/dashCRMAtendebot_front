import { useMemo } from 'react'
import { DollarSign, TrendingUp, Users } from 'lucide-react'
import TremorMetricCard from '@/components/dashboard/TremorMetricCard'
import { Card, Title, BarChart as TremorBarChart } from '@tremor/react'
import { useCards } from '@/lib/api/queries'
import { calculateRevenueMetrics } from '@/lib/utils/calculations'
import {
  filterCardsByPeriod,
  filterCardsByUser,
  filterCardsByChannel,
} from '@/lib/utils/calculations'
import { formatCurrency } from '@/lib/utils/format'
import type { DashboardFilters } from '@/lib/api/helena-types'
import type { Card } from '@/lib/api/helena-types'

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
        <div className="h-[140px] animate-pulse rounded-lg bg-gray-200" />
        <div className="h-[140px] animate-pulse rounded-lg bg-gray-200" />
        <div className="h-[140px] animate-pulse rounded-lg bg-gray-200" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erro ao carregar métricas de receita</p>
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
          value={filteredCards.filter(
            (card) => card.status === 'closed' || card.status === 'concluido'
          ).length}
          description="Total de vendas concluídas"
          icon={Users}
        />
      </div>

      {/* Gráficos */}
      {sellerChartData.length > 0 && (
        <Card>
          <Title>Receita por Vendedor</Title>
          <TremorBarChart
            className="mt-6"
            data={sellerChartData}
            index="name"
            categories={['value']}
            colors={['blue']}
            yAxisWidth={60}
          />
        </Card>
      )}

      {channelChartData.length > 0 && (
        <Card>
          <Title>Receita por Canal</Title>
          <TremorBarChart
            className="mt-6"
            data={channelChartData}
            index="name"
            categories={['value']}
            colors={['green']}
            yAxisWidth={60}
          />
        </Card>
      )}
    </div>
  )
}

export default RevenueMetrics

