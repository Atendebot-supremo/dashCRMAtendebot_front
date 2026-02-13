import type { Card, DashboardFilters } from '@/types/crm'
import { calculateDaysBetween, calculateMinutesBetween } from './date'

export interface FunnelMetrics {
  stage: string
  leads: number
  value: number
  conversionRate: number
  averageTime: number
}

export interface RevenueMetrics {
  totalRevenue: number
  averageTicket: number
  revenueBySeller: Record<string, number>
  revenueByChannel: Record<string, number>
}

export interface ConversionMetrics {
  overallConversionRate: number
  averageSalesCycle: number
  averageResponseTime: number
}

const normalizeCustomFieldKey = (value: string): string => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

const parseMonetaryValue = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) return null

  const normalized = trimmed
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')

  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Retorna o valor monetário do card com prioridade:
 * 1) Campo customizado "Valor atribuído" (e aliases)
 * 2) Campo customizado "faturamento"
 * 3) monetaryAmount da API
 * 4) value legado
 */
export const getCardAssignedValue = (card: Card): number => {
  const customFields = card.customFields ?? {}
  const customFieldsEntries = Object.entries(customFields)

  const aliasNormalizedKeys = new Set([
    'valoratribuido',
    'valor',
    'faturamento',
    'valorvenda',
    'valordavenda',
  ])

  for (const [key, rawValue] of customFieldsEntries) {
    if (!aliasNormalizedKeys.has(normalizeCustomFieldKey(key))) {
      continue
    }

    const parsed = parseMonetaryValue(rawValue)
    if (parsed !== null) {
      return parsed
    }
  }

  if (card.monetaryAmount !== null && card.monetaryAmount !== undefined) {
    return card.monetaryAmount
  }

  return (card as any).value || 0
}

const getPanelStepAggregatedRevenue = (): number => {
  return getAllPanelSteps().reduce((sum, step) => sum + (step.monetaryAmount ?? 0), 0)
}

const getPanelFinalStepsAggregatedRevenue = (): number => {
  const finalStepIds = new Set(getFinalStepIds())
  if (finalStepIds.size === 0) return 0

  return getAllPanelSteps().reduce((sum, step) => {
    if (!finalStepIds.has(step.id)) return sum
    return sum + (step.monetaryAmount ?? 0)
  }, 0)
}

/**
 * Calcula a receita proporcional de cada vendedor.
 *
 * Estratégia (por ordem de prioridade):
 *  1) Somar o "Valor atribuído" que vem nos customFields de cada card
 *     (via getCardAssignedValue). Se pelo menos 1 card do vendedor
 *     tiver valor > 0, usa essa soma direta.
 *  2) Se NENHUM card do vendedor tiver valor individual, distribui
 *     proporcionalmente o monetaryAmount agregado que vem na etapa
 *     do painel: (cards_do_vendedor_na_etapa / cardCount_da_etapa)
 *     * monetaryAmount_da_etapa.
 *
 * Retorna um Map<sellerId, receita>.
 */
export const calculateSellerProportionalRevenue = (
  cards: Card[]
): Map<string, number> => {
  const revenueMap = new Map<string, number>()

  // ---------- Tentar via valores individuais dos cards ----------
  const sellerDirectRevenue = new Map<string, number>()
  cards.forEach((card) => {
    if (!card.responsibleUserId) return
    const value = getCardAssignedValue(card)
    const current = sellerDirectRevenue.get(card.responsibleUserId) || 0
    sellerDirectRevenue.set(card.responsibleUserId, current + value)
  })

  const anySellerHasDirectValue = Array.from(sellerDirectRevenue.values()).some(
    (v) => v > 0
  )

  if (anySellerHasDirectValue) {
    console.log(
      '💰 [SellerRevenue] Usando valores diretos dos cards (customFields/monetaryAmount)'
    )
    return sellerDirectRevenue
  }

  // ---------- Fallback: distribuição proporcional por etapa ----------
  console.log(
    '💰 [SellerRevenue] Cards sem valores individuais → calculando proporcional via monetaryAmount das etapas'
  )

  const steps = getAllPanelSteps()

  // Agrupar qtde de cards por (sellerId, stepId)
  const sellerCardsByStep = new Map<string, Map<string, number>>()
  cards.forEach((card) => {
    if (!card.responsibleUserId) return

    const sellerId = card.responsibleUserId
    if (!sellerCardsByStep.has(sellerId)) {
      sellerCardsByStep.set(sellerId, new Map())
    }
    const stepMap = sellerCardsByStep.get(sellerId)!
    const stepId = card.stepId
    stepMap.set(stepId, (stepMap.get(stepId) || 0) + 1)
  })

  // Para cada vendedor, calcular a fatia proporcional em cada etapa
  sellerCardsByStep.forEach((stepMap, sellerId) => {
    let total = 0

    stepMap.forEach((sellerCount, stepId) => {
      const step = steps.find((s) => s.id === stepId)
      if (!step) return

      const stepCardCount = step.cardCount ?? 0
      const stepMonetary = step.monetaryAmount ?? 0
      if (stepCardCount <= 0 || stepMonetary <= 0) return

      total += (sellerCount / stepCardCount) * stepMonetary
    })

    revenueMap.set(sellerId, total)
  })

  console.log(
    '💰 [SellerRevenue] Receita proporcional calculada:',
    Object.fromEntries(revenueMap)
  )

  return revenueMap
}

export const calculateConversionRate = (
  converted: number,
  total: number
): number => {
  if (total === 0) return 0
  return (converted / total) * 100
}

export const calculateAverageTicket = (
  totalValue: number,
  totalCount: number
): number => {
  if (totalCount === 0) return 0
  return totalValue / totalCount
}

export const calculateSalesCycle = (cards: Card[]): number => {
  const cycles = cards
    .filter((card) => card.createdAt && card.updatedAt)
    .map((card) => calculateDaysBetween(card.createdAt!, card.updatedAt!))
    .filter((days) => days >= 0)

  if (cycles.length === 0) return 0
  const sum = cycles.reduce((acc, days) => acc + days, 0)
  return sum / cycles.length
}

export const calculateResponseTime = (cards: Card[]): number => {
  // Assumindo que há um campo de primeira resposta ou podemos calcular
  // Por enquanto, usando a diferença entre criação e primeira atualização
  const responseTimes = cards
    .filter((card) => card.createdAt && card.updatedAt)
    .map((card) => calculateMinutesBetween(card.createdAt!, card.updatedAt!))
    .filter((minutes) => minutes >= 0)

  if (responseTimes.length === 0) return 0
  const sum = responseTimes.reduce((acc, minutes) => acc + minutes, 0)
  return sum / responseTimes.length
}

import { getStepName, getAllPanelSteps, getFinalStepIds, isCardInFinalStage } from './stage-mapping'

export const calculateFunnelMetrics = (cards: Card[]): FunnelMetrics[] => {
  console.log('📊 [FunnelMetrics] Calculando métricas do funil...')
  console.log('📊 [FunnelMetrics] Total de cards:', cards.length)
  
  // Obter todas as etapas do painel
  const allSteps = getAllPanelSteps()
  console.log('📊 [FunnelMetrics] Total de etapas do painel:', allSteps.length)
  console.log('📊 [FunnelMetrics] Etapas do painel:', allSteps)
  
  // Log dos cards com seus stepIds
  console.log('📊 [FunnelMetrics] Cards com stepIds:', cards.map(c => ({
    id: c.id,
    title: c.title,
    stepId: c.stepId,
    stepTitle: c.stepTitle
  })))
  
  const normalizeStageName = (value: string): string => {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
  }

  // Índice de etapas do painel por nome normalizado
  const panelStageByNormalizedTitle = new Map<string, string>()
  allSteps.forEach((step) => {
    panelStageByNormalizedTitle.set(normalizeStageName(step.title), step.title)
  })

  // Mapear cards por NOME da etapa (regra solicitada)
  const stageMap = new Map<string, { cards: Card[]; totalValue: number; stageTitle: string }>()

  cards.forEach((card) => {
    // Prioriza mapeamento por nome vindo do card (normalizado)
    const rawCardStageName = card.stepTitle || getStepName(card.stepId) || 'Sem etapa'
    const normalizedCardStageName = normalizeStageName(rawCardStageName)
    const stageTitle = panelStageByNormalizedTitle.get(normalizedCardStageName) || rawCardStageName

    const current = stageMap.get(stageTitle) || {
      cards: [], 
      totalValue: 0, 
      stageTitle
    }
    current.cards.push(card)
    current.totalValue += getCardAssignedValue(card)
    stageMap.set(stageTitle, current)
  })

  console.log('📊 [FunnelMetrics] Etapas com cards (por nome):', Array.from(stageMap.entries()).map(([title, data]) => ({
    stageTitle: title,
    cardsCount: data.cards.length
  })))

  // Criar métricas para TODAS as etapas do painel, mesmo sem cards
  const metrics: FunnelMetrics[] = allSteps.map((step, index) => {
    // Buscar cards pelo NOME da etapa
    const stageData = stageMap.get(step.title)
    const panelStepCardCount = step.cardCount ?? 0
    const panelStepMonetaryAmount = step.monetaryAmount ?? 0
    
    // Se a etapa tem cards, usar os dados reais
    if (stageData) {
      const leadsFromCards = stageData.cards.length
      const leads = Math.max(leadsFromCards, panelStepCardCount)

      if (panelStepCardCount > leadsFromCards) {
        console.warn('⚠️ [FunnelMetrics] Divergência entre cards retornados e cardCount da etapa:', {
          stage: step.title,
          leadsFromCards,
          panelStepCardCount,
          usingLeads: leads,
        })
      }

      const valueFromCards = stageData.totalValue
      const value = Math.max(valueFromCards, panelStepMonetaryAmount)

      if (panelStepMonetaryAmount > valueFromCards) {
        console.warn('⚠️ [FunnelMetrics] Divergência de valor entre cards e etapa:', {
          stage: step.title,
          valueFromCards,
          panelStepMonetaryAmount,
          usingValue: value,
        })
      }

      return {
        stage: stageData.stageTitle,
        leads,
        value,
        averageTime: calculateAverageTimeForStage(stageData.cards),
        conversionRate: 0, // Será calculado depois
      }
    }
    
    // Se a etapa não tem cards no payload, usar cardCount do painel como fallback
    return {
      stage: step.title,
      leads: panelStepCardCount,
      value: panelStepMonetaryAmount,
      averageTime: 0,
      conversionRate: 0, // Será calculado depois
    }
  })

  // Se não há etapas do painel, usar as etapas que têm cards (fallback)
  if (allSteps.length === 0) {
    console.log('⚠️ [FunnelMetrics] Nenhuma etapa do painel encontrada, usando etapas dos cards')
    const stages = Array.from(stageMap.entries())
      .map(([stageTitle, data]) => ({
        stage: stageTitle,
        leads: data.cards.length,
        value: data.totalValue,
        averageTime: calculateAverageTimeForStage(data.cards),
        conversionRate: 0,
      }))
      .sort((a, b) => b.leads - a.leads)
    
    // Calcular taxa de conversão
    stages.forEach((stage, index) => {
      const previousTotal =
        index > 0
          ? stages
              .slice(0, index)
              .reduce((sum, s) => sum + s.leads, 0)
          : 0
      stage.conversionRate =
        previousTotal > 0
          ? calculateConversionRate(stage.leads, previousTotal)
          : 100
    })
    
    console.log('📊 [FunnelMetrics] Métricas calculadas (fallback):', stages.length)
    return stages
  }

  // Calcular taxa de conversão baseado na ordem das etapas do painel
  let previousTotal = 0
  metrics.forEach((metric, index) => {
    if (index === 0) {
      metric.conversionRate = 100 // Primeira etapa sempre 100%
    } else {
      metric.conversionRate =
        previousTotal > 0
          ? calculateConversionRate(metric.leads, previousTotal)
          : 0
    }
    previousTotal += metric.leads
  })

  console.log('📊 [FunnelMetrics] ✅ Métricas calculadas:', metrics.length, 'etapas')
  console.log('📊 [FunnelMetrics] Métricas:', JSON.stringify(metrics, null, 2))
  
  return metrics
}

const calculateAverageTimeForStage = (cards: Card[]): number => {
  const times = cards
    .filter((card) => card.createdAt && card.updatedAt)
    .map((card) => calculateDaysBetween(card.createdAt!, card.updatedAt!))
    .filter((days) => days >= 0)

  if (times.length === 0) return 0
  const sum = times.reduce((acc, days) => acc + days, 0)
  return sum / times.length
}

export const calculateRevenueMetrics = (
  cards: Card[],
  filters?: DashboardFilters
): RevenueMetrics => {
  const closedCards = cards.filter((card) => isCardInFinalStage(card))

  const totalRevenueFromCards = closedCards.reduce(
    (sum, card) => sum + getCardAssignedValue(card),
    0
  )
  const totalRevenueFromFinalSteps = getPanelFinalStepsAggregatedRevenue()
  const totalRevenue = Math.max(totalRevenueFromCards, totalRevenueFromFinalSteps)

  const revenueBySeller: Record<string, number> = {}
  const revenueByChannel: Record<string, number> = {}

  closedCards.forEach((card) => {
    if (card.assignedTo) {
      revenueBySeller[card.assignedTo] =
        (revenueBySeller[card.assignedTo] || 0) + getCardAssignedValue(card)
    }
    // Buscar canal do campo customFields['origem-11']
    const origem = card.customFields?.['origem-11']
    if (origem && typeof origem === 'string' && origem.trim()) {
      const channelName = origem.trim()
      revenueByChannel[channelName] =
        (revenueByChannel[channelName] || 0) + getCardAssignedValue(card)
    }
  })

  const closedCardsCountFallback = getAllPanelSteps().reduce((sum, step) => {
    if (!(getFinalStepIds().includes(step.id))) return sum
    return sum + (step.cardCount ?? 0)
  }, 0)
  const closedCount = Math.max(closedCards.length, closedCardsCountFallback)
  const averageTicket = calculateAverageTicket(totalRevenue, closedCount)

  if (totalRevenueFromFinalSteps > totalRevenueFromCards) {
    console.warn('⚠️ [RevenueMetrics] Usando receita agregada das etapas finais', {
      totalRevenueFromCards,
      totalRevenueFromFinalSteps,
      usingTotalRevenue: totalRevenue,
      closedCardsFromPayload: closedCards.length,
      closedCardsFromPanel: closedCardsCountFallback,
    })
  }

  return {
    totalRevenue,
    averageTicket,
    revenueBySeller,
    revenueByChannel,
  }
}

export const calculateConversionMetrics = (
  cards: Card[]
): ConversionMetrics => {
  const totalLeads = cards.length
  const convertedLeads = cards.filter((card) => isCardInFinalStage(card)).length

  const overallConversionRate = calculateConversionRate(
    convertedLeads,
    totalLeads
  )
  const averageSalesCycle = calculateSalesCycle(cards)
  const averageResponseTime = calculateResponseTime(cards)

  return {
    overallConversionRate,
    averageSalesCycle,
    averageResponseTime,
  }
}

export const calculateLostValue = (
  cards: Card[]
): { reason: string; value: number; count: number }[] => {
  const lostCards = cards.filter(
    (card) => card.status === 'lost' || card.status === 'perdido'
  )

  const lostByReason = new Map<
    string,
    { value: number; count: number }
  >()

  lostCards.forEach((card) => {
    const reason = card.lostReason || 'Sem motivo'
    const current = lostByReason.get(reason) || { value: 0, count: 0 }
    current.value += getCardAssignedValue(card)
    current.count += 1
    lostByReason.set(reason, current)
  })

  return Array.from(lostByReason.entries())
    .map(([reason, data]) => ({
      reason,
      value: data.value,
      count: data.count,
    }))
    .sort((a, b) => b.value - a.value)
}

export const aggregateByPeriod = (
  cards: Card[],
  period: 'day' | 'week' | 'month'
): Record<string, { count: number; value: number }> => {
  const aggregated: Record<
    string,
    { count: number; value: number }
  > = {}

  console.log(`📊 [aggregateByPeriod] Agregando ${cards.length} cards por período: ${period}`)

  cards.forEach((card, index) => {
    if (!card.createdAt) {
      if (index < 5) console.log(`⚠️ [aggregateByPeriod] Card ${index} sem createdAt:`, card.id)
      return
    }

    const date = new Date(card.createdAt)
    
    // Log dos primeiros 5 cards para debug
    if (index < 5) {
      console.log(`📅 [aggregateByPeriod] Card ${index}:`, {
        id: card.id,
        createdAt: card.createdAt,
        dateObject: date.toISOString(),
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        monthName: date.toLocaleString('pt-BR', { month: 'long' }),
      })
    }
    
    let key: string

    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        key = `${year}-${String(month).padStart(2, '0')}`
        if (index < 5) {
          console.log(`📅 [aggregateByPeriod] Card ${index} - Chave gerada: ${key} (${year}-${month})`)
        }
        break
      default:
        key = date.toISOString().split('T')[0]
    }

    if (!aggregated[key]) {
      aggregated[key] = { count: 0, value: 0 }
    }

    aggregated[key].count += 1
    aggregated[key].value += getCardAssignedValue(card)
  })

  console.log(`📊 [aggregateByPeriod] Resultado da agregação:`, JSON.stringify(aggregated, null, 2))
  console.log(`📊 [aggregateByPeriod] Total de períodos únicos: ${Object.keys(aggregated).length}`)

  const totalValueFromCards = Object.values(aggregated).reduce((sum, current) => sum + current.value, 0)
  const totalValueFromPanelSteps = getPanelStepAggregatedRevenue()
  if (totalValueFromPanelSteps > totalValueFromCards) {
    console.warn('⚠️ [aggregateByPeriod] Valor por card está abaixo do agregado das etapas', {
      totalValueFromCards,
      totalValueFromPanelSteps,
      note: 'Cards sem customFields/monetaryAmount podem causar isso.',
    })
  }

  return aggregated
}

export const filterCardsByPeriod = (
  cards: Card[],
  startDate?: string,
  endDate?: string
): Card[] => {
  if (!startDate && !endDate) return cards

  return cards.filter((card) => {
    if (!card.createdAt) return false

    const cardDate = new Date(card.createdAt)

    if (startDate) {
      const start = new Date(startDate)
      if (cardDate < start) return false
    }

    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      if (cardDate > end) return false
    }

    return true
  })
}

export const filterCardsByUser = (
  cards: Card[],
  userId?: string
): Card[] => {
  if (!userId) return cards
  // Usar responsibleUserId se disponível, senão usar assignedTo
  return cards.filter((card) => card.responsibleUserId === userId || card.assignedTo === userId)
}

export const filterCardsByChannel = (
  cards: Card[],
  channelId?: string
): Card[] => {
  if (!channelId) return cards
  
  return cards.filter((card) => {
    // Buscar canal do campo customFields['origem-11']
    const origem = card.customFields?.['origem-11']
    if (origem && typeof origem === 'string' && origem.trim()) {
      // Comparar com o ID normalizado
      const cardChannelId = origem.trim().toLowerCase().replace(/\s+/g, '-')
      return cardChannelId === channelId
    }
    return false
  })
}

