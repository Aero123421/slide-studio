// Interaction study · Video with a poster and a static fallback — a damped travelling wave, measured.
// The clip is the bundled procedural animation (assets/media/video.webm, 640 × 360, 5 s, 24 fps).
// `wave` was fitted to its 120 frames (least squares on the traced curve, RMS error 0.5 px):
//   y = mid − amplitude · e^(−(x − left) / decay) · sin(2π (x − phase − speed · t) / wavelength)
const wave = { mid: 165, left: 50, right: 600, amplitude: 95.1, decay: 745.7, phase: 49.8, speed: 128.07, wavelength: 301.7 };   // px, px/s
const clip = { seconds: 5, fps: 24 };
const period = wave.wavelength / wave.speed;                      // s until the pattern repeats
const halving = Math.LN2 * wave.decay;                            // px over which a crest loses half its height
const span = wave.right - wave.left;

// Poster: the clip's first frame redrawn from the fit, so the static page shows what the video starts with.
function poster(t = 0) {
  let d = '';
  for (let x = wave.left; x <= wave.right; x += 2) {
    const y = wave.mid - wave.amplitude * Math.exp(-(x - wave.left) / wave.decay) * Math.sin((2 * Math.PI * (x - wave.phase - wave.speed * t)) / wave.wavelength);
    d += `${x === wave.left ? 'M' : 'L'}${x} ${y.toFixed(1)}`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="#edf2f3"/>` +
    `<line x1="${wave.left}" y1="${wave.mid}" x2="${wave.right}" y2="${wave.mid}" stroke="#b4c8ce" stroke-width="1.5"/>` +
    `<path d="M${wave.left} 40V295H${wave.right}" stroke="#17242d" fill="none" stroke-width="2"/><path d="${d}" stroke="#28617b" stroke-width="3" fill="none"/>` +
    `<line x1="${wave.left}" y1="45" x2="${wave.left}" y2="295" stroke="#ae5031" stroke-width="3"/></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}
const ID = 'interaction-video';

export default {
  study: true,
  id: ID,
  title: 'Video with a poster and a static fallback: a damped travelling wave',
  notes: `Purpose: Show motion that a still cannot (crests travelling and shrinking), with native controls, captions, a deliberate jump to the moment worth pausing on, and a poster that stands in when video cannot play.
Modify: Replace the video, captions and poster assets; re-measure what the page claims from the clip itself (here: the fit in \`wave\`) and set the jump time (\`seekTo\`).
Invariant: No autoplay; the clip pauses when the slide is left. The poster is the clip's own first frame (redrawn from the fit), not a different picture. Every number on the page comes from the measured fit.
Static: The export shows the poster and the measured period and halving distance. A poster is not proof of playback; the HTML deck carries the clip.`,
  sources: [{ type: 'video', file: 'assets/media/video.webm', license: 'original procedural animation' }],
  exportPolicy: 'final',
  className: 'st cs-physics-lecture',
  content: `<h1 class="st-head">Each crest loses height as it travels, yet every point keeps the same swing: this wave is damped in space, not in time</h1>
<p class="st-dek">Procedural animation, ${clip.seconds} s at ${clip.fps} fps; the red line sweeps the frame once as a time marker.</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>Measured from the clip’s frames: wavelength ${Math.round(wave.wavelength)} px, speed ${Math.round(wave.speed)} px/s, fit error 0.5 px</span><span>Interaction · Video with poster</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'video',
    initial: { time: 0 },
    assets: { poster: poster(0) },
    data: { seekTo: Math.round(period * 100) / 100, duration: clip.seconds },
    text: {
      seek: `Jump one period (${period.toFixed(2)} s)`, playPause: 'Play / pause', reset: 'Reset',
      videoLabel: 'Damped travelling wave, procedural animation, 5 seconds, English captions',
      posterAlt: 'First frame of the clip, redrawn from the fitted wave: two crests, the right one lower',
      paused: 'Paused', playing: 'Playing',
      status: '{state} at {time} s of {duration} s.',
      readout: [{ value: period.toFixed(2), unit: 's', label: 'period: the pattern repeats' }, { value: String(Math.round(halving)), unit: 'px', label: `a crest halves in height, ${Math.round((100 * halving) / span)}% of the frame` }],
    },
  }],
};
