import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Droplets,
  Gauge,
  Info,
  ShieldCheck,
  Thermometer,
  Weight,
} from "lucide-react";
import type { Analysis, Readings } from "@/lib/ecopellet";
import type { TracePoint } from "@/hooks/useEcoPellet";
import { cn } from "@/lib/utils";

interface Props {
  readings: Readings;
  analysis: Analysis;
  trace: TracePoint[];
  started: boolean;
}

const tone = (band: Analysis["band"]) =>
  band === "EXCELLENT" || band === "GOOD"
    ? "text-primary"
    : band === "ACCEPTABLE"
      ? "text-warning"
      : "text-destructive";

function SensorCard({
  icon: Icon,
  label,
  value,
  unit,
  status,
  hint,
}: {
  icon: typeof Droplets;
  label: string;
  value: string;
  unit: string;
  status: "ok" | "warn" | "bad" | "idle";
  hint: string;
}) {
  const color =
    status === "ok" ? "text-primary" : status === "warn" ? "text-warning" : status === "bad" ? "text-destructive" : "text-muted-foreground";
  return (
    <div className="rounded-lg border border-border bg-panel p-3">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          <Icon className={cn("size-3.5", color)} />
          {label}
        </span>
        <span className={cn("size-1.5 rounded-full bg-current", color)} />
      </div>
      <p className="mt-2 font-mono text-2xl leading-none">
        <span className={color}>{value}</span>
        <span className="ml-1 text-xs text-muted-foreground">{unit}</span>
      </p>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

const chartTheme = {
  grid: "var(--grid-line)",
  axis: "var(--muted-foreground)",
};

function tooltipStyle() {
  return {
    contentStyle: {
      background: "var(--popover)",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      fontSize: "12px",
      color: "var(--popover-foreground)",
    },
    labelStyle: { color: "var(--muted-foreground)" },
  };
}

export function SbpaDashboard({ readings, analysis, trace, started }: Props) {
  const moistureStatus = !started ? "idle" : readings.moisture > 12 ? "bad" : readings.moisture > 10 ? "warn" : "ok";
  const tempStatus = !started ? "idle" : readings.temperature < 60 && readings.density > 0 ? "warn" : "ok";
  const densityStatus = !started || readings.density === 0 ? "idle" : readings.density < 0.95 ? "warn" : "ok";
  const durStatus = !started || readings.durability === 0 ? "idle" : readings.durability < 95 ? "warn" : "ok";

  return (
    <section className="panel p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">SBPA · Smart Biomass Pellet Analyzer</h2>
          <p className="text-xs text-muted-foreground">
            Receiving simulated sensor stream from the pelletization line
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-warning">
          <Info className="size-3" /> Simulated data
        </span>
      </header>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <SensorCard
            icon={Droplets}
            label="Moisture"
            value={started ? readings.moisture.toFixed(1) : "—"}
            unit="%"
            status={moistureStatus}
            hint="Optimal 6–10%"
          />
          <SensorCard
            icon={Thermometer}
            label="Temperature"
            value={started ? readings.temperature.toFixed(0) : "—"}
            unit="°C"
            status={tempStatus}
            hint="Die target 60–100°C"
          />
          <SensorCard
            icon={Gauge}
            label="Pellet Density"
            value={readings.density > 0 ? readings.density.toFixed(2) : "—"}
            unit="g/cm³"
            status={densityStatus}
            hint="Target ≥ 0.95"
          />
          <SensorCard
            icon={ShieldCheck}
            label="Durability"
            value={readings.durability > 0 ? readings.durability.toFixed(1) : "—"}
            unit="%"
            status={durStatus}
            hint="ISO 17831 ≥ 95%"
          />
          <SensorCard
            icon={Weight}
            label="Pellet Weight"
            value={readings.pelletWeight > 0 ? readings.pelletWeight.toFixed(1) : "—"}
            unit="kg"
            status={started ? "ok" : "idle"}
            hint={`From ${readings.inputWeight.toFixed(0)} kg biomass`}
          />
          <div className="rounded-lg border border-border bg-panel p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Score factors</p>
            <div className="mt-2 h-[92px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.breakdown} layout="vertical" margin={{ left: 0, right: 6, top: 0, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="label" interval={0} width={62} tick={{ fontSize: 9, fill: chartTheme.axis }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle()} cursor={{ fill: "transparent" }} />
                  <Bar dataKey="value" radius={3} barSize={9}>
                    {analysis.breakdown.map((b) => (
                      <Cell
                        key={b.label}
                        fill={b.value >= 75 ? "var(--chart-1)" : b.value >= 50 ? "var(--chart-3)" : "var(--chart-4)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* score */}
        <div className="flex flex-col justify-between rounded-lg border border-border bg-panel p-4 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Pellet Quality Score</p>
          <div className="my-2">
            <p className={cn("font-mono text-6xl font-semibold leading-none transition-colors", started ? tone(analysis.band) : "text-muted-foreground")}>
              {started ? analysis.score : "—"}
            </p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">/ 100</p>
          </div>
          <div
            className={cn(
              "rounded-md border px-3 py-2 font-display text-sm font-semibold tracking-wide",
              !started
                ? "border-border bg-secondary/40 text-muted-foreground"
                : analysis.band === "EXCELLENT" || analysis.band === "GOOD"
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : analysis.band === "ACCEPTABLE"
                    ? "border-warning/50 bg-warning/10 text-warning"
                    : "border-destructive/50 bg-destructive/10 text-destructive",
            )}
          >
            {started ? analysis.band : "STANDBY"}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{
                width: `${started ? analysis.score : "—"}%`,
                background: "var(--gradient-eco)",
              }}
            />
          </div>
        </div>
      </div>

      {/* charts */}
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-panel p-3">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Moisture &amp; Temperature
          </p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trace} margin={{ top: 4, right: 6, left: -22, bottom: 0 }}>
                <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 9, fill: chartTheme.axis }} tickLine={false} axisLine={false} unit="s" />
                <YAxis tick={{ fontSize: 9, fill: chartTheme.axis }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle()} />
                <Line type="monotone" dataKey="moisture" stroke="var(--chart-2)" strokeWidth={2} dot={false} isAnimationActive={false} name="Moisture %" />
                <Line type="monotone" dataKey="temperature" stroke="var(--chart-3)" strokeWidth={2} dot={false} isAnimationActive={false} name="Temp °C" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-panel p-3">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Density &amp; Durability
          </p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trace} margin={{ top: 4, right: 6, left: -22, bottom: 0 }}>
                <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 9, fill: chartTheme.axis }} tickLine={false} axisLine={false} unit="s" />
                <YAxis yAxisId="l" tick={{ fontSize: 9, fill: chartTheme.axis }} tickLine={false} axisLine={false} domain={[0, 1.4]} />
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 9, fill: chartTheme.axis }} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip {...tooltipStyle()} />
                <Line yAxisId="l" type="monotone" dataKey="density" stroke="var(--chart-1)" strokeWidth={2} dot={false} isAnimationActive={false} name="Density g/cm³" />
                <Line yAxisId="r" type="monotone" dataKey="durability" stroke="var(--chart-5)" strokeWidth={2} dot={false} isAnimationActive={false} name="Durability %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-panel p-3">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Quality Score Trend
          </p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trace} margin={{ top: 4, right: 6, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 9, fill: chartTheme.axis }} tickLine={false} axisLine={false} unit="s" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: chartTheme.axis }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle()} />
                <Area type="monotone" dataKey="score" stroke="var(--chart-1)" strokeWidth={2} fill="url(#scoreFill)" isAnimationActive={false} name="Score" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI panel */}
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-panel p-4">
          <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            <BrainCircuit className="size-3.5 text-accent" /> AI Insight
            <span className="rounded border border-border px-1.5 py-px text-[9px] tracking-normal">rule-based demo</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">{analysis.insight}</p>
          <div className="mt-3 rounded-md border border-primary/40 bg-primary/10 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">AI Recommendation</p>
            <p className="mt-1 text-sm font-medium">{analysis.recommendation}</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-panel p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Alerts</p>
          <ul className="mt-2 space-y-2">
            {analysis.alerts.map((a, i) => {
              const Icon = a.level === "ok" ? CheckCircle2 : AlertTriangle;
              return (
                <li
                  key={i}
                  className={cn(
                    "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
                    a.level === "ok"
                      ? "border-primary/40 bg-primary/5 text-primary"
                      : a.level === "warn"
                        ? "border-warning/40 bg-warning/5 text-warning"
                        : "border-destructive/40 bg-destructive/5 text-destructive",
                  )}
                >
                  <Icon className="mt-0.5 size-4 shrink-0" />
                  <span className="text-foreground/90">{a.message}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
