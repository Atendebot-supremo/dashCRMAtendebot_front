import { useMemo } from 'react'
import { AlertTriangle, TrendingDown, BarChart3, PieChart, TableIcon } from 'lucide-react'
import ChartCard from '@/components/dashboard/ChartCard'
import BarChart from '@/components/charts/BarChart'
import PieChartComponent from '@/components/charts/PieChart'
import { useCards } from '@/lib/api/queries'
import { calculateLostValue } from '@/lib/utils/calculations'
import {
  filterCardsByPeriod,
  filterCardsByUser,
  filterCardsByChannel,
} from '@/lib/utils/calculations'
import { formatCurrency } from '@/lib/utils/format'
import type { DashboardFilters, Card } from '@/types/crm'

interface LossAnalysisProps {
  filters?: DashboardFilters
}

const LossAnalysis = ({ filters }: LossAnalysisProps) => {
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

  const lostMetrics = useMemo(() => {
    return calculateLostValue(filteredCards)
  }, [filteredCards])

  const totalLostValue = useMemo(() => {
    return lostMetrics.reduce((sum, item) => sum + item.value, 0)
  }, [lostMetrics])

  const barChartData = useMemo(() => {
    return lostMetrics.map((metric) => ({
      name: metric.reason,
      value: metric.value,
      count: metric.count,
    }))
  }, [lostMetrics])

  const pieChartData = useMemo(() => {
    return lostMetrics.map((metric) => ({
      name: metric.reason,
      value: metric.value,
    }))
  }, [lostMetrics])

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
      <ChartCard title="Análise de Perdas" className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <p className="text-red-400 font-medium">Erro ao carregar dados</p>
        </div>
      </ChartCard>
    )
  }

  if (lostMetrics.length === 0) {
    return (
      <ChartCard title="Análise de Perdas" className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <TrendingDown className="h-6 w-6 text-emerald-400" />
          </div>
          <p className="text-gray-400">Nenhuma perda registrada</p>
          <p className="text-xs text-gray-500">Ótimo trabalho! 🎉</p>
        </div>
      </ChartCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="group relative rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-gray-800/80 backdrop-blur-xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 border border-red-500/30">
              <TrendingDown className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Valor Total Perdido</p>
              <p className="text-2xl font-bold text-red-400">
                {formatCurrency(totalLostValue)}
              </p>
            </div>
          </div>
        </div>

        <div className="group relative rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-gray-800/80 backdrop-blur-xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Perdas</p>
              <p className="text-2xl font-bold text-white">
                {lostMetrics.reduce((sum, item) => sum + item.count, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="group relative rounded-xl border border-gray-600/30 bg-gray-800/80 backdrop-blur-xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-700/50 border border-gray-600/30">
              <BarChart3 className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Motivos Diferentes</p>
              <p className="text-2xl font-bold text-white">{lostMetrics.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Barras - Valor por Motivo */}
      <ChartCard 
        title="Valor Perdido por Motivo"
        icon={<BarChart3 className="h-4 w-4 text-[#c8fa00]" />}
      >
        <BarChart
          data={barChartData}
          bars={[
            {
              key: 'value',
              name: 'Valor Perdido (R$)',
              color: '#ef4444',
            },
          ]}
          xAxisKey="name"
          height={300}
        />
      </ChartCard>

      {/* Gráfico de Pizza - Distribuição */}
      <ChartCard 
        title="Distribuição de Perdas por Motivo"
        icon={<PieChart className="h-4 w-4 text-[#c8fa00]" />}
      >
        <PieChartComponent data={pieChartData} height={300} />
      </ChartCard>

      {/* Tabela Detalhada */}
      <ChartCard 
        title="Detalhes de Perdas por Motivo"
        icon={<TableIcon className="h-4 w-4 text-[#c8fa00]" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left p-4 font-semibold text-gray-300">Motivo</th>
                <th className="text-right p-4 font-semibold text-gray-300">Quantidade</th>
                <th className="text-right p-4 font-semibold text-gray-300">Valor Total</th>
                <th className="text-right p-4 font-semibold text-gray-300">Valor Médio</th>
              </tr>
            </thead>
            <tbody>
              {lostMetrics.map((metric, index) => (
                <tr key={index} className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="font-medium text-white">{metric.reason}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                      {metric.count}
                    </span>
                  </td>
                  <td className="p-4 text-right font-semibold text-red-400">
                    {formatCurrency(metric.value)}
                  </td>
                  <td className="p-4 text-right text-gray-300">
                    {formatCurrency(metric.value / metric.count)}
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

export default LossAnalysis
