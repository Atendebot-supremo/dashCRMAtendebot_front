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
}

const FunnelChart = ({ data, height = 300 }: FunnelChartProps) => {
  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ]

  // Ordenar por número de leads (maior para menor)
  const sortedData = [...data].sort((a, b) => b.leads - a.leads)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={sortedData}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis type="number" className="text-xs" />
        <YAxis
          dataKey="stage"
          type="category"
          width={120}
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'calc(var(--radius) - 2px)',
          }}
          formatter={(value: number, name: string, props: any) => {
            if (name === 'leads') {
              return [
                `${value} leads (${props.payload.conversionRate.toFixed(1)}%)`,
                'Quantidade',
              ]
            }
            return [value, name]
          }}
        />
        <Bar dataKey="leads" radius={[0, 4, 4, 0]}>
          {sortedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

export default FunnelChart

