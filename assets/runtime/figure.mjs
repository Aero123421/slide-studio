/**
 * Slide Studio figure engine — single import point.
 *
 *   import { barChart, lineChart, flowDiagram, fmt } from './figure.mjs';
 *
 * Every chart/diagram returns an accessible <svg> string computed from data.
 * Read references/figures.md for the catalogue, options and design rules.
 */
export * from './fig-core.mjs';
export * from './fig-stats.mjs';
export * from './fig-charts.mjs';
export * from './fig-stats-charts.mjs';
export * from './fig-diagrams.mjs';
export * from './fig-patterns.mjs';
