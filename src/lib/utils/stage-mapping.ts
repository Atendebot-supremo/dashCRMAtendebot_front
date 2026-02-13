import type { Card } from '@/types/crm'

// Mapeamento dinâmico de stepId para nome
// Será atualizado quando buscarmos informações do painel
let stepIdToNameMap: Record<string, string> = {}

// Armazenar todas as etapas do painel (com posição, contagem e valor agregado)
let allPanelSteps: Array<{
  id: string
  title: string
  position: number
  isFinal?: boolean
  cardCount?: number
  monetaryAmount?: number
}> = []

/**
 * Atualiza o mapeamento de stepId para nome
 */
export const updateStepMapping = (
  steps: Array<{
    id: string
    title: string
    position?: number
    isFinal?: boolean
    cardCount?: number
    monetaryAmount?: number
  }>
) => {
  stepIdToNameMap = {}
  allPanelSteps = []
  
  steps.forEach((step) => {
    stepIdToNameMap[step.id] = step.title
    allPanelSteps.push({
      id: step.id,
      title: step.title,
      position: step.position ?? 0,
      isFinal: step.isFinal,
      cardCount: step.cardCount,
      monetaryAmount: step.monetaryAmount,
    })
  })
  
  // Ordenar por posição
  allPanelSteps.sort((a, b) => a.position - b.position)
  
  console.log('📋 [StageMapping] Mapeamento de etapas atualizado:', stepIdToNameMap)
  console.log('📋 [StageMapping] Total de etapas:', allPanelSteps.length)
  console.log('📋 [StageMapping] Etapas ordenadas:', allPanelSteps)
}

/**
 * Retorna todas as etapas do painel ordenadas por posição
 */
export const getAllPanelSteps = (): Array<{
  id: string
  title: string
  position: number
  cardCount?: number
  monetaryAmount?: number
}> => {
  return allPanelSteps.map(({ id, title, position, cardCount, monetaryAmount }) => ({
    id,
    title,
    position,
    cardCount,
    monetaryAmount,
  }))
}

/**
 * Mapeia stepId para nome da etapa baseado nos dados reais
 */
export const getStepName = (stepId: string): string => {
  // Tentar buscar no mapeamento dinâmico
  if (stepIdToNameMap[stepId]) {
    return stepIdToNameMap[stepId]
  }
  
  // Fallback: retornar um nome mais amigável baseado no ID
  return `Etapa ${stepId.substring(0, 8)}...`
}

/**
 * Mapeia stepId de um card para nome da etapa
 * Prioridade: stepTitle do card > mapeamento dinâmico > ID encurtado
 */
export const getStageName = (card: Card): string => {
  // Se tem stepTitle no card, usa ele
  if (card.stepTitle) {
    return card.stepTitle
  }
  
  // Usar mapeamento dinâmico
  return getStepName(card.stepId)
}

/**
 * IDs das etapas finais do painel atual.
 * Prioridade: etapas marcadas como finais -> última etapa por posição.
 */
export const getFinalStepIds = (): string[] => {
  if (allPanelSteps.length === 0) return []

  const explicitFinalSteps = allPanelSteps.filter((step) => step.isFinal)
  if (explicitFinalSteps.length > 0) {
    return explicitFinalSteps.map((step) => step.id)
  }

  const lastStep = [...allPanelSteps].sort((a, b) => a.position - b.position).at(-1)
  return lastStep ? [lastStep.id] : []
}

/**
 * Verifica se o card está em etapa final.
 * Usa stepId/stepPhase com fallback por nome da etapa.
 */
export const isCardInFinalStage = (card: Card): boolean => {
  const finalStepIds = getFinalStepIds()
  if (finalStepIds.length > 0 && finalStepIds.includes(card.stepId)) {
    return true
  }

  if (typeof card.stepPhase === 'string' && card.stepPhase.toUpperCase() === 'FINAL') {
    return true
  }

  const stageName = getStageName(card).toLowerCase()
  return (
    stageName.includes('conclu') ||
    stageName.includes('ganho') ||
    stageName.includes('fechado') ||
    stageName.includes('venda realizada')
  )
}

/**
 * Ordem das etapas do funil (da primeira para a última)
 */
export const STAGE_ORDER = [
  'Em atendimento',
  'Atendimento Humano',
  'Qualificado',
  'Orçamento Enviado',
  'Perdido',
  'Venda realizada',
]

/**
 * Ordena etapas na ordem correta do funil
 */
export const sortStagesByOrder = (stages: string[]): string[] => {
  return stages.sort((a, b) => {
    const indexA = STAGE_ORDER.indexOf(a)
    const indexB = STAGE_ORDER.indexOf(b)
    
    // Se não encontrou na ordem, coloca no final
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    
    return indexA - indexB
  })
}

/**
 * Extrai responsáveis únicos dos cards
 */
export const extractUniqueResponsibles = (cards: Card[]): Array<{ id: string; name: string }> => {
  const responsibleMap = new Map<string, string>()
  
  cards.forEach((card) => {
    if (card.responsibleUserId) {
      // Se não tem nome, usar ID como fallback
      const name = card.responsibleUser?.name || `Vendedor ${card.responsibleUserId.slice(0, 8)}`
      responsibleMap.set(card.responsibleUserId, name)
    }
  })
  
  return Array.from(responsibleMap.entries()).map(([id, name]) => ({
    id,
    name,
  }))
}

/**
 * Extrai canais únicos dos cards a partir do campo customFields['origem-11']
 */
export const extractUniqueChannels = (cards: Card[]): Array<{ id: string; name: string }> => {
  const channelMap = new Map<string, string>()
  
  cards.forEach((card) => {
    // Buscar canal do campo customFields['origem-11']
    const origem = card.customFields?.['origem-11']
    if (origem && typeof origem === 'string' && origem.trim()) {
      // Usar o valor como ID e nome (normalizado)
      const channelName = origem.trim()
      const channelId = channelName.toLowerCase().replace(/\s+/g, '-')
      channelMap.set(channelId, channelName)
    }
  })
  
  // Retornar canais encontrados nos cards
  return Array.from(channelMap.entries()).map(([id, name]) => ({
    id,
    name,
  }))
}

