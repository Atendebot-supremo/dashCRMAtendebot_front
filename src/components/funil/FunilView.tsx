import { useMemo } from 'react'
import { TrendingUp, BarChart3, TableIcon } from 'lucide-react'
import FunnelChart from '@/components/charts/FunnelChart'
import ChartCard from '@/components/dashboard/ChartCard'
import { useCards } from '@/lib/api/queries'
import { calculateFunnelMetrics } from '@/lib/utils/calculations'
import { filterCardsByPeriod, filterCardsByUser, filterCardsByChannel } from '@/lib/utils/calculations'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'
import type { DashboardFilters, Card } from '@/types/crm'

interface FunilViewProps {
  filters?: DashboardFilters
}

const FunilView = ({ filters }: FunilViewProps) => {
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

  const funnelMetrics = useMemo(() => {
    return calculateFunnelMetrics(filteredCards)
  }, [filteredCards])

  const chartData = useMemo(() => {
    return funnelMetrics.map((metric) => ({
      stage: metric.stage,
      leads: metric.leads,
      value: metric.value,
      conversionRate: metric.conversionRate,
    }))
  }, [funnelMetrics])

  const valueChartData = useMemo(() => {
    return funnelMetrics.map((metric) => ({
      name: metric.stage,
      value: metric.value,
    }))
  }, [funnelMetrics])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-[400px] animate-pulse rounded-xl bg-gray-800/50 border border-gray-700/50" />
        <div className="h-[300px] animate-pulse rounded-xl bg-gray-800/50 border border-gray-700/50" />
      </div>
    )
  }

  if (isError) {
    return (
      <ChartCard title="Funil de Vendas" className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-red-400" />
          </div>
          <p className="text-red-400 font-medium">Erro ao carregar dados do funil</p>
        </div>
      </ChartCard>
    )
  }

  if (funnelMetrics.length === 0) {
    return (
      <ChartCard title="Funil de Vendas" className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-700/50 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-gray-500" />
          </div>
          <p className="text-gray-400">Nenhum dado disponível</p>
        </div>
      </ChartCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de Funil */}
      <ChartCard 
        title="Funil de Vendas - Quantidade de Leads por Etapa"
        icon={<TrendingUp className="h-4 w-4 text-[#c8fa00]" />}
      >
        <div className="mt-2">
          <FunnelChart data={chartData} height={400} />
        </div>
      </ChartCard>

      {/* Gráfico de Valores */}
      <ChartCard 
        title="Valor em Reais por Etapa"
        icon={<BarChart3 className="h-4 w-4 text-[#c8fa00]" />}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {valueChartData.map((item, index) => (
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

      {/* Tabela de Métricas */}
      <ChartCard 
        title="Métricas Detalhadas por Etapa"
        icon={<TableIcon className="h-4 w-4 text-[#c8fa00]" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left p-4 font-semibold text-gray-300">Etapa</th>
                <th className="text-right p-4 font-semibold text-gray-300">Leads</th>
                <th className="text-right p-4 font-semibold text-gray-300">Valor Total</th>
                <th className="text-right p-4 font-semibold text-gray-300">Taxa de Conversão</th>
                <th className="text-right p-4 font-semibold text-gray-300">Tempo Médio</th>
              </tr>
            </thead>
            <tbody>
              {funnelMetrics.map((metric, index) => (
                <tr 
                  key={index} 
                  className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#c8fa00] to-[#a8d600] shadow-sm shadow-[#c8fa00]/20" />
                      <span className="font-medium text-white">{metric.stage}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#c8fa00]/10 text-[#c8fa00] border border-[#c8fa00]/20">
                      {metric.leads}
                    </span>
                  </td>
                  <td className="p-4 text-right font-semibold text-white">
                    {formatCurrency(metric.value)}
                  </td>
                  <td className="p-4 text-right">
                    <span className={`font-medium ${metric.conversionRate >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {formatPercentage(metric.conversionRate)}
                    </span>
                  </td>
                  <td className="p-4 text-right text-gray-400">
                    {metric.averageTime.toFixed(1)} dias
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

export default FunilView
