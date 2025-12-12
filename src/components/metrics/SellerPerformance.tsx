import { useMemo } from 'react'
import { Users, TrendingUp, Activity, TableIcon } from 'lucide-react'
import ChartCard from '@/components/dashboard/ChartCard'
import BarChart from '@/components/charts/BarChart'
import { useCards } from '@/lib/api/queries'
import {
  filterCardsByPeriod,
  filterCardsByUser,
  filterCardsByChannel,
} from '@/lib/utils/calculations'
import { calculateConversionRate } from '@/lib/utils/calculations'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'
import type { DashboardFilters, Card } from '@/types/crm'

interface SellerPerformanceProps {
  filters?: DashboardFilters
}

const SellerPerformance = ({ filters }: SellerPerformanceProps) => {
  const { data: cards = [], isLoading, isError } = useCards(filters)
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
        <div className="h-[300px] animate-pulse rounded-xl bg-gray-800/50 border border-gray-700/50" />
        <div className="h-[300px] animate-pulse rounded-xl bg-gray-800/50 border border-gray-700/50" />
      </div>
    )
  }

  if (isError) {
    return (
      <ChartCard title="Performance por Vendedor" className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-red-400" />
          </div>
          <p className="text-red-400 font-medium">Erro ao carregar dados</p>
        </div>
      </ChartCard>
    )
  }

  if (sellerMetrics.length === 0) {
    return (
      <ChartCard title="Performance por Vendedor" className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-700/50 flex items-center justify-center">
            <Users className="h-6 w-6 text-gray-500" />
          </div>
          <p className="text-gray-400">Nenhum dado disponível</p>
        </div>
      </ChartCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de Receita */}
      <ChartCard 
        title="Receita por Vendedor"
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

      {/* Gráfico de Conversão */}
      <ChartCard 
        title="Taxa de Conversão por Vendedor"
        icon={<Activity className="h-4 w-4 text-[#c8fa00]" />}
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

      {/* Gráfico de Atividades */}
      <ChartCard 
        title="Número de Atividades por Vendedor"
        icon={<Users className="h-4 w-4 text-[#c8fa00]" />}
      >
        <BarChart
          data={activityChartData}
          bars={[
            {
              key: 'activities',
              name: 'Atividades',
              color: '#3b82f6',
            },
          ]}
          xAxisKey="name"
          height={300}
        />
      </ChartCard>

      {/* Tabela Detalhada */}
      <ChartCard 
        title="Detalhes de Performance por Vendedor"
        icon={<TableIcon className="h-4 w-4 text-[#c8fa00]" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left p-4 font-semibold text-gray-300">Vendedor</th>
                <th className="text-right p-4 font-semibold text-gray-300">Total de Cards</th>
                <th className="text-right p-4 font-semibold text-gray-300">Fechados</th>
                <th className="text-right p-4 font-semibold text-gray-300">Taxa de Conversão</th>
                <th className="text-right p-4 font-semibold text-gray-300">Receita Total</th>
              </tr>
            </thead>
            <tbody>
              {sellerMetrics.map((metric, index) => (
                <tr key={index} className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c8fa00]/20 to-[#c8fa00]/5 flex items-center justify-center">
                        <Users className="h-4 w-4 text-[#c8fa00]" />
                      </div>
                      <span className="font-medium text-white">{metric.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right text-gray-300">{metric.totalCards}</td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {metric.closedCards}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`font-medium ${metric.conversionRate >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {formatPercentage(metric.conversionRate)}
                    </span>
                  </td>
                  <td className="p-4 text-right font-semibold text-white">
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
