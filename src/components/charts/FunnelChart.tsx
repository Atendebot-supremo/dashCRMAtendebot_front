import { useState } from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface FunnelChartProps {
  data: Array<{
    stage: string
    leads: number
    value: number
    conversionRate: number
  }>
  height?: number
  onStageClick?: (stageName: string) => void
}

const FunnelChart = ({ data, height = 300, onStageClick }: FunnelChartProps) => {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null)

  // Gradiente de cores do verde para amarelo
  const getColor = (index: number, total: number, isHovered: boolean) => {
    const colors = [
      '#c8fa00',
      '#b8ea10',
      '#a8da20',
      '#98ca30',
      '#88ba40',
      '#78aa50',
      '#689a60',
      '#588a70',
    ]
    const baseColor = colors[index % colors.length]
    
    // Se está em hover, usar uma cor mais brilhante
    if (isHovered) {
      return '#c8fa00' // Verde brilhante para hover
    }
    return baseColor
  }

  // Ordenar por número de leads (maior para menor)
  const sortedData = [...data].sort((a, b) => b.leads - a.leads)

  const cursorStyle = onStageClick ? 'pointer' : 'default'

  return (
    <div className="funnel-chart-container">
      <style>{`
        /* Remover completamente o hover padrão do Recharts que deixa branco */
        .funnel-chart-container .recharts-bar-rectangle:hover {
          fill-opacity: 1 !important;
          opacity: 1 !important;
          filter: none !important;
        }
        .funnel-chart-container .recharts-bar-rectangle {
          transition: fill 0.2s ease-in-out !important;
          pointer-events: all;
          cursor: ${cursorStyle} !important;
        }
        .funnel-chart-container .recharts-active-bar {
          fill-opacity: 1 !important;
        }
        .funnel-chart-container .recharts-bar-rectangle[fill] {
          transition: fill 0.2s ease-in-out !important;
        }
        /* Garantir que o fill não mude no hover */
        .funnel-chart-container svg .recharts-bar-rectangle:hover {
          filter: none !important;
          opacity: 1 !important;
        }
        /* Sobrescrever qualquer estilo inline do Recharts */
        .funnel-chart-container .recharts-bar-rectangle[style*="fill"]:hover {
          opacity: 1 !important;
        }
        /* Cursor pointer para os paths das barras */
        .funnel-chart-container svg path.recharts-rectangle {
          cursor: ${cursorStyle} !important;
        }
        /* Cursor pointer para qualquer elemento de barra */
        .funnel-chart-container svg g.recharts-bar-rectangle {
          cursor: ${cursorStyle} !important;
        }
        /* Cursor pointer para o grupo de barras */
        .funnel-chart-container svg g[class*="recharts-bar"] {
          cursor: ${cursorStyle} !important;
        }
      `}</style>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          style={{ cursor: onStageClick ? 'pointer' : 'default' }}
        >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.5} horizontal={false} />
        <XAxis 
          type="number" 
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          axisLine={{ stroke: '#4b5563' }}
          tickLine={{ stroke: '#4b5563' }}
        />
        <YAxis
          dataKey="stage"
          type="category"
          width={150}
          tick={(props: any) => {
            const { payload, x, y } = props
            const isHovered = hoveredStage === payload.value
            return (
              <g transform={`translate(${x},${y})`}>
                <text
                  x={0}
                  y={0}
                  dy={4}
                  textAnchor="end"
                  fill={isHovered ? '#c8fa00' : '#d1d5db'}
                  fontSize={12}
                  fontWeight={isHovered ? 600 : 500}
                  className="transition-colors duration-200"
                >
                  {payload.value}
                </text>
              </g>
            )
          }}
          axisLine={{ stroke: '#4b5563' }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
          labelStyle={{ color: '#f9fafb', fontWeight: 600, marginBottom: 8 }}
          formatter={(value: number, name: string, props: any) => {
            if (name === 'leads') {
              return [
                <span key="value" style={{ color: '#c8fa00', fontWeight: 600 }}>
                  {value} leads ({props.payload.conversionRate.toFixed(1)}%)
                </span>,
                'Quantidade',
              ]
            }
            return [value, name]
          }}
        />
        <Bar 
          dataKey="leads" 
          radius={[0, 8, 8, 0]} 
          maxBarSize={50}
          onClick={(data) => onStageClick?.(data.stage)}
          onMouseEnter={(data) => setHoveredStage(data.stage)}
          onMouseLeave={() => setHoveredStage(null)}
          style={{ cursor: onStageClick ? 'pointer' : 'default' }}
          isAnimationActive={false}
        >
          {sortedData.map((entry, index) => {
            const isHovered = hoveredStage === entry.stage
            const fillColor = getColor(index, sortedData.length, isHovered)
            return (
              <Cell
                key={`cell-${index}`}
                fill={fillColor}
                style={{
                  fill: fillColor,
                  transition: 'fill 0.2s ease-in-out',
                }}
              />
            )
          })}
        </Bar>
      </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default FunnelChart
