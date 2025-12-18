import { useMemo } from 'react'
import { Users, TableIcon, Trophy, Medal, Award } from 'lucide-react'
import ChartCard from '@/components/dashboard/ChartCard'
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
        id: string
        name: string
        totalCards: number
        closedCards: number
        totalRevenue: number
        conversionRate: number
      }
    > = {}

    filteredCards.forEach((card) => {
      // Usar responsibleUserId e responsibleUser.name
      if (!card.responsibleUserId) return

      const sellerId = card.responsibleUserId
      const sellerName = card.responsibleUser?.name || `Vendedor ${sellerId.slice(0, 8)}`

      if (!metrics[sellerId]) {
        metrics[sellerId] = {
          id: sellerId,
          name: sellerName,
          totalCards: 0,
          closedCards: 0,
          totalRevenue: 0,
          conversionRate: 0,
        }
      }

      metrics[sellerId].totalCards += 1

      // Verificar se o card está em uma etapa final (Ganho, Venda realizada, etc.)
      // ou se tem monetaryAmount (indicando que foi fechado)
      const isClosed = card.stepPhase === 'FINAL' || (card.monetaryAmount && card.monetaryAmount > 0)
      
      if (isClosed) {
        metrics[sellerId].closedCards += 1
        metrics[sellerId].totalRevenue += card.monetaryAmount || 0
      }
    })

    Object.values(metrics).forEach((metric) => {
      metric.conversionRate = calculateConversionRate(
        metric.closedCards,
        metric.totalCards
      )
    })

    // Ordenar por quantidade de cards (ranking)
    return Object.values(metrics).sort(
      (a, b) => b.totalCards - a.totalCards
    )
  }, [filteredCards])


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

  // Função para obter o ícone e cor do ranking
  const getRankingIcon = (position: number) => {
    switch (position) {
      case 1:
        return { Icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' }
      case 2:
        return { Icon: Medal, color: 'text-gray-300', bg: 'bg-gray-300/10', border: 'border-gray-300/20' }
      case 3:
        return { Icon: Award, color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/20' }
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Ranking de Cards por Vendedor */}
      <ChartCard 
        title="Ranking de Cards por Vendedor"
        icon={<Trophy className="h-4 w-4 text-[#c8fa00]" />}
      >
        <div className="space-y-3">
          {sellerMetrics.slice(0, 10).map((metric, index) => {
            const position = index + 1
            const ranking = getRankingIcon(position)
            
            return (
              <div
                key={metric.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  ranking
                    ? `${ranking.bg} ${ranking.border} border-2`
                    : 'bg-gray-700/30 border-gray-600/30'
                } hover:border-[#c8fa00]/30`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Posição do Ranking */}
                  <div className="flex-shrink-0">
                    {ranking ? (
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${ranking.bg} ${ranking.border} border-2`}>
                        <ranking.Icon className={`h-5 w-5 ${ranking.color}`} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700/50 border border-gray-600/50">
                        <span className="text-sm font-bold text-gray-400">#{position}</span>
                      </div>
                    )}
                  </div>

                  {/* Nome do Vendedor */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#c8fa00] flex-shrink-0" />
                      <span className="font-semibold text-white truncate">{metric.name}</span>
                    </div>
                  </div>

                  {/* Quantidade de Cards */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-2xl font-bold text-[#c8fa00]">{metric.totalCards}</span>
                    <span className="text-sm text-gray-400">cards</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
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
                <th className="text-left p-4 font-semibold text-gray-300">Ranking</th>
                <th className="text-left p-4 font-semibold text-gray-300">Vendedor</th>
                <th className="text-right p-4 font-semibold text-gray-300">Total de Cards</th>
                <th className="text-right p-4 font-semibold text-gray-300">Fechados</th>
                <th className="text-right p-4 font-semibold text-gray-300">Taxa de Conversão</th>
                <th className="text-right p-4 font-semibold text-gray-300">Receita Total</th>
              </tr>
            </thead>
            <tbody>
              {sellerMetrics.map((metric, index) => {
                const position = index + 1
                const ranking = getRankingIcon(position)
                
                return (
                  <tr key={metric.id} className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center justify-center">
                        {ranking ? (
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${ranking.bg} ${ranking.border} border`}>
                            <ranking.Icon className={`h-4 w-4 ${ranking.color}`} />
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-gray-500">#{position}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c8fa00]/20 to-[#c8fa00]/5 flex items-center justify-center">
                          <Users className="h-4 w-4 text-[#c8fa00]" />
                        </div>
                        <span className="font-medium text-white">{metric.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#c8fa00]/10 text-[#c8fa00] border border-[#c8fa00]/20">
                        {metric.totalCards}
                      </span>
                    </td>
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
                )
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}

export default SellerPerformance
