import { Leaf, Flame, Cog, Layers, Snowflake, Package, CheckCircle2 } from "lucide-react";
import { STAGES, stageProgress, type Readings } from "@/lib/ecopellet";
import { cn } from "@/lib/utils";

const ICONS = [Leaf, Flame, Cog, Layers, Snowflake, Package];

interface Props {
  stageIndex: number;
  elapsed: number;
  running: boolean;
  readings: Readings;
  started: boolean;
}

function Metric({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-md border border-border bg-panel/70 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg leading-none text-foreground">
        {value}
        <span className="ml-1 text-xs text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

export function ProcessLine({ stageIndex, elapsed, running, readings, started }: Props) {
  return (
    <section className="panel relative overflow-hidden p-5">
      <div className="pointer-events-none absolute inset-0 grid-bg" aria-hidden />
      <div className="relative">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight">Pelletization Unit</h2>
            <p className="text-xs text-muted-foreground">
              Fallen leaf biomass · continuous line · simulated material flow
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-[11px] uppercase tracking-widest",
              running ? "border-primary/50 text-primary animate-pulse-ring" : "text-muted-foreground",
            )}
          >
            <span className={cn("size-1.5 rounded-full", running ? "bg-primary" : "bg-muted-foreground")} />
            {running ? "Running" : started ? "Standby" : "Idle"}
          </span>
        </header>

        {/* material flow belt */}
        <div className="relative mt-5 h-12 overflow-hidden rounded-md border border-border bg-panel">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
          {running &&
            Array.from({ length: 9 }).map((_, i) => (
              <Leaf
                key={i}
                className="absolute top-1/2 size-4 -translate-y-1/2 text-primary animate-drift"
                style={{
                  left: `${i * 2}%`,
                  animationDuration: "5.5s",
                  animationDelay: `${i * 0.55}s`,
                  opacity: 0.9,
                }}
                aria-hidden
              />
            ))}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            material flow
          </span>
        </div>

        {/* stages */}
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {STAGES.map((stage, i) => {
            const Icon = ICONS[i] ?? Leaf;
            const active = i === stageIndex;
            const done = started && i < stageIndex;
            const progress = started ? stageProgress(elapsed, i) * 100 : 0;
            return (
              <li
                key={stage.id}
                className={cn(
                  "relative overflow-hidden rounded-lg border p-3 transition-colors duration-500",
                  active
                    ? "border-primary/60 bg-primary/10 eco-glow"
                    : done
                      ? "border-border bg-panel"
                      : "border-border bg-panel/50 opacity-70",
                )}
              >
                {active && (
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-primary/10 animate-scan" aria-hidden />
                )}
                <div className="relative flex items-start gap-3">
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-md border",
                      active
                        ? "border-primary/60 bg-primary/20 text-primary"
                        : done
                          ? "border-primary/30 text-primary"
                          : "border-border text-muted-foreground",
                    )}
                  >
                    {done ? <CheckCircle2 className="size-4" /> : <Icon className="size-4" />}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <span className="font-mono text-[10px] text-muted-foreground">0{i + 1}</span>
                      {stage.label}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{stage.detail}</p>
                  </div>
                </div>
                <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-5">
          <Metric label="Biomass Input" value={readings.inputWeight.toFixed(1)} unit="kg" />
          <Metric label="Moisture" value={started ? readings.moisture.toFixed(1) : "—"} unit="%" />
          <Metric label="Temperature" value={started ? readings.temperature.toFixed(0) : "—"} unit="°C" />
          <Metric label="Process Time" value={elapsed.toFixed(1)} unit="s" />
          <Metric label="Pellet Output" value={readings.pelletWeight.toFixed(1)} unit="kg" />
        </div>
      </div>
    </section>
  );
}
