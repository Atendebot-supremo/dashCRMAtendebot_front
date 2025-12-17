import type { Card } from '@/types/crm'

// Mapeamento dinâmico de stepId para nome
// Será atualizado quando buscarmos informações do painel
let stepIdToNameMap: Record<string, string> = {}

// Armazenar todas as etapas do painel (com posição)
let allPanelSteps: Array<{ id: string; title: string; position: number }> = []

/**
 * Atualiza o mapeamento de stepId para nome
 */
export const updateStepMapping = (steps: Array<{ id: string; title: string; position?: number }>) => {
  stepIdToNameMap = {}
  allPanelSteps = []
  
  steps.forEach((step) => {
    stepIdToNameMap[step.id] = step.title
    allPanelSteps.push({
      id: step.id,
      title: step.title,
      position: step.position ?? 0
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
export const getAllPanelSteps = (): Array<{ id: string; title: string; position: number }> => {
  return [...allPanelSteps]
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

