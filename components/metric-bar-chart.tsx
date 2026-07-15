"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts"

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]

export type MetricDatum = {
  name: string
  shortName: string
  value: number | null
  /** Overrides the tooltip/legend text for this bar (falls back to formatter(value)). */
  displayValue?: string
}

export type MetricBarChartProps = {
  title: string
  /** Small note under the title, e.g. clarifying an inverted scale. */
  caption?: string
  data: MetricDatum[]
  formatter?: (v: number) => string
  tickFormatter?: (v: number) => string
  domain?: [number, number]
}

export function MetricBarChart({ title, caption, data, formatter, tickFormatter, domain }: MetricBarChartProps) {
  const chartConfig = Object.fromEntries(
    data.map((d, i) => [d.shortName, { label: d.name, color: CHART_COLORS[i] }])
  )
  const chartData = data.map((d) => ({ name: d.shortName, value: d.value ?? 0, displayValue: d.displayValue }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[180px] w-full [aspect-ratio:auto]">
          <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} domain={domain} tickFormatter={tickFormatter ?? formatter} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) =>
                    item?.payload?.displayValue ?? (formatter ? formatter(Number(value)) : String(value))
                  }
                />
              }
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="mt-3 space-y-1">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: CHART_COLORS[i] }} />
              <span className="truncate">{d.name}</span>
              <span className="ml-auto font-medium text-foreground shrink-0">
                {d.displayValue ?? (d.value !== null ? (formatter ? formatter(d.value) : d.value) : "—")}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
