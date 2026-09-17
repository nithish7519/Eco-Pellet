import { useCallback, useEffect, useRef, useState } from "react";
import {
  SCENARIOS,
  TOTAL_DURATION,
  activeStageIndex,
  analyze,
  computeReadings,
  type Analysis,
  type Readings,
  type ScenarioId,
} from "@/lib/ecopellet";

export interface TracePoint {
  t: number;
  moisture: number;
  temperature: number;
  density: number;
  durability: number;
  score: number;
}

const TICK_MS = 120;
const SPEED = 1; // simulated seconds per real second

export function useEcoPellet() {
  const [scenario, setScenario] = useState<ScenarioId>("optimal");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [trace, setTrace] = useState<TracePoint[]>([]);
  const raf = useRef<ReturnType<typeof setInterval> | null>(null);

  const sc = SCENARIOS[scenario];
  const started = elapsed > 0;
  const complete = elapsed >= TOTAL_DURATION;

  const readings: Readings = computeReadings(Math.min(elapsed, TOTAL_DURATION), sc);
  const analysis: Analysis = analyze(readings, started);
  const stageIndex = started ? activeStageIndex(Math.min(elapsed, TOTAL_DURATION - 0.001)) : -1;

  useEffect(() => {
    if (!running) return;
    raf.current = setInterval(() => {
      setElapsed((e) => {
        const next = e + (TICK_MS / 1000) * SPEED;
        if (next >= TOTAL_DURATION) {
          setRunning(false);
          return TOTAL_DURATION;
        }
        return next;
      });
    }, TICK_MS);
    return () => {
      if (raf.current) clearInterval(raf.current);
    };
  }, [running]);

  useEffect(() => {
    if (!started) return;
    const r = computeReadings(Math.min(elapsed, TOTAL_DURATION), sc);
    const a = analyze(r, true);
    setTrace((prev) => {
      const last = prev[prev.length - 1];
      if (last && Math.abs(last.t - elapsed) < 0.35) return prev;
      return [
        ...prev,
        {
          t: Number(elapsed.toFixed(1)),
          moisture: Number(r.moisture.toFixed(2)),
          temperature: Number(r.temperature.toFixed(1)),
          density: Number(r.density.toFixed(3)),
          durability: Number(r.durability.toFixed(1)),
          score: a.score,
        },
      ].slice(-160);
    });
  }, [elapsed, sc, started]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
    setTrace([]);
  }, []);
  const chooseScenario = useCallback((id: ScenarioId) => {
    setRunning(false);
    setElapsed(0);
    setTrace([]);
    setScenario(id);
  }, []);

  return {
    scenario,
    scenarioMeta: sc,
    chooseScenario,
    running,
    started,
    complete,
    elapsed,
    stageIndex,
    readings,
    analysis,
    trace,
    start,
    pause,
    reset,
  };
}
