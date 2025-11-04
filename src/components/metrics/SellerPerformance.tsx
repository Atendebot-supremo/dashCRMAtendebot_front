import { useMemo } from 'react'
import ChartCard from '@/components/dashboard/ChartCard'
import BarChart from '@/components/charts/BarChart'
import { Skeleton } from '@/components/ui/skeleton'
import { useCards } from '@/lib/api/queries'
// import { useUsers } from '@/lib/api/queries'
import {
  filterCardsByPeriod,
  filterCardsByUser,
  filterCardsByChannel,
} from '@/lib/utils/calculations'
import { calculateConversionRate } from '@/lib/utils/calculations'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'
import type { DashboardFilters } from '@/lib/api/helena-types'
import type { Card } from '@/lib/api/helena-types'

interface SellerPerformanceProps {
  filters?: DashboardFilters
}

const SellerPerformance = ({ filters }: SellerPerformanceProps) => {
  const { data: cards = [], isLoading, isError } = useCards(filters)
  // Desabilitado temporariamente - rota não existe
  const users: any[] = []

  const filteredCards = useMemo(() => {
    let filtered: Card[] = cards

    if (filters?.startDate || filters?.endDate) {
      filtered = filterCardsByPeriod(
        filtered,
        filters.startDate,
        filters.endDate
      )
    }

    if (filters?.channelId) {
      filtered = filterCardsByChannel(filtered, filters.channelId)
    }

    return filtered
  }, [cards, filters])

  const sellerMetrics = useMemo(() => {
    const metrics: Record<
      string,
      {
        name: string
        totalCards: number
        closedCards: number
        totalRevenue: number
        conversionRate: number
      }
    > = {}

    filteredCards.forEach((card) => {
      if (!card.assignedTo) return

      const sellerId = card.assignedTo
      // Como não temos users da API, usar o ID diretamente
      const sellerName = sellerId || 'Sem vendedor'

      if (!metrics[sellerId]) {
        metrics[sellerId] = {
          name: sellerName,
          totalCards: 0,
          closedCards: 0,
          totalRevenue: 0,
          conversionRate: 0,
        }
      }

      metrics[sellerId].totalCards += 1

      if (card.status === 'closed' || card.status === 'concluido') {
        metrics[sellerId].closedCards += 1
        metrics[sellerId].totalRevenue += card.value || 0
      }
    })

    // Calcular taxa de conversão
    Object.values(metrics).forEach((metric) => {
      metric.conversionRate = calculateConversionRate(
        metric.closedCards,
        metric.totalCards
      )
    })

    return Object.values(metrics).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    )
  }, [filteredCards, users])

  const revenueChartData = useMemo(() => {
    return sellerMetrics.map((metric) => ({
      name: metric.name,
      revenue: metric.totalRevenue,
    }))
  }, [sellerMetrics])

  const conversionChartData = useMemo(() => {
    return sellerMetrics.map((metric) => ({
      name: metric.name,
      conversion: metric.conversionRate,
    }))
  }, [sellerMetrics])

  const activityChartData = useMemo(() => {
    return sellerMetrics.map((metric) => ({
      name: metric.name,
      activities: metric.totalCards,
    }))
  }, [sellerMetrics])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <ChartCard title="Performance por Vendedor" className="text-center py-8">
        <p className="text-destructive">Erro ao carregar dados</p>
      </ChartCard>
    )
  }

  if (sellerMetrics.length === 0) {
    return (
      <ChartCard title="Performance por Vendedor" className="text-center py-8">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </ChartCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de Receita */}
      <ChartCard title="Receita por Vendedor">
        <BarChart
          data={revenueChartData}
          bars={[
            {
              key: 'revenue',
              name: 'Receita (R$)',
              color: 'hsl(var(--chart-1))',
            },
          ]}
          xAxisKey="name"
          height={300}
        />
      </ChartCard>

      {/* Gráfico de Conversão */}
      <ChartCard title="Taxa de Conversão por Vendedor">
        <BarChart
          data={conversionChartData}
          bars={[
            {
              key: 'conversion',
              name: 'Taxa de Conversão (%)',
              color: 'hsl(var(--chart-2))',
            },
          ]}
          xAxisKey="name"
          height={300}
        />
      </ChartCard>

      {/* Gráfico de Atividades */}
      <ChartCard title="Número de Atividades por Vendedor">
        <BarChart
          data={activityChartData}
          bars={[
            {
              key: 'activities',
              name: 'Atividades',
              color: 'hsl(var(--chart-3))',
            },
          ]}
          xAxisKey="name"
          height={300}
        />
      </ChartCard>

      {/* Tabela Detalhada */}
      <ChartCard title="Detalhes de Performance por Vendedor">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Vendedor</th>
                <th className="text-right p-2">Total de Cards</th>
                <th className="text-right p-2">Fechados</th>
                <th className="text-right p-2">Taxa de Conversão</th>
                <th className="text-right p-2">Receita Total</th>
              </tr>
            </thead>
            <tbody>
              {sellerMetrics.map((metric, index) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-medium">{metric.name}</td>
                  <td className="p-2 text-right">{metric.totalCards}</td>
                  <td className="p-2 text-right">{metric.closedCards}</td>
                  <td className="p-2 text-right">
                    {formatPercentage(metric.conversionRate)}
                  </td>
                  <td className="p-2 text-right">
                    {formatCurrency(metric.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}

export default SellerPerformance

