// Interaction study · Deliberate audio — a tuning reference, measured from its own samples.
// The widget decodes the embedded WAV (no network), counts zero crossings for the pitch and reads the
// peak level; `tone` records the same measurements for the headline (assets/media/audio.wav:
// 22,050 Hz mono 16-bit PCM, 44,100 samples, 1,320 zero crossings, peak sample 1,399 of 32,768).
const tone = { hz: 1320 / 2 / 2, seconds: 44100 / 22050, peakDbfs: 20 * Math.log10(1399 / 32768) };
const a4 = 440, e4 = a4 * 2 ** (-5 / 12);                   // equal temperament: E4 is five semitones below A4
const cents = 1200 * Math.log2(tone.hz / e4);
const ID = 'interaction-audio';

export default {
  study: true,
  id: ID,
  title: 'Deliberate audio: a tuning reference you can hear and see',
  notes: `Purpose: Let the room hear a reference tone on request and see what it is: the whole clip, a close-up of its samples, the measured pitch and how far it sits from the note it stands for.
Modify: Replace the WAV (assets.audio, embedded as a data URI) and \`data.reference\`; pitch, level and the cents offset are measured from the samples in the browser. Update \`tone\` for the headline.
Invariant: Sound plays only from a button or the native control, never on entry, and pauses when the slide is left. The waveform is drawn from the decoded samples, not a stand-in.
Static: The export shows the waveform, the close-up and the measured numbers; the audio element is hidden in print.`,
  sources: [{ type: 'audio', file: 'assets/media/audio.wav', license: 'original synthetic tone' }],
  exportPolicy: 'final',
  className: 'st cs-keynote-dusk',
  content: `<h1 class="st-head">The ${Math.round(tone.hz)} Hz reference sits ${cents.toFixed(1)} cents above E4, closer than an ear can tell, so it can tune the high E string</h1>
<p class="st-dek">Beginners’ guitar course (fictional): a ${tone.seconds}-second sine tone, ${Math.abs(tone.peakDbfs).toFixed(0)} dB below full scale.</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>Measured from the samples · pitch by zero crossings, E4 = ${e4.toFixed(2)} Hz in equal temperament (A4 = ${a4} Hz)</span><span>Interaction · Deliberate audio</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'audio',
    initial: { time: 0 },
    data: { reference: { name: 'E4', hz: e4 }, windowMs: 10 },
    text: {
      playPause: 'Play / pause', reset: 'Reset', audioLabel: 'Tuning reference, 330 hertz sine tone, 2 seconds',
      wholeTitle: 'Whole clip, 2 s', closeTitle: 'Close-up: {ms} ms of samples', periodLabel: 'one period {ms} ms = 1 / {hz} Hz',
      paused: 'Paused', playing: 'Playing',
      status: '{state} at {time}\u00a0s. Measured: {hz}\u00a0Hz, {seconds}\u00a0s long, peak {peak}\u00a0dBFS.',
      readout: [{ value: '{hz}', unit: 'Hz', label: 'measured from the samples' }, { value: '{cents}', unit: 'cents', label: 'from E4 (329.63 Hz)' }],
      figure: 'Waveform of the reference tone and a 10-millisecond close-up',
    },
  }],
};
