import { useMemo } from 'react'
import { Users, Trophy, Medal, Award, DollarSign } from 'lucide-react'
import ChartCard from '@/components/dashboard/ChartCard'
import { useAgents, useCards } from '@/lib/api/queries'
import {
  filterCardsByPeriod,
  filterCardsByUser,
  filterCardsByChannel,
  calculateSellerProportionalRevenue,
} from '@/lib/utils/calculations'
import { isCardInFinalStage } from '@/lib/utils/stage-mapping'
import { formatCurrency } from '@/lib/utils/format'
import type { DashboardFilters, Card } from '@/types/crm'

const TOP_SELLERS_LIMIT = 3

interface SellerPerformanceProps {
  filters?: DashboardFilters
}

const SellerPerformance = ({ filters }: SellerPerformanceProps) => {
  const { data: cards = [], isLoading, isError } = useCards(filters)
  const { data: agents = [], isLoading: isAgentsLoading } = useAgents(
    filters?.panelId || '',
    Boolean(filters?.panelId)
  )

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

    if (filters?.userId) {
      filtered = filterCardsByUser(filtered, filters.userId)
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

    // Pré-carrega vendedores vindos da rota de agentes
    agents.forEach((agent) => {
      if (!agent.userId) return

      metrics[agent.userId] = {
        id: agent.userId,
        name: agent.name || `Vendedor ${agent.userId.slice(0, 8)}`,
        totalCards: 0,
        closedCards: 0,
        totalRevenue: 0,
        conversionRate: 0,
      }
    })

    // Calcular receita proporcional de cada vendedor
    const revenueMap = calculateSellerProportionalRevenue(filteredCards)

    filteredCards.forEach((card) => {
      if (!card.responsibleUserId) return

      const sellerId = card.responsibleUserId
      const sellerName =
        card.responsibleUser?.name || `Vendedor ${sellerId.slice(0, 8)}`

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

      // Cards totais do vendedor no período/filtros
      metrics[sellerId].totalCards += 1

      // Ganhos somente em etapa final
      if (isCardInFinalStage(card)) {
        metrics[sellerId].closedCards += 1
      }
    })

    // Atribuir receita calculada (proporcional ou direta)
    Object.keys(metrics).forEach((sellerId) => {
      metrics[sellerId].totalRevenue = revenueMap.get(sellerId) || 0
    })

    Object.values(metrics).forEach((metric) => {
      metric.conversionRate =
        metric.totalCards > 0
          ? (metric.closedCards / metric.totalCards) * 100
          : 0
    })

    // Ordenar por receita → ganhos → total de cards
    const sorted = Object.values(metrics).sort(
      (a, b) =>
        b.totalRevenue - a.totalRevenue ||
        b.closedCards - a.closedCards ||
        b.totalCards - a.totalCards
    )

    // Log de debug
    console.log('📊 Performance por Vendedor:', {
      agentesCarregados: agents.length,
      totalVendedores: sorted.length,
      cardsFiltrados: filteredCards.filter((c) => isCardInFinalStage(c)).length,
      ranking: sorted.slice(0, TOP_SELLERS_LIMIT).map((m, i) => ({
        posicao: i + 1,
        nome: m.name,
        cardsTotais: m.totalCards,
        cardsGanho: m.closedCards,
        receita: m.totalRevenue,
      })),
    })

    return sorted
  }, [agents, filteredCards])


  if (isLoading || isAgentsLoading) {
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

  const topSellers = sellerMetrics.slice(0, TOP_SELLERS_LIMIT)

  return (
    <div className="space-y-6">
      {/* Top 3 Vendedores */}
      <ChartCard
        title={`Top ${TOP_SELLERS_LIMIT} Vendedores`}
        icon={<Trophy className="h-4 w-4 text-[#c8fa00]" />}
      >
        <div className="space-y-4">
          {topSellers.map((metric, index) => {
            const position = index + 1
            const ranking = getRankingIcon(position)

            return (
              <div
                key={metric.id}
                className={`relative overflow-hidden rounded-xl border-2 p-5 transition-all ${
                  ranking
                    ? `${ranking.bg} ${ranking.border}`
                    : 'bg-gray-700/30 border-gray-600/30'
                } hover:border-[#c8fa00]/40`}
                role="listitem"
                aria-label={`${metric.name} - posição ${position}`}
                tabIndex={0}
              >
                <div className="flex items-center gap-4">
                  {/* Medalha */}
                  <div className="flex-shrink-0">
                    {ranking ? (
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full ${ranking.bg} ${ranking.border} border-2`}
                      >
                        <ranking.Icon className={`h-6 w-6 ${ranking.color}`} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700/50 border border-gray-600/50">
                        <span className="text-base font-bold text-gray-400">
                          #{position}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info do vendedor */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-[#c8fa00] flex-shrink-0" />
                      <span className="font-semibold text-white truncate text-lg">
                        {metric.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{metric.totalCards} cards</span>
                      <span className="text-[#c8fa00] font-medium">
                        {metric.closedCards} ganhos
                      </span>
                      {metric.conversionRate > 0 && (
                        <span>
                          {metric.conversionRate.toFixed(1)}% conversão
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Receita em destaque */}
                  <div className="flex flex-col items-end flex-shrink-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <DollarSign className="h-4 w-4 text-[#c8fa00]" />
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                        Receita
                      </span>
                    </div>
                    <span className="text-xl font-bold text-white">
                      {formatCurrency(metric.totalRevenue)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}

          {topSellers.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="h-12 w-12 rounded-full bg-gray-700/50 flex items-center justify-center">
                <Users className="h-6 w-6 text-gray-500" />
              </div>
              <p className="text-gray-400">Nenhum vendedor encontrado</p>
            </div>
          )}
        </div>
      </ChartCard>
    </div>
  )
}

export default SellerPerformance
