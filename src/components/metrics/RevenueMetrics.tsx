import { useMemo } from 'react'
import { DollarSign, TrendingUp, Users } from 'lucide-react'
import MetricCard from '@/components/dashboard/MetricCard'
import ChartCard from '@/components/dashboard/ChartCard'
import BarChart from '@/components/charts/BarChart'
import { Skeleton } from '@/components/ui/skeleton'
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
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Erro ao carregar métricas de receita</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Receita Total"
          value={formatCurrency(revenueMetrics.totalRevenue)}
          description="Total fechado no período"
          icon={DollarSign}
        />
        <MetricCard
          title="Ticket Médio"
          value={formatCurrency(revenueMetrics.averageTicket)}
          description="Valor médio por venda"
          icon={TrendingUp}
        />
        <MetricCard
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
        <ChartCard title="Receita por Vendedor">
          <BarChart
            data={sellerChartData}
            bars={[
              {
                key: 'value',
                name: 'Receita (R$)',
                color: 'hsl(var(--chart-1))',
              },
            ]}
            xAxisKey="name"
            height={300}
          />
        </ChartCard>
      )}

      {channelChartData.length > 0 && (
        <ChartCard title="Receita por Canal">
          <BarChart
            data={channelChartData}
            bars={[
              {
                key: 'value',
                name: 'Receita (R$)',
                color: 'hsl(var(--chart-2))',
              },
            ]}
            xAxisKey="name"
            height={300}
          />
        </ChartCard>
      )}
    </div>
  )
}

export default RevenueMetrics

