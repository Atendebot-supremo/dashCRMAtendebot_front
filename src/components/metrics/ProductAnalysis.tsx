import { useMemo } from 'react'
import { Package, TrendingUp, Target, Clock, TableIcon } from 'lucide-react'
import ChartCard from '@/components/dashboard/ChartCard'
import BarChart from '@/components/charts/BarChart'
import { useCards } from '@/lib/api/queries'
import {
  filterCardsByPeriod,
  filterCardsByUser,
  filterCardsByChannel,
  calculateConversionRate,
} from '@/lib/utils/calculations'
import { calculateDaysBetween } from '@/lib/utils/date'
import { formatCurrency, formatPercentage, formatDays } from '@/lib/utils/format'
import type { DashboardFilters, Card } from '@/types/crm'

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
      .slice(0, 10)
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
        <div className="h-[300px] animate-pulse rounded-xl bg-gray-800/50 border border-gray-700/50" />
        <div className="h-[300px] animate-pulse rounded-xl bg-gray-800/50 border border-gray-700/50" />
      </div>
    )
  }

  if (isError) {
    return (
      <ChartCard title="Análise de Produtos" className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <Package className="h-6 w-6 text-red-400" />
          </div>
          <p className="text-red-400 font-medium">Erro ao carregar dados</p>
        </div>
      </ChartCard>
    )
  }

  if (productMetrics.length === 0) {
    return (
      <ChartCard title="Análise de Produtos" className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-700/50 flex items-center justify-center">
            <Package className="h-6 w-6 text-gray-500" />
          </div>
          <p className="text-gray-400">Nenhum dado disponível</p>
        </div>
      </ChartCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de Receita por Produto */}
      <ChartCard 
        title="Receita por Produto/Serviço"
        icon={<TrendingUp className="h-4 w-4 text-[#c8fa00]" />}
      >
        <BarChart
          data={revenueChartData}
          bars={[
            {
              key: 'revenue',
              name: 'Receita (R$)',
              color: '#c8fa00',
            },
          ]}
          xAxisKey="name"
          height={300}
        />
      </ChartCard>

      {/* Gráfico de Taxa de Conversão */}
      <ChartCard 
        title="Taxa de Conversão por Produto"
        icon={<Target className="h-4 w-4 text-[#c8fa00]" />}
      >
        <BarChart
          data={conversionChartData}
          bars={[
            {
              key: 'conversion',
              name: 'Taxa de Conversão (%)',
              color: '#10b981',
            },
          ]}
          xAxisKey="name"
          height={300}
        />
      </ChartCard>

      {/* Gráfico de Ticket Médio */}
      <ChartCard 
        title="Ticket Médio por Produto"
        icon={<Clock className="h-4 w-4 text-[#c8fa00]" />}
      >
        <BarChart
          data={ticketChartData}
          bars={[
            {
              key: 'ticket',
              name: 'Ticket Médio (R$)',
              color: '#3b82f6',
            },
          ]}
          xAxisKey="name"
          height={300}
        />
      </ChartCard>

      {/* Tabela de Ranking */}
      <ChartCard 
        title="Ranking de Produtos/Serviços"
        icon={<TableIcon className="h-4 w-4 text-[#c8fa00]" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left p-4 font-semibold text-gray-300">#</th>
                <th className="text-left p-4 font-semibold text-gray-300">Produto/Serviço</th>
                <th className="text-right p-4 font-semibold text-gray-300">Vendas</th>
                <th className="text-right p-4 font-semibold text-gray-300">Taxa de Conversão</th>
                <th className="text-right p-4 font-semibold text-gray-300">Ticket Médio</th>
                <th className="text-right p-4 font-semibold text-gray-300">Tempo Fechamento</th>
                <th className="text-right p-4 font-semibold text-gray-300">Receita Total</th>
              </tr>
            </thead>
            <tbody>
              {productMetrics.map((metric, index) => (
                <tr key={index} className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors">
                  <td className="p-4">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-[#c8fa00] text-gray-900' :
                      index === 1 ? 'bg-gray-400 text-gray-900' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-[#c8fa00]" />
                      <span className="font-medium text-white">{metric.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#c8fa00]/10 text-[#c8fa00] border border-[#c8fa00]/20">
                      {metric.closedCards}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`font-medium ${metric.conversionRate >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {formatPercentage(metric.conversionRate)}
                    </span>
                  </td>
                  <td className="p-4 text-right text-gray-300">
                    {formatCurrency(metric.averageTicket)}
                  </td>
                  <td className="p-4 text-right text-gray-400">
                    {formatDays(metric.averageClosingTime)}
                  </td>
                  <td className="p-4 text-right font-bold text-white">
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
