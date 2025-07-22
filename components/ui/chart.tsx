"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

// Format: { THEME_NAME: { color: COLORS } }
const COLORS = {
  light: {
    grid: "hsl(214.3 31.8% 91.4%)",
    tooltip: "hsl(210 40% 98%)",
    axis: "hsl(215.4 16.3% 46.9%)",
    range: {
      "0": "hsl(217.2 91.2% 59.8%)",
      "1": "hsl(217.2 91.2% 59.8%)",
      "2": "hsl(217.2 91.2% 59.8%)",
      "3": "hsl(217.2 91.2% 59.8%)",
      "4": "hsl(217.2 91.2% 59.8%)",
    },
  },
  dark: {
    grid: "hsl(217.2 32.6% 17.5%)",
    tooltip: "hsl(222.2 84% 4.9%)",
    axis: "hsl(215 20.2% 65.1%)",
    range: {
      "0": "hsl(217.2 91.2% 59.8%)",
      "1": "hsl(217.2 91.2% 59.8%)",
      "2": "hsl(217.2 91.2% 59.8%)",
      "3": "hsl(217.2 91.2% 59.8%)",
      "4": "hsl(217.2 91.2% 59.8%)",
    },
  },
}

type ChartContextProps = {
  config: Record<string, { label?: string; color?: string }>
  stackes?: Record<string, string[]>
} & React.ComponentPropsWithoutRef<"div">

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <Chart />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    config: ChartContextProps["config"]
    stackes?: ChartContextProps["stackes"]
  }
>(({ config, stackes, className, children, ...props }, ref) => {
  const id = React.useId()
  const { theme } = useTheme()
  const chartConfig = React.useMemo(() => {
    if (config.theme) {
      return config
    }

    return {
      ...config,
      theme: {
        grid: COLORS[theme as keyof typeof COLORS].grid,
        tooltip: COLORS[theme as keyof typeof COLORS].tooltip,
        axis: COLORS[theme as keyof typeof COLORS].axis,
        range: COLORS[theme as keyof typeof COLORS].range,
      },
    }
  }, [config, theme])

  return (
    <ChartContext.Provider value={{ config: chartConfig, stackes }}>
      <div
        data-chart={id}
        ref={ref}
        className={cn("flex h-[400px] w-full flex-col items-center justify-center overflow-hidden", className)}
        {...props}
      >
        <style>
          {`
            [data-chart="${id}"] {
              --color-grid: ${chartConfig.theme?.grid};
              --color-tooltip: ${chartConfig.theme?.tooltip};
              --color-axis: ${chartConfig.theme?.axis};
              ${Object.entries(chartConfig)
                .filter(([key]) => key !== "theme")
                .map(([key, value]) => `--color-${key}: ${value.color};`)
                .join("\n")}
            }
          `}
        </style>
        {children}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip> & {
    hideIndicator?: boolean
    is:
      | "average"
      | "tooltip"
      | "axis"
      | "grid"
      | "range"
      | "label"
      | "value"
      | "line"
      | "area"
      | "bar"
      | "dot"
      | "legend"
      | "active"
      | "item"
      | "content"
      | "cursor"
      | "indicator"
      | "stroke"
      | "fill"
      | "text"
      | "background"
      | "border"
      | "ring"
      | "offset"
      | "shadow"
      | "primary"
      | "secondary"
      | "muted"
      | "accent"
      | "destructive"
      | "foreground"
      | "card"
      | "popover"
      | "chart"
      | "default"
      | "success"
      | "warning"
      | "error"
      | "info"
      | "dark"
      | "light"
      | "transparent"
      | "current"
      | "black"
      | "white"
      | "slate"
      | "gray"
      | "zinc"
      | "neutral"
      | "stone"
      | "red"
      | "orange"
      | "amber"
      | "yellow"
      | "lime"
      | "green"
      | "emerald"
      | "teal"
      | "cyan"
      | "sky"
      | "blue"
      | "indigo"
      | "violet"
      | "purple"
      | "fuchsia"
      | "pink"
      | "rose"
  }
>(({ hideIndicator = false, is: _is, className, content, ...props }, ref) => {
  const { config } = useChart()

  return (
    <RechartsPrimitive.Tooltip
      ref={ref}
      content={
        content ||
        (({ active, payload, label }) => {
          if (active && payload && payload.length) {
            return (
              <div
                className={cn(
                  "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-md",
                  className,
                )}
              >
                <div className="row-span-2 flex flex-col">
                  <div className="font-medium text-muted-foreground">{label}</div>
                  <div className="grid gap-1.5">
                    {payload.map((item, i) => {
                      const key = item.dataKey as keyof typeof config

                      return (
                        <div key={item.dataKey} className={cn("flex items-center justify-between gap-4", className)}>
                          {config[key]?.label && <span className="text-muted-foreground">{config[key]?.label}</span>}
                          <span className={cn("font-mono font-medium text-foreground", item.color)}>{item.value}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          }

          return null
        })
      }
      wrapperStyle={{
        outline: "none",
      }}
      cursor={{
        stroke: "var(--color-grid)",
        strokeWidth: 1,
      }}
      {...props}
    />
  )
})
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    hideIndicator?: boolean
    is:
      | "average"
      | "tooltip"
      | "axis"
      | "grid"
      | "range"
      | "label"
      | "value"
      | "line"
      | "area"
      | "bar"
      | "dot"
      | "legend"
      | "active"
      | "item"
      | "content"
      | "cursor"
      | "indicator"
      | "stroke"
      | "fill"
      | "text"
      | "background"
      | "border"
      | "ring"
      | "offset"
      | "shadow"
      | "primary"
      | "secondary"
      | "muted"
      | "accent"
      | "destructive"
      | "foreground"
      | "card"
      | "popover"
      | "chart"
      | "default"
      | "success"
      | "warning"
      | "error"
      | "info"
      | "dark"
      | "light"
      | "transparent"
      | "current"
      | "black"
      | "white"
      | "slate"
      | "gray"
      | "zinc"
      | "neutral"
      | "stone"
      | "red"
      | "orange"
      | "amber"
      | "yellow"
      | "lime"
      | "green"
      | "emerald"
      | "teal"
      | "cyan"
      | "sky"
      | "blue"
      | "indigo"
      | "violet"
      | "purple"
      | "fuchsia"
      | "pink"
      | "rose"
  }
>(({ hideIndicator = false, is: _is, className, ...props }, ref) => {
  const { config } = useChart()

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-md",
        className,
      )}
      {...props}
    >
      <div className="row-span-2 flex flex-col">
        <div className="font-medium text-muted-foreground" data-chart-tooltip-label></div>
        <div className="grid gap-1.5" data-chart-tooltip-content>
          {props.children}
        </div>
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Legend>>(
  ({ className, content, ...props }, ref) => {
    const { config } = useChart()

    return (
      <RechartsPrimitive.Legend
        ref={ref}
        content={
          content ||
          (({ payload }) => {
            return (
              <div className={cn("flex flex-wrap items-center justify-center gap-4", className)}>
                {payload?.map((item: any) => {
                  const key = item.dataKey as keyof typeof config
                  return (
                    <div key={item.value} className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3">
                      {config[key]?.color && (
                        <svg>
                          <rect width="12" height="12" fill={config[key]?.color} rx="2"></rect>
                        </svg>
                      )}
                      {config[key]?.label}
                    </div>
                  )
                })}
              </div>
            )
          })
        }
        {...props}
      />
    )
  },
)
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-wrap items-center justify-center gap-4", className)}
      data-chart-legend-content
      {...props}
    />
  ),
)
ChartLegendContent.displayName = "ChartLegendContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent }
