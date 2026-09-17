import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Cpu, Factory, Leaf, Pause, Play, RotateCcw, Sparkles, Waves } from "lucide-react";
import { ProcessLine } from "@/components/eco/ProcessLine";
import { SbpaDashboard } from "@/components/eco/SbpaDashboard";
import { useEcoPellet } from "@/hooks/useEcoPellet";
import { TOTAL_DURATION } from "@/lib/ecopellet";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EcoPellet AI — Biomass Pelletization & SBPA Simulation" },
      {
        name: "description",
        content:
          "Interactive prototype simulation: fallen leaves through drying, grinding and pelletization into a live SBPA quality analysis dashboard.",
      },
      { property: "og:title", content: "EcoPellet AI — Pelletization & Pellet Quality Simulation" },
      {
        property: "og:description",
        content:
          "Watch simulated biomass flow from leaf input to finished pellets while the Smart Biomass Pellet Analyzer scores quality live.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const FLOW = [
  { icon: Leaf, label: "Biomass" },
  { icon: Factory, label: "Pelletization" },
  { icon: Waves, label: "Sensors" },
  { icon: Cpu, label: "SBPA" },
  { icon: Sparkles, label: "Quality Decision" },
];

function Index() {
  const sim = useEcoPellet();
  const pct = Math.min(100, (sim.elapsed / TOTAL_DURATION) * 100);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
        <header className="panel relative overflow-hidden p-5">
          <div className="pointer-events-none absolute inset-0 grid-bg" aria-hidden />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">Prototype simulation</p>
              <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight lg:text-3xl">
                EcoPellet <span className="text-primary">AI</span> Control Room
              </h1>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Fallen-leaf biomass converted into fuel pellets, monitored end to end by the Smart Biomass Pellet
                Analyzer. All readings are simulated — no physical sensors or trained ML model are involved.
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Batch</p>
              <p className="font-mono text-sm">EP-2026-{sim.scenario === "optimal" ? "0142" : "0143"}</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {sim.scenarioMeta.label} · {pct.toFixed(0)}% complete
              </p>
            </div>
          </div>

          {/* flow story */}
          <ol className="relative mt-5 flex flex-wrap items-center gap-2">
            {FLOW.map((f, i) => (
              <li key={f.label} className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    sim.started ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground",
                  )}
                >
                  <f.icon className="size-3.5" />
                  {f.label}
                </span>
                {i < FLOW.length - 1 && <ArrowRight className="size-3.5 text-muted-foreground" />}
              </li>
            ))}
          </ol>

          <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full transition-[width] duration-200" style={{ width: `${pct}%`, background: "var(--gradient-eco)" }} />
          </div>
        </header>

        {/* controls */}
        <div className="panel mt-4 flex flex-wrap items-center gap-2 p-4">
          <button
            onClick={sim.start}
            disabled={sim.running || sim.complete}
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
            style={{ background: "var(--gradient-eco)" }}
          >
            <Play className="size-4" /> Start Process
          </button>
          <button
            onClick={sim.pause}
            disabled={!sim.running}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-muted disabled:opacity-40"
          >
            <Pause className="size-4" /> Pause
          </button>
          <button
            onClick={sim.reset}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="size-4" /> Reset
          </button>

          <span className="mx-2 hidden h-6 w-px bg-border sm:block" />

          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Scenario</span>
          {(["optimal", "high-moisture"] as const).map((id) => (
            <button
              key={id}
              onClick={() => sim.chooseScenario(id)}
              className={cn(
                "rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
                sim.scenario === id
                  ? id === "optimal"
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-warning/60 bg-warning/15 text-warning"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {id === "optimal" ? "Optimal Batch" : "High Moisture"}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <ProcessLine
            stageIndex={sim.stageIndex}
            elapsed={sim.elapsed}
            running={sim.running}
            readings={sim.readings}
            started={sim.started}
          />
          <SbpaDashboard readings={sim.readings} analysis={sim.analysis} trace={sim.trace} started={sim.started} />
        </div>

        <footer className="mt-6 pb-6 text-center text-[11px] text-muted-foreground">
          EcoPellet AI prototype · all sensor values are simulated for demonstration · rule-based analysis, not a trained
          ML model
        </footer>
      </div>
    </main>
  );
}
