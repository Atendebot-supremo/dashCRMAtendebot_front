import { useMemo } from 'react'
import ChartCard from '@/components/dashboard/ChartCard'
import BarChart from '@/components/charts/BarChart'
import { Skeleton } from '@/components/ui/skeleton'
import { useCards } from '@/lib/api/queries'
import {
  filterCardsByPeriod,
  filterCardsByUser,
  filterCardsByChannel,
  calculateConversionRate,
} from '@/lib/utils/calculations'
import { calculateDaysBetween } from '@/lib/utils/date'
import { formatCurrency, formatPercentage, formatDays } from '@/lib/utils/format'
import type { DashboardFilters } from '@/lib/api/helena-types'
import type { Card } from '@/lib/api/helena-types'

interface ProductAnalysisProps {
  filters?: DashboardFilters
}

const ProductAnalysis = ({ filters }: ProductAnalysisProps) => {
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

  const productMetrics = useMemo(() => {
    const metrics: Record<
      string,
      {
        name: string
        totalCards: number
        closedCards: number
        totalRevenue: number
        conversionRate: number
        averageTicket: number
        averageClosingTime: number
      }
    > = {}

    filteredCards.forEach((card) => {
      const product = card.product || 'Sem produto'
      
      if (!metrics[product]) {
        metrics[product] = {
          name: product,
          totalCards: 0,
          closedCards: 0,
          totalRevenue: 0,
          conversionRate: 0,
          averageTicket: 0,
          averageClosingTime: 0,
        }
      }

      metrics[product].totalCards += 1

      if (card.status === 'closed' || card.status === 'concluido') {
        metrics[product].closedCards += 1
        metrics[product].totalRevenue += card.value || 0

        if (card.createdAt && card.updatedAt) {
          const days = calculateDaysBetween(card.createdAt, card.updatedAt)
          metrics[product].averageClosingTime += days
        }
      }
    })

    // Calcular métricas finais
    Object.values(metrics).forEach((metric) => {
      metric.conversionRate = calculateConversionRate(
        metric.closedCards,
        metric.totalCards
      )
      metric.averageTicket =
        metric.closedCards > 0
          ? metric.totalRevenue / metric.closedCards
          : 0
      metric.averageClosingTime =
        metric.closedCards > 0
          ? metric.averageClosingTime / metric.closedCards
          : 0
    })

    return Object.values(metrics)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10) // Top 10 produtos
  }, [filteredCards])

  const revenueChartData = useMemo(() => {
    return productMetrics.map((metric) => ({
      name: metric.name,
      revenue: metric.totalRevenue,
    }))
  }, [productMetrics])

  const conversionChartData = useMemo(() => {
    return productMetrics.map((metric) => ({
      name: metric.name,
      conversion: metric.conversionRate,
    }))
  }, [productMetrics])

  const ticketChartData = useMemo(() => {
    return productMetrics.map((metric) => ({
      name: metric.name,
      ticket: metric.averageTicket,
    }))
  }, [productMetrics])

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
      <ChartCard title="Análise de Produtos" className="text-center py-8">
        <p className="text-destructive">Erro ao carregar dados</p>
      </ChartCard>
    )
  }

  if (productMetrics.length === 0) {
    return (
      <ChartCard title="Análise de Produtos" className="text-center py-8">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </ChartCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de Receita por Produto */}
      <ChartCard title="Receita por Produto/Serviço">
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

      {/* Gráfico de Taxa de Conversão */}
      <ChartCard title="Taxa de Conversão por Produto">
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

      {/* Gráfico de Ticket Médio */}
      <ChartCard title="Ticket Médio por Produto">
        <BarChart
          data={ticketChartData}
          bars={[
            {
              key: 'ticket',
              name: 'Ticket Médio (R$)',
              color: 'hsl(var(--chart-3))',
            },
          ]}
          xAxisKey="name"
          height={300}
        />
      </ChartCard>

      {/* Tabela de Ranking */}
      <ChartCard title="Ranking de Produtos/Serviços">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">#</th>
                <th className="text-left p-2">Produto/Serviço</th>
                <th className="text-right p-2">Vendas</th>
                <th className="text-right p-2">Taxa de Conversão</th>
                <th className="text-right p-2">Ticket Médio</th>
                <th className="text-right p-2">Tempo de Fechamento</th>
                <th className="text-right p-2">Receita Total</th>
              </tr>
            </thead>
            <tbody>
              {productMetrics.map((metric, index) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-medium">{index + 1}</td>
                  <td className="p-2 font-medium">{metric.name}</td>
                  <td className="p-2 text-right">{metric.closedCards}</td>
                  <td className="p-2 text-right">
                    {formatPercentage(metric.conversionRate)}
                  </td>
                  <td className="p-2 text-right">
                    {formatCurrency(metric.averageTicket)}
                  </td>
                  <td className="p-2 text-right">
                    {formatDays(metric.averageClosingTime)}
                  </td>
                  <td className="p-2 text-right font-medium">
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

export default ProductAnalysis

