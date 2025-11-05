import { useMemo } from 'react'
import { Card, Title, BarChart as TremorBarChart } from '@tremor/react'
import FunnelChart from '@/components/charts/FunnelChart'
import { useCards } from '@/lib/api/queries'
import { calculateFunnelMetrics } from '@/lib/utils/calculations'
import { filterCardsByPeriod, filterCardsByUser, filterCardsByChannel } from '@/lib/utils/calculations'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'
import type { DashboardFilters } from '@/lib/api/helena-types'
import type { Card } from '@/lib/api/helena-types'

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
        <div className="h-[400px] animate-pulse rounded-lg bg-gray-200" />
        <div className="h-[300px] animate-pulse rounded-lg bg-gray-200" />
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="text-center py-8">
        <p className="text-red-600">Erro ao carregar dados do funil</p>
      </Card>
    )
  }

  if (funnelMetrics.length === 0) {
    return (
      <Card className="text-center py-8">
        <p className="text-gray-600">Nenhum dado disponível</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de Funil */}
      <Card>
        <Title>Funil de Vendas - Quantidade de Leads por Etapa</Title>
        <div className="mt-6">
          <FunnelChart data={chartData} height={400} />
        </div>
      </Card>

      {/* Gráfico de Valores */}
      <Card>
        <Title>Valor em Reais por Etapa</Title>
        <TremorBarChart
          className="mt-6"
          data={valueChartData}
          index="name"
          categories={['value']}
          colors={['blue']}
          yAxisWidth={60}
        />
      </Card>

      {/* Tabela de Métricas */}
      <Card>
        <Title>Métricas Detalhadas por Etapa</Title>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Etapa</th>
                <th className="text-right p-2">Leads</th>
                <th className="text-right p-2">Valor Total</th>
                <th className="text-right p-2">Taxa de Conversão</th>
                <th className="text-right p-2">Tempo Médio</th>
              </tr>
            </thead>
            <tbody>
              {funnelMetrics.map((metric, index) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-medium">{metric.stage}</td>
                  <td className="p-2 text-right">{metric.leads}</td>
                  <td className="p-2 text-right">
                    {formatCurrency(metric.value)}
                  </td>
                  <td className="p-2 text-right">
                    {formatPercentage(metric.conversionRate)}
                  </td>
                  <td className="p-2 text-right">
                    {metric.averageTime.toFixed(1)} dias
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default FunilView

