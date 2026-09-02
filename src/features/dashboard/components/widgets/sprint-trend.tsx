import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts'
import { ChartCard, ChartTooltip, chartAxisProps } from '@/components/charts/chart-card'
import { CHART_PALETTE } from '@/config/colors'
import type { SprintTrendPoint } from '@/types/dashboard'

export interface SprintTrendProps {
  data: SprintTrendPoint[]
  loading?: boolean
}

export function SprintTrendWidget({ data, loading }: SprintTrendProps) {
  return (
    <ChartCard
      title="Sprint / Delivery Trend"
      description="Planned vs completed points across sprints"
      legend={[
        { label: 'Planned', color: CHART_PALETTE[1] },
        { label: 'Completed', color: CHART_PALETTE[0] },
      ]}
      loading={loading}
    >
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="label" {...chartAxisProps} tickFormatter={(value: string) => value.replace('Sprint ', 'S')} />
            <YAxis {...chartAxisProps} />
            <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }} />
            <Bar dataKey="planned" name="Planned" fill={CHART_PALETTE[1]} radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="completed" name="Completed" fill={CHART_PALETTE[0]} radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
