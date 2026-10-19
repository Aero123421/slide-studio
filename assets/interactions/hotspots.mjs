// Interaction study · Component inspection — the four parts of an air-source heat pump and the energy each moves.
// Flows are drawn to scale (arrow width ∝ kW) from `pump`; the heat taken from the outdoor air and the
// coefficient of performance are computed from the same numbers.
const pump = { heatOut: 7.4, electricity: 2.1, outdoor: 2, flow: 45 };     // kW, kW, °C outdoor air, °C radiator flow
const fromAir = pump.heatOut - pump.electricity;                          // energy balance: heat out = air + electricity
const cop = pump.heatOut / pump.electricity;
const kw = v => `${v.toFixed(1)} kW`;
const parts = [
  { id: 'evaporator', name: 'Outdoor coil', at: 'bottom',
    body: `Outdoor coil: the refrigerant boils at about −6 °C, so even ${pump.outdoor} °C air is warmer than it and gives up ${kw(fromAir)}.` },
  { id: 'compressor', name: 'Compressor', at: 'right',
    body: `Compressor: uses ${kw(pump.electricity)} of electricity to squeeze the vapour, which leaves at about 75 °C. It is the only part that needs power.` },
  { id: 'condenser', name: 'Indoor heat exchanger', at: 'top',
    body: `Indoor heat exchanger: the hot vapour condenses and hands ${kw(pump.heatOut)} to the radiator water, which leaves at ${pump.flow} °C.` },
  { id: 'valve', name: 'Expansion valve', at: 'left',
    body: 'Expansion valve: drops the pressure, so the warm liquid flashes to about −6 °C and can take in heat outdoors again.' },
];
const ID = 'interaction-hotspots';

export default {
  study: true,
  id: ID,
  title: 'Component inspection: what each part of a heat pump does',
  notes: `Purpose: Explain a system by its parts: select a component (or click it) and the page states its job with the number that matters, while the energy flows stay on the drawing.
Modify: Change \`pump\` and the part texts; the flows, the ${fromAir.toFixed(1)} kW from the air and the COP of ${cop.toFixed(1)} recompute. For other systems use layout 'row' (a chain) or 'cycle' (four parts around a loop) and your own \`flows\`.
Invariant: Arrow widths are proportional to kW, so the energy balance is visible: the heat delivered equals the air plus the electricity. One part is selected at a time; boxes stand for physical components.
Static: The export shows the compressor selected, with its explanation as the status line.`,
  sources: [{ type: 'original-example', file: 'assets/interactions/hotspots.mjs' }],
  exportPolicy: 'final',
  className: 'st cs-blueprint',
  content: `<h1 class="st-head">The compressor’s ${kw(pump.electricity)} of electricity delivers ${kw(pump.heatOut)} of heat; the other ${kw(fromAir)} comes from ${pump.outdoor} °C outdoor air</h1>
<p class="st-dek">Air-source heat pump heating radiators at ${pump.flow} °C: coefficient of performance ${cop.toFixed(1)}.</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>Illustrative values · one steady operating point, losses ignored</span><span>Interaction · Component inspection</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'hotspots',
    initial: { part: 'compressor' },
    data: {
      layout: 'cycle', parts, cx: 0.42, cy: 0.5, dx: 0.26, dy: 0.25, boxWidth: 190, boxHeight: 66,
      links: [
        { from: 'evaporator', to: 'compressor', label: 'cool vapour, 0 °C' },
        { from: 'compressor', to: 'condenser', label: 'hot vapour, 75 °C' },
        { from: 'condenser', to: 'valve', label: 'warm liquid, 40 °C' },
        { from: 'valve', to: 'evaporator', label: 'cold mix, −6 °C' },
      ],
      flows: [
        { part: 'evaporator', side: 'bottom', dir: 'in', value: fromAir, label: `${kw(fromAir)} from outdoor air`, length: 54 },
        { part: 'compressor', side: 'right', dir: 'in', value: pump.electricity, label: `${kw(pump.electricity)} electricity`, length: 56, labelWidth: 90 },
        { part: 'condenser', side: 'top', dir: 'out', value: pump.heatOut, label: `${kw(pump.heatOut)} to the radiators`, tone: 'accent', length: 54 },
      ],
    },
    controls: { part: { label: 'Inspect a component' } },
    text: { reset: 'Reset', figure: 'Heat pump cycle with energy flows' },
  }],
};
