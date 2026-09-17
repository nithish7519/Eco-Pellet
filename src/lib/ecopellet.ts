// EcoPellet AI — simulation engine (pure logic, SIMULATED DATA only)

export type ScenarioId = "optimal" | "high-moisture";

export type StageId =
  | "input"
  | "drying"
  | "grinding"
  | "pelletizing"
  | "cooling"
  | "output";

export interface StageDef {
  id: StageId;
  label: string;
  detail: string;
  /** seconds of simulated process time */
  duration: number;
}

export const STAGES: StageDef[] = [
  { id: "input", label: "Leaf Biomass Input", detail: "Fallen leaves loaded into hopper", duration: 4 },
  { id: "drying", label: "Drying", detail: "Hot-air moisture removal", duration: 10 },
  { id: "grinding", label: "Grinding", detail: "Hammer mill size reduction", duration: 7 },
  { id: "pelletizing", label: "Compression / Pelletization", detail: "Die extrusion under pressure", duration: 12 },
  { id: "cooling", label: "Cooling", detail: "Counter-flow cooling & hardening", duration: 7 },
  { id: "output", label: "Finished Pellets", detail: "Bagging & quality release", duration: 4 },
];

export const TOTAL_DURATION = STAGES.reduce((s, x) => s + x.duration, 0);

export interface Scenario {
  id: ScenarioId;
  label: string;
  inputWeight: number;
  rawMoisture: number;
  finalMoisture: number;
  peakTemp: number;
  targetDensity: number;
  targetDurability: number;
  yieldRatio: number;
}

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  optimal: {
    id: "optimal",
    label: "Optimal Batch",
    inputWeight: 50,
    rawMoisture: 45.5,
    finalMoisture: 8.4,
    peakTemp: 92,
    targetDensity: 1.18,
    targetDurability: 97.2,
    yieldRatio: 0.62,
  },
  "high-moisture": {
    id: "high-moisture",
    label: "High Moisture",
    inputWeight: 50,
    rawMoisture: 58,
    finalMoisture: 16.1,
    peakTemp: 74,
    targetDensity: 0.86,
    targetDurability: 88.4,
    yieldRatio: 0.71,
  },
};

export interface Readings {
  moisture: number;
  temperature: number;
  density: number;
  durability: number;
  pelletWeight: number;
  inputWeight: number;
  elapsed: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** cumulative start time of each stage */
export const stageStart = (index: number) =>
  STAGES.slice(0, index).reduce((s, x) => s + x.duration, 0);

export function activeStageIndex(elapsed: number): number {
  let acc = 0;
  for (let i = 0; i < STAGES.length; i++) {
    acc += STAGES[i]!.duration;
    if (elapsed < acc) return i;
  }
  return STAGES.length - 1;
}

export function stageProgress(elapsed: number, index: number): number {
  const start = stageStart(index);
  return clamp01((elapsed - start) / STAGES[index]!.duration);
}

/** Deterministic-ish jitter so charts look like sensor traces, not straight lines */
const wobble = (t: number, amp: number, freq = 1) =>
  Math.sin(t * freq * 2.3) * amp * 0.6 + Math.sin(t * freq * 5.7 + 1.3) * amp * 0.4;

export function computeReadings(elapsed: number, sc: Scenario): Readings {
  const dryStart = stageStart(1);
  const dryEnd = stageStart(3); // drying + grinding both shed moisture
  const pelStart = stageStart(3);
  const pelEnd = stageStart(4);
  const coolStart = stageStart(4);
  const coolEnd = stageStart(5);

  const dryT = clamp01((elapsed - dryStart) / (dryEnd - dryStart));
  const moisture = lerp(sc.rawMoisture, sc.finalMoisture, easeOut(dryT)) + wobble(elapsed, 0.35);

  let temperature: number;
  if (elapsed < dryStart) temperature = 24 + wobble(elapsed, 0.4);
  else if (elapsed < pelStart) temperature = lerp(24, 68, easeOut(dryT)) + wobble(elapsed, 0.8);
  else if (elapsed < pelEnd)
    temperature = lerp(68, sc.peakTemp, clamp01((elapsed - pelStart) / (pelEnd - pelStart))) + wobble(elapsed, 1.1);
  else if (elapsed < coolEnd)
    temperature = lerp(sc.peakTemp, 34, easeOut(clamp01((elapsed - coolStart) / (coolEnd - coolStart)))) + wobble(elapsed, 0.7);
  else temperature = 32 + wobble(elapsed, 0.4);

  const formT = clamp01((elapsed - pelStart) / (coolEnd - pelStart));
  const density = formT === 0 ? 0 : lerp(0.42, sc.targetDensity, easeOut(formT)) + wobble(elapsed, 0.012);
  const durability = formT === 0 ? 0 : lerp(55, sc.targetDurability, easeOut(formT)) + wobble(elapsed, 0.35);

  const outT = clamp01((elapsed - pelStart) / (stageStart(5) + STAGES[5]!.duration - pelStart));
  const pelletWeight = sc.inputWeight * sc.yieldRatio * easeOut(outT);

  return {
    moisture: Math.max(0, moisture),
    temperature,
    density: Math.max(0, density),
    durability: Math.max(0, durability),
    pelletWeight,
    inputWeight: sc.inputWeight,
    elapsed,
  };
}

const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 2);

export type QualityBand = "EXCELLENT" | "GOOD" | "ACCEPTABLE" | "NEEDS IMPROVEMENT" | "REJECTED";

export interface Analysis {
  score: number;
  band: QualityBand;
  insight: string;
  recommendation: string;
  alerts: { level: "warn" | "critical" | "ok"; message: string }[];
  breakdown: { label: string; value: number }[];
}

const scoreMoisture = (m: number) => {
  // optimal 6–10%
  if (m <= 10 && m >= 6) return 100;
  if (m < 6) return Math.max(40, 100 - (6 - m) * 9);
  return Math.max(0, 100 - (m - 10) * 7.5);
};
const scoreDensity = (d: number) => Math.max(0, Math.min(100, ((d - 0.5) / (1.2 - 0.5)) * 100));
const scoreDurability = (d: number) => Math.max(0, Math.min(100, ((d - 80) / (98 - 80)) * 100));
const scoreTemp = (t: number) => {
  if (t >= 60 && t <= 100) return 100;
  if (t < 60) return Math.max(30, 100 - (60 - t) * 1.4);
  return Math.max(30, 100 - (t - 100) * 2);
};

export function analyze(r: Readings, started: boolean): Analysis {
  if (!started || r.density <= 0) {
    return {
      score: 0,
      band: "REJECTED",
      insight: "Awaiting pellet formation — no compressed material in the analysis chamber yet.",
      recommendation: "Start the process to begin simulated sensor acquisition.",
      alerts: [{ level: "ok", message: "SBPA idle · sensors standing by" }],
      breakdown: [
        { label: "Moisture", value: 0 },
        { label: "Density", value: 0 },
        { label: "Durability", value: 0 },
        { label: "Thermal", value: 0 },
      ],
    };
  }

  const m = scoreMoisture(r.moisture);
  const d = scoreDensity(r.density);
  const du = scoreDurability(r.durability);
  const t = scoreTemp(r.temperature);
  const score = Math.round(m * 0.35 + d * 0.25 + du * 0.28 + t * 0.12);

  const band: QualityBand =
    score >= 90 ? "EXCELLENT" : score >= 75 ? "GOOD" : score >= 60 ? "ACCEPTABLE" : score >= 40 ? "NEEDS IMPROVEMENT" : "REJECTED";

  const alerts: Analysis["alerts"] = [];
  if (r.moisture > 12) alerts.push({ level: "critical", message: `Moisture ${r.moisture.toFixed(1)}% exceeds 12% storage limit` });
  else if (r.moisture > 10) alerts.push({ level: "warn", message: `Moisture ${r.moisture.toFixed(1)}% slightly above optimal band (6–10%)` });
  if (r.density < 0.95) alerts.push({ level: "warn", message: `Bulk density ${r.density.toFixed(2)} g/cm³ below 0.95 target` });
  if (r.durability < 95 && r.durability > 0) alerts.push({ level: "warn", message: `Durability index ${r.durability.toFixed(1)}% under ISO 17831 guidance (≥95%)` });
  if (r.temperature < 60) alerts.push({ level: "warn", message: `Die temperature ${r.temperature.toFixed(0)}°C low — lignin binding may be incomplete` });
  if (!alerts.length) alerts.push({ level: "ok", message: "All simulated parameters within nominal range" });

  let insight: string;
  let recommendation: string;
  if (r.moisture > 12) {
    insight = "High residual moisture is softening the pellet matrix and suppressing lignin binding, which lowers density and durability together.";
    recommendation = "Additional drying required — extend dryer residence time by ~40% and re-run analysis.";
  } else if (r.moisture > 10) {
    insight = "Moisture is marginally above the optimal window; durability is holding but long-term storage risk increases.";
    recommendation = "Trim dryer output by 2–3% moisture before bagging.";
  } else if (r.density < 0.95) {
    insight = "Compression is under-performing relative to moisture content — likely low die pressure or oversized grind.";
    recommendation = "Increase die pressure and reduce hammer-mill screen size to 4 mm.";
  } else if (band === "EXCELLENT" || band === "GOOD") {
    insight = "Moisture, density and durability are mutually consistent — the batch shows stable lignin binding and uniform pellet geometry.";
    recommendation = "Ready for storage — bag and log batch to inventory.";
  } else {
    insight = "Process parameters are still stabilising; values will converge as the batch completes cooling.";
    recommendation = "Continue the run and re-evaluate after cooling.";
  }

  return {
    score,
    band,
    insight,
    recommendation,
    alerts,
    breakdown: [
      { label: "Moisture", value: Math.round(m) },
      { label: "Density", value: Math.round(d) },
      { label: "Durability", value: Math.round(du) },
      { label: "Thermal", value: Math.round(t) },
    ],
  };
}

export const bandTone = (band: QualityBand) =>
  band === "EXCELLENT" || band === "GOOD"
    ? "good"
    : band === "ACCEPTABLE"
      ? "warn"
      : "bad";
