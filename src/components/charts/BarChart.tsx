import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface BarChartProps {
  data: Array<Record<string, string | number>>
  bars: Array<{
    key: string
    name: string
    color?: string
  }>
  xAxisKey?: string
  height?: number
}

const BarChart = ({
  data,
  bars,
  xAxisKey = 'name',
  height = 300,
}: BarChartProps) => {
  const colors = [
    '#c8fa00',
    '#10b981',
    '#3b82f6',
    '#8b5cf6',
    '#f59e0b',
  ]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.5} />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          axisLine={{ stroke: '#4b5563' }}
          tickLine={{ stroke: '#4b5563' }}
        />
        <YAxis
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          axisLine={{ stroke: '#4b5563' }}
          tickLine={{ stroke: '#4b5563' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
          labelStyle={{ color: '#f9fafb', fontWeight: 600 }}
          itemStyle={{ color: '#d1d5db' }}
        />
        <Legend 
          wrapperStyle={{ color: '#9ca3af' }}
          formatter={(value) => <span style={{ color: '#d1d5db' }}>{value}</span>}
        />
        {bars.map((bar, index) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name}
            fill={bar.color || colors[index % colors.length]}
            radius={[6, 6, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

export default BarChart
