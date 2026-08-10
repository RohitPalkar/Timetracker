import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts'
import { ChartCard, ChartTooltip, chartAxisProps } from '@/components/charts/chart-card'
import { CHART_PALETTE } from '@/config/colors'
import type { QualityTrendPoint } from '@/types/dashboard'

export interface QualityTrendProps {
  data: QualityTrendPoint[]
  loading?: boolean
}

export function QualityTrendWidget({ data, loading }: QualityTrendProps) {
  return (
    <ChartCard
      title="Quality / Bug Trend"
      description="Bugs created, resolved and critical backlog"
      legend={[
        { label: 'Created', color: CHART_PALETTE[5] },
        { label: 'Resolved', color: CHART_PALETTE[2] },
        { label: 'Critical open', color: CHART_PALETTE[3] },
      ]}
      loading={loading}
    >
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="label" {...chartAxisProps} />
            <YAxis {...chartAxisProps} />
            <RechartsTooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--color-border-strong)' }} />
            <Line type="monotone" dataKey="created" name="Created" stroke={CHART_PALETTE[5]} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="resolved" name="Resolved" stroke={CHART_PALETTE[2]} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="criticalOpen" name="Critical open" stroke={CHART_PALETTE[3]} strokeWidth={2} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
