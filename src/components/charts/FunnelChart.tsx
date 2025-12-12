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
  // Gradiente de cores do verde para amarelo
  const getColor = (index: number, total: number) => {
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
    return colors[index % colors.length]
  }

  // Ordenar por número de leads (maior para menor)
  const sortedData = [...data].sort((a, b) => b.leads - a.leads)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={sortedData}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
          tick={{ fill: '#d1d5db', fontSize: 12, fontWeight: 500 }}
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
        <Bar dataKey="leads" radius={[0, 8, 8, 0]} maxBarSize={50}>
          {sortedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getColor(index, sortedData.length)}
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

export default FunnelChart
