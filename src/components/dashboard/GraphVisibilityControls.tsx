import { Target, DollarSign, TrendingUp, Users, AlertTriangle, Calendar, Package, Eye, EyeOff } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import type { GraphVisibility } from '@/types/crm'

interface GraphVisibilityControlsProps {
  visibility: GraphVisibility
  onVisibilityChange: (visibility: GraphVisibility) => void
}

const graphTypes = [
  {
    key: 'conversionMetrics' as const,
    label: 'Métricas de Conversão',
    icon: Target,
    description: 'Taxa de conversão, ciclo de vendas, tempo de resposta',
  },
  {
    key: 'revenueMetrics' as const,
    label: 'Métricas de Receita',
    icon: DollarSign,
    description: 'Receita total, ticket médio, vendas fechadas',
  },
  {
    key: 'funilView' as const,
    label: 'Funil de Vendas',
    icon: TrendingUp,
    description: 'Visualização do funil por etapas',
  },
  {
    key: 'sellerPerformance' as const,
    label: 'Performance por Vendedor',
    icon: Users,
    description: 'Análise de performance individual',
  },
  {
    key: 'lossAnalysis' as const,
    label: 'Análise de Perdas',
    icon: AlertTriangle,
    description: 'Cards perdidos e motivos',
  },
  {
    key: 'temporalComparison' as const,
    label: 'Comparações Temporais',
    icon: Calendar,
    description: 'Comparação entre períodos',
  },
  {
    key: 'productAnalysis' as const,
    label: 'Análise de Produtos',
    icon: Package,
    description: 'Distribuição por produtos',
  },
]

const GraphVisibilityControls = ({
  visibility,
  onVisibilityChange,
}: GraphVisibilityControlsProps) => {
  const allVisible = Object.values(visibility).every((v) => v)
  const allHidden = Object.values(visibility).every((v) => !v)

  const handleToggle = (key: keyof GraphVisibility) => {
    onVisibilityChange({
      ...visibility,
      [key]: !visibility[key],
    })
  }

  const handleShowAll = () => {
    const allVisible: GraphVisibility = {
      conversionMetrics: true,
      revenueMetrics: true,
      funilView: true,
      sellerPerformance: true,
      lossAnalysis: true,
      temporalComparison: true,
      productAnalysis: true,
    }
    onVisibilityChange(allVisible)
  }

  const handleHideAll = () => {
    const allHidden: GraphVisibility = {
      conversionMetrics: false,
      revenueMetrics: false,
      funilView: false,
      sellerPerformance: false,
      lossAnalysis: false,
      temporalComparison: false,
      productAnalysis: false,
    }
    onVisibilityChange(allHidden)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8fa00]/10">
            <Eye className="h-4 w-4 text-[#c8fa00]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Gráficos</h3>
            <p className="text-xs text-gray-500">Mostrar/Ocultar</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShowAll}
            disabled={allVisible}
            className="h-7 px-2 text-xs text-gray-400 hover:text-white hover:bg-gray-700/50 disabled:opacity-50"
            title="Mostrar todos"
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHideAll}
            disabled={allHidden}
            className="h-7 px-2 text-xs text-gray-400 hover:text-white hover:bg-gray-700/50 disabled:opacity-50"
            title="Ocultar todos"
          >
            <EyeOff className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-2">
        {graphTypes.map((graph) => {
          const Icon = graph.icon
          const isChecked = visibility[graph.key]

          return (
            <label
              key={graph.key}
              className="flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-700/30 transition-colors group"
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => handleToggle(graph.key)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 flex-shrink-0 ${isChecked ? 'text-[#c8fa00]' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${isChecked ? 'text-white' : 'text-gray-400'}`}>
                    {graph.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  {graph.description}
                </p>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}

export default GraphVisibilityControls

