import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { C as ArrowRight, S as BrainCircuit, _ as Factory, a as Sparkles, b as Cog, c as RotateCcw, d as Package, f as Leaf, g as Flame, h as Gauge, i as Thermometer, l as Play, m as Info, n as Waves, o as Snowflake, p as Layers, r as TriangleAlert, s as ShieldCheck, t as Weight, u as Pause, v as Droplets, x as CircleCheck, y as Cpu } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { a as XAxis, c as CartesianGrid, d as ResponsiveContainer, f as Tooltip, i as YAxis, l as Bar, n as BarChart, o as Area, r as LineChart, s as Line, t as AreaChart, u as Cell } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-hCFLi9nS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STAGES = [
	{
		id: "input",
		label: "Leaf Biomass Input",
		detail: "Fallen leaves loaded into hopper",
		duration: 4
	},
	{
		id: "drying",
		label: "Drying",
		detail: "Hot-air moisture removal",
		duration: 10
	},
	{
		id: "grinding",
		label: "Grinding",
		detail: "Hammer mill size reduction",
		duration: 7
	},
	{
		id: "pelletizing",
		label: "Compression / Pelletization",
		detail: "Die extrusion under pressure",
		duration: 12
	},
	{
		id: "cooling",
		label: "Cooling",
		detail: "Counter-flow cooling & hardening",
		duration: 7
	},
	{
		id: "output",
		label: "Finished Pellets",
		detail: "Bagging & quality release",
		duration: 4
	}
];
var TOTAL_DURATION = STAGES.reduce((s, x) => s + x.duration, 0);
var SCENARIOS = {
	optimal: {
		id: "optimal",
		label: "Optimal Batch",
		inputWeight: 50,
		rawMoisture: 45.5,
		finalMoisture: 8.4,
		peakTemp: 92,
		targetDensity: 1.18,
		targetDurability: 97.2,
		yieldRatio: .62
	},
	"high-moisture": {
		id: "high-moisture",
		label: "High Moisture",
		inputWeight: 50,
		rawMoisture: 58,
		finalMoisture: 16.1,
		peakTemp: 74,
		targetDensity: .86,
		targetDurability: 88.4,
		yieldRatio: .71
	}
};
var lerp = (a, b, t) => a + (b - a) * clamp01(t);
var clamp01 = (t) => Math.min(1, Math.max(0, t));
/** cumulative start time of each stage */
var stageStart = (index) => STAGES.slice(0, index).reduce((s, x) => s + x.duration, 0);
function activeStageIndex(elapsed) {
	let acc = 0;
	for (let i = 0; i < STAGES.length; i++) {
		acc += STAGES[i].duration;
		if (elapsed < acc) return i;
	}
	return STAGES.length - 1;
}
function stageProgress(elapsed, index) {
	return clamp01((elapsed - stageStart(index)) / STAGES[index].duration);
}
/** Deterministic-ish jitter so charts look like sensor traces, not straight lines */
var wobble = (t, amp, freq = 1) => Math.sin(t * freq * 2.3) * amp * .6 + Math.sin(t * freq * 5.7 + 1.3) * amp * .4;
function computeReadings(elapsed, sc) {
	const dryStart = stageStart(1);
	const dryEnd = stageStart(3);
	const pelStart = stageStart(3);
	const pelEnd = stageStart(4);
	const coolStart = stageStart(4);
	const coolEnd = stageStart(5);
	const dryT = clamp01((elapsed - dryStart) / (dryEnd - dryStart));
	const moisture = lerp(sc.rawMoisture, sc.finalMoisture, easeOut(dryT)) + wobble(elapsed, .35);
	let temperature;
	if (elapsed < dryStart) temperature = 24 + wobble(elapsed, .4);
	else if (elapsed < pelStart) temperature = lerp(24, 68, easeOut(dryT)) + wobble(elapsed, .8);
	else if (elapsed < pelEnd) temperature = lerp(68, sc.peakTemp, clamp01((elapsed - pelStart) / (pelEnd - pelStart))) + wobble(elapsed, 1.1);
	else if (elapsed < coolEnd) temperature = lerp(sc.peakTemp, 34, easeOut(clamp01((elapsed - coolStart) / (coolEnd - coolStart)))) + wobble(elapsed, .7);
	else temperature = 32 + wobble(elapsed, .4);
	const formT = clamp01((elapsed - pelStart) / (coolEnd - pelStart));
	const density = formT === 0 ? 0 : lerp(.42, sc.targetDensity, easeOut(formT)) + wobble(elapsed, .012);
	const durability = formT === 0 ? 0 : lerp(55, sc.targetDurability, easeOut(formT)) + wobble(elapsed, .35);
	const outT = clamp01((elapsed - pelStart) / (stageStart(5) + STAGES[5].duration - pelStart));
	const pelletWeight = sc.inputWeight * sc.yieldRatio * easeOut(outT);
	return {
		moisture: Math.max(0, moisture),
		temperature,
		density: Math.max(0, density),
		durability: Math.max(0, durability),
		pelletWeight,
		inputWeight: sc.inputWeight,
		elapsed
	};
}
var easeOut = (t) => 1 - Math.pow(1 - clamp01(t), 2);
var scoreMoisture = (m) => {
	if (m <= 10 && m >= 6) return 100;
	if (m < 6) return Math.max(40, 100 - (6 - m) * 9);
	return Math.max(0, 100 - (m - 10) * 7.5);
};
var scoreDensity = (d) => Math.max(0, Math.min(100, (d - .5) / .7 * 100));
var scoreDurability = (d) => Math.max(0, Math.min(100, (d - 80) / 18 * 100));
var scoreTemp = (t) => {
	if (t >= 60 && t <= 100) return 100;
	if (t < 60) return Math.max(30, 100 - (60 - t) * 1.4);
	return Math.max(30, 100 - (t - 100) * 2);
};
function analyze(r, started) {
	if (!started || r.density <= 0) return {
		score: 0,
		band: "REJECTED",
		insight: "Awaiting pellet formation — no compressed material in the analysis chamber yet.",
		recommendation: "Start the process to begin simulated sensor acquisition.",
		alerts: [{
			level: "ok",
			message: "SBPA idle · sensors standing by"
		}],
		breakdown: [
			{
				label: "Moisture",
				value: 0
			},
			{
				label: "Density",
				value: 0
			},
			{
				label: "Durability",
				value: 0
			},
			{
				label: "Thermal",
				value: 0
			}
		]
	};
	const m = scoreMoisture(r.moisture);
	const d = scoreDensity(r.density);
	const du = scoreDurability(r.durability);
	const t = scoreTemp(r.temperature);
	const score = Math.round(m * .35 + d * .25 + du * .28 + t * .12);
	const band = score >= 90 ? "EXCELLENT" : score >= 75 ? "GOOD" : score >= 60 ? "ACCEPTABLE" : score >= 40 ? "NEEDS IMPROVEMENT" : "REJECTED";
	const alerts = [];
	if (r.moisture > 12) alerts.push({
		level: "critical",
		message: `Moisture ${r.moisture.toFixed(1)}% exceeds 12% storage limit`
	});
	else if (r.moisture > 10) alerts.push({
		level: "warn",
		message: `Moisture ${r.moisture.toFixed(1)}% slightly above optimal band (6–10%)`
	});
	if (r.density < .95) alerts.push({
		level: "warn",
		message: `Bulk density ${r.density.toFixed(2)} g/cm³ below 0.95 target`
	});
	if (r.durability < 95 && r.durability > 0) alerts.push({
		level: "warn",
		message: `Durability index ${r.durability.toFixed(1)}% under ISO 17831 guidance (≥95%)`
	});
	if (r.temperature < 60) alerts.push({
		level: "warn",
		message: `Die temperature ${r.temperature.toFixed(0)}°C low — lignin binding may be incomplete`
	});
	if (!alerts.length) alerts.push({
		level: "ok",
		message: "All simulated parameters within nominal range"
	});
	let insight;
	let recommendation;
	if (r.moisture > 12) {
		insight = "High residual moisture is softening the pellet matrix and suppressing lignin binding, which lowers density and durability together.";
		recommendation = "Additional drying required — extend dryer residence time by ~40% and re-run analysis.";
	} else if (r.moisture > 10) {
		insight = "Moisture is marginally above the optimal window; durability is holding but long-term storage risk increases.";
		recommendation = "Trim dryer output by 2–3% moisture before bagging.";
	} else if (r.density < .95) {
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
			{
				label: "Moisture",
				value: Math.round(m)
			},
			{
				label: "Density",
				value: Math.round(d)
			},
			{
				label: "Durability",
				value: Math.round(du)
			},
			{
				label: "Thermal",
				value: Math.round(t)
			}
		]
	};
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var ICONS = [
	Leaf,
	Flame,
	Cog,
	Layers,
	Snowflake,
	Package
];
function Metric({ label, value, unit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-panel/70 px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-1 font-mono text-lg leading-none text-foreground",
			children: [value, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ml-1 text-xs text-muted-foreground",
				children: unit
			})]
		})]
	});
}
function ProcessLine({ stageIndex, elapsed, running, readings, started }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "panel relative overflow-hidden p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute inset-0 grid-bg",
			"aria-hidden": true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold tracking-tight",
						children: "Pelletization Unit"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Fallen leaf biomass · continuous line · simulated material flow"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-[11px] uppercase tracking-widest", running ? "border-primary/50 text-primary animate-pulse-ring" : "text-muted-foreground"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", running ? "bg-primary" : "bg-muted-foreground") }), running ? "Running" : started ? "Standby" : "Idle"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mt-5 h-12 overflow-hidden rounded-md border border-border bg-panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" }),
						running && Array.from({ length: 9 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leaf, {
							className: "absolute top-1/2 size-4 -translate-y-1/2 text-primary animate-drift",
							style: {
								left: `${i * 2}%`,
								animationDuration: "5.5s",
								animationDelay: `${i * .55}s`,
								opacity: .9
							},
							"aria-hidden": true
						}, i)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground",
							children: "material flow"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
					children: STAGES.map((stage, i) => {
						const Icon = ICONS[i] ?? Leaf;
						const active = i === stageIndex;
						const done = started && i < stageIndex;
						const progress = started ? stageProgress(elapsed, i) * 100 : 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: cn("relative overflow-hidden rounded-lg border p-3 transition-colors duration-500", active ? "border-primary/60 bg-primary/10 eco-glow" : done ? "border-border bg-panel" : "border-border bg-panel/50 opacity-70"),
							children: [
								active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "pointer-events-none absolute inset-x-0 top-0 h-8 bg-primary/10 animate-scan",
									"aria-hidden": true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative flex items-start gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("grid size-9 shrink-0 place-items-center rounded-md border", active ? "border-primary/60 bg-primary/20 text-primary" : done ? "border-primary/30 text-primary" : "border-border text-muted-foreground"),
										children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "flex items-center gap-2 text-sm font-semibold",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono text-[10px] text-muted-foreground",
												children: ["0", i + 1]
											}), stage.label]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-0.5 text-xs text-muted-foreground",
											children: stage.detail
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "relative mt-3 h-1 overflow-hidden rounded-full bg-secondary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full rounded-full bg-primary transition-[width] duration-200",
										style: { width: `${progress}%` }
									})
								})
							]
						}, stage.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 grid grid-cols-2 gap-2 lg:grid-cols-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Biomass Input",
							value: readings.inputWeight.toFixed(1),
							unit: "kg"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Moisture",
							value: started ? readings.moisture.toFixed(1) : "—",
							unit: "%"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Temperature",
							value: started ? readings.temperature.toFixed(0) : "—",
							unit: "°C"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Process Time",
							value: elapsed.toFixed(1),
							unit: "s"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Pellet Output",
							value: readings.pelletWeight.toFixed(1),
							unit: "kg"
						})
					]
				})
			]
		})]
	});
}
var tone = (band) => band === "EXCELLENT" || band === "GOOD" ? "text-primary" : band === "ACCEPTABLE" ? "text-warning" : "text-destructive";
function SensorCard({ icon: Icon, label, value, unit, status, hint }) {
	const color = status === "ok" ? "text-primary" : status === "warn" ? "text-warning" : status === "bad" ? "text-destructive" : "text-muted-foreground";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-panel p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("size-3.5", color) }), label]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full bg-current", color) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 font-mono text-2xl leading-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: color,
					children: value
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-1 text-xs text-muted-foreground",
					children: unit
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 text-[11px] text-muted-foreground",
				children: hint
			})
		]
	});
}
var chartTheme = {
	grid: "var(--grid-line)",
	axis: "var(--muted-foreground)"
};
function tooltipStyle() {
	return {
		contentStyle: {
			background: "var(--popover)",
			border: "1px solid var(--border)",
			borderRadius: "8px",
			fontSize: "12px",
			color: "var(--popover-foreground)"
		},
		labelStyle: { color: "var(--muted-foreground)" }
	};
}
function SbpaDashboard({ readings, analysis, trace, started }) {
	const moistureStatus = !started ? "idle" : readings.moisture > 12 ? "bad" : readings.moisture > 10 ? "warn" : "ok";
	const tempStatus = !started ? "idle" : readings.temperature < 60 && readings.density > 0 ? "warn" : "ok";
	const densityStatus = !started || readings.density === 0 ? "idle" : readings.density < .95 ? "warn" : "ok";
	const durStatus = !started || readings.durability === 0 ? "idle" : readings.durability < 95 ? "warn" : "ok";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "panel p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold tracking-tight",
					children: "SBPA · Smart Biomass Pellet Analyzer"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Receiving simulated sensor stream from the pelletization line"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-warning",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-3" }), " Simulated data"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SensorCard, {
							icon: Droplets,
							label: "Moisture",
							value: started ? readings.moisture.toFixed(1) : "—",
							unit: "%",
							status: moistureStatus,
							hint: "Optimal 6–10%"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SensorCard, {
							icon: Thermometer,
							label: "Temperature",
							value: started ? readings.temperature.toFixed(0) : "—",
							unit: "°C",
							status: tempStatus,
							hint: "Die target 60–100°C"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SensorCard, {
							icon: Gauge,
							label: "Pellet Density",
							value: readings.density > 0 ? readings.density.toFixed(2) : "—",
							unit: "g/cm³",
							status: densityStatus,
							hint: "Target ≥ 0.95"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SensorCard, {
							icon: ShieldCheck,
							label: "Durability",
							value: readings.durability > 0 ? readings.durability.toFixed(1) : "—",
							unit: "%",
							status: durStatus,
							hint: "ISO 17831 ≥ 95%"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SensorCard, {
							icon: Weight,
							label: "Pellet Weight",
							value: readings.pelletWeight > 0 ? readings.pelletWeight.toFixed(1) : "—",
							unit: "kg",
							status: started ? "ok" : "idle",
							hint: `From ${readings.inputWeight.toFixed(0)} kg biomass`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-panel p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
								children: "Score factors"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 h-[92px]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
									width: "100%",
									height: "100%",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
										data: analysis.breakdown,
										layout: "vertical",
										margin: {
											left: 0,
											right: 6,
											top: 0,
											bottom: 0
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
												type: "number",
												domain: [0, 100],
												hide: true
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
												type: "category",
												dataKey: "label",
												interval: 0,
												width: 62,
												tick: {
													fontSize: 9,
													fill: chartTheme.axis
												},
												axisLine: false,
												tickLine: false
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
												...tooltipStyle(),
												cursor: { fill: "transparent" }
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
												dataKey: "value",
												radius: 3,
												barSize: 9,
												children: analysis.breakdown.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: b.value >= 75 ? "var(--chart-1)" : b.value >= 50 ? "var(--chart-3)" : "var(--chart-4)" }, b.label))
											})
										]
									})
								})
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col justify-between rounded-lg border border-border bg-panel p-4 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground",
							children: "Pellet Quality Score"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "my-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("font-mono text-6xl font-semibold leading-none transition-colors", started ? tone(analysis.band) : "text-muted-foreground"),
								children: started ? analysis.score : "—"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-xs text-muted-foreground",
								children: "/ 100"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("rounded-md border px-3 py-2 font-display text-sm font-semibold tracking-wide", !started ? "border-border bg-secondary/40 text-muted-foreground" : analysis.band === "EXCELLENT" || analysis.band === "GOOD" ? "border-primary/50 bg-primary/10 text-primary" : analysis.band === "ACCEPTABLE" ? "border-warning/50 bg-warning/10 text-warning" : "border-destructive/50 bg-destructive/10 text-destructive"),
							children: started ? analysis.band : "STANDBY"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 h-2 overflow-hidden rounded-full bg-secondary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full rounded-full transition-[width] duration-300",
								style: {
									width: `${started ? analysis.score : "—"}%`,
									background: "var(--gradient-eco)"
								}
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-3 lg:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-panel p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
							children: "Moisture & Temperature"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-40",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
									data: trace,
									margin: {
										top: 4,
										right: 6,
										left: -22,
										bottom: 0
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
											stroke: chartTheme.grid,
											strokeDasharray: "3 3",
											vertical: false
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
											dataKey: "t",
											tick: {
												fontSize: 9,
												fill: chartTheme.axis
											},
											tickLine: false,
											axisLine: false,
											unit: "s"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
											tick: {
												fontSize: 9,
												fill: chartTheme.axis
											},
											tickLine: false,
											axisLine: false
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { ...tooltipStyle() }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
											type: "monotone",
											dataKey: "moisture",
											stroke: "var(--chart-2)",
											strokeWidth: 2,
											dot: false,
											isAnimationActive: false,
											name: "Moisture %"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
											type: "monotone",
											dataKey: "temperature",
											stroke: "var(--chart-3)",
											strokeWidth: 2,
											dot: false,
											isAnimationActive: false,
											name: "Temp °C"
										})
									]
								})
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-panel p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
							children: "Density & Durability"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-40",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
									data: trace,
									margin: {
										top: 4,
										right: 6,
										left: -22,
										bottom: 0
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
											stroke: chartTheme.grid,
											strokeDasharray: "3 3",
											vertical: false
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
											dataKey: "t",
											tick: {
												fontSize: 9,
												fill: chartTheme.axis
											},
											tickLine: false,
											axisLine: false,
											unit: "s"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
											yAxisId: "l",
											tick: {
												fontSize: 9,
												fill: chartTheme.axis
											},
											tickLine: false,
											axisLine: false,
											domain: [0, 1.4]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
											yAxisId: "r",
											orientation: "right",
											tick: {
												fontSize: 9,
												fill: chartTheme.axis
											},
											tickLine: false,
											axisLine: false,
											domain: [0, 100]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { ...tooltipStyle() }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
											yAxisId: "l",
											type: "monotone",
											dataKey: "density",
											stroke: "var(--chart-1)",
											strokeWidth: 2,
											dot: false,
											isAnimationActive: false,
											name: "Density g/cm³"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
											yAxisId: "r",
											type: "monotone",
											dataKey: "durability",
											stroke: "var(--chart-5)",
											strokeWidth: 2,
											dot: false,
											isAnimationActive: false,
											name: "Durability %"
										})
									]
								})
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-panel p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
							children: "Quality Score Trend"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-40",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
									data: trace,
									margin: {
										top: 4,
										right: 6,
										left: -22,
										bottom: 0
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
											id: "scoreFill",
											x1: "0",
											y1: "0",
											x2: "0",
											y2: "1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
												offset: "0%",
												stopColor: "var(--chart-1)",
												stopOpacity: .5
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
												offset: "100%",
												stopColor: "var(--chart-1)",
												stopOpacity: 0
											})]
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
											stroke: chartTheme.grid,
											strokeDasharray: "3 3",
											vertical: false
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
											dataKey: "t",
											tick: {
												fontSize: 9,
												fill: chartTheme.axis
											},
											tickLine: false,
											axisLine: false,
											unit: "s"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
											domain: [0, 100],
											tick: {
												fontSize: 9,
												fill: chartTheme.axis
											},
											tickLine: false,
											axisLine: false
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { ...tooltipStyle() }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
											type: "monotone",
											dataKey: "score",
											stroke: "var(--chart-1)",
											strokeWidth: 2,
											fill: "url(#scoreFill)",
											isAnimationActive: false,
											name: "Score"
										})
									]
								})
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-3 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-panel p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrainCircuit, { className: "size-3.5 text-accent" }),
								" AI Insight",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded border border-border px-1.5 py-px text-[9px] tracking-normal",
									children: "rule-based demo"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-foreground/90",
							children: analysis.insight
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 rounded-md border border-primary/40 bg-primary/10 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-semibold uppercase tracking-[0.16em] text-primary",
								children: "AI Recommendation"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm font-medium",
								children: analysis.recommendation
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-panel p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground",
						children: "Alerts"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-2",
						children: analysis.alerts.map((a, i) => {
							const Icon = a.level === "ok" ? CircleCheck : TriangleAlert;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: cn("flex items-start gap-2 rounded-md border px-3 py-2 text-sm", a.level === "ok" ? "border-primary/40 bg-primary/5 text-primary" : a.level === "warn" ? "border-warning/40 bg-warning/5 text-warning" : "border-destructive/40 bg-destructive/5 text-destructive"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "mt-0.5 size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-foreground/90",
									children: a.message
								})]
							}, i);
						})
					})]
				})]
			})
		]
	});
}
var TICK_MS = 120;
var SPEED = 1;
function useEcoPellet() {
	const [scenario, setScenario] = (0, import_react.useState)("optimal");
	const [running, setRunning] = (0, import_react.useState)(false);
	const [elapsed, setElapsed] = (0, import_react.useState)(0);
	const [trace, setTrace] = (0, import_react.useState)([]);
	const raf = (0, import_react.useRef)(null);
	const sc = SCENARIOS[scenario];
	const started = elapsed > 0;
	const complete = elapsed >= TOTAL_DURATION;
	const readings = computeReadings(Math.min(elapsed, TOTAL_DURATION), sc);
	const analysis = analyze(readings, started);
	const stageIndex = started ? activeStageIndex(Math.min(elapsed, TOTAL_DURATION - .001)) : -1;
	(0, import_react.useEffect)(() => {
		if (!running) return;
		raf.current = setInterval(() => {
			setElapsed((e) => {
				const next = e + TICK_MS / 1e3 * SPEED;
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
	(0, import_react.useEffect)(() => {
		if (!started) return;
		const r = computeReadings(Math.min(elapsed, TOTAL_DURATION), sc);
		const a = analyze(r, true);
		setTrace((prev) => {
			const last = prev[prev.length - 1];
			if (last && Math.abs(last.t - elapsed) < .35) return prev;
			return [...prev, {
				t: Number(elapsed.toFixed(1)),
				moisture: Number(r.moisture.toFixed(2)),
				temperature: Number(r.temperature.toFixed(1)),
				density: Number(r.density.toFixed(3)),
				durability: Number(r.durability.toFixed(1)),
				score: a.score
			}].slice(-160);
		});
	}, [
		elapsed,
		sc,
		started
	]);
	const start = (0, import_react.useCallback)(() => setRunning(true), []);
	const pause = (0, import_react.useCallback)(() => setRunning(false), []);
	const reset = (0, import_react.useCallback)(() => {
		setRunning(false);
		setElapsed(0);
		setTrace([]);
	}, []);
	return {
		scenario,
		scenarioMeta: sc,
		chooseScenario: (0, import_react.useCallback)((id) => {
			setRunning(false);
			setElapsed(0);
			setTrace([]);
			setScenario(id);
		}, []),
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
		reset
	};
}
var FLOW = [
	{
		icon: Leaf,
		label: "Biomass"
	},
	{
		icon: Factory,
		label: "Pelletization"
	},
	{
		icon: Waves,
		label: "Sensors"
	},
	{
		icon: Cpu,
		label: "SBPA"
	},
	{
		icon: Sparkles,
		label: "Quality Decision"
	}
];
function Index() {
	const sim = useEcoPellet();
	const pct = Math.min(100, sim.elapsed / TOTAL_DURATION * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-screen bg-background text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-[1400px] px-4 py-6 lg:px-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "panel relative overflow-hidden p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute inset-0 grid-bg",
							"aria-hidden": true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex flex-wrap items-start justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-[10px] uppercase tracking-[0.3em] text-primary",
									children: "Prototype simulation"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
									className: "mt-1 font-display text-2xl font-semibold tracking-tight lg:text-3xl",
									children: [
										"EcoPellet ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-primary",
											children: "AI"
										}),
										" Control Room"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 max-w-xl text-sm text-muted-foreground",
									children: "Fallen-leaf biomass converted into fuel pellets, monitored end to end by the Smart Biomass Pellet Analyzer. All readings are simulated — no physical sensors or trained ML model are involved."
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground",
										children: "Batch"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-mono text-sm",
										children: ["EP-2026-", sim.scenario === "optimal" ? "0142" : "0143"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 font-mono text-[11px] text-muted-foreground",
										children: [
											sim.scenarioMeta.label,
											" · ",
											pct.toFixed(0),
											"% complete"
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "relative mt-5 flex flex-wrap items-center gap-2",
							children: FLOW.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", sim.started ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(f.icon, { className: "size-3.5" }), f.label]
								}), i < FLOW.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5 text-muted-foreground" })]
							}, f.label))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "relative mt-4 h-1.5 overflow-hidden rounded-full bg-secondary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full rounded-full transition-[width] duration-200",
								style: {
									width: `${pct}%`,
									background: "var(--gradient-eco)"
								}
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel mt-4 flex flex-wrap items-center gap-2 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: sim.start,
							disabled: sim.running || sim.complete,
							className: "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40",
							style: { background: "var(--gradient-eco)" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), " Start Process"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: sim.pause,
							disabled: !sim.running,
							className: "inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-muted disabled:opacity-40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }), " Pause"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: sim.reset,
							className: "inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), " Reset"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-2 hidden h-6 w-px bg-border sm:block" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground",
							children: "Scenario"
						}),
						["optimal", "high-moisture"].map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => sim.chooseScenario(id),
							className: cn("rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors", sim.scenario === id ? id === "optimal" ? "border-primary/60 bg-primary/15 text-primary" : "border-warning/60 bg-warning/15 text-warning" : "border-border text-muted-foreground hover:text-foreground"),
							children: id === "optimal" ? "Optimal Batch" : "High Moisture"
						}, id))
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid gap-4 xl:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProcessLine, {
						stageIndex: sim.stageIndex,
						elapsed: sim.elapsed,
						running: sim.running,
						readings: sim.readings,
						started: sim.started
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SbpaDashboard, {
						readings: sim.readings,
						analysis: sim.analysis,
						trace: sim.trace,
						started: sim.started
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
					className: "mt-6 pb-6 text-center text-[11px] text-muted-foreground",
					children: "EcoPellet AI prototype · all sensor values are simulated for demonstration · rule-based analysis, not a trained ML model"
				})
			]
		})
	});
}
//#endregion
export { Index as component };
