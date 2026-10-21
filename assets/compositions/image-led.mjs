// Composition study · Image-led opener — the photograph first, the words in their own dark field.
// The photograph keeps its full frame at 1.3× its native size and bleeds off two edges; the text
// never sits on the picture. The L1 distance in the dek is computed, not typed.
import { fmt } from '../runtime/figure.mjs';

const photo = {
  src: '{{asset:assets/media/study-02.jpg}}', w: 640, h: 427, scale: 1.3, // native px; 1.3 is the ceiling for this file
  alt: 'A white rocket stands on its launch pad at dusk between four lattice towers, lit from below by floodlights under a deep blue sky.',
  credit: 'Photograph: SpaceX, public domain. DSCOVR on its launch vehicle at Cape Canaveral, February 2015.',
};
// Sun–Earth L1 sits about a·∛(m / 3M) from Earth (Hill-sphere approximation).
const AU = 149.6e6, earthToSunMass = 3.003e-6; // km; Earth mass / Sun mass
const l1 = AU * Math.cbrt(earthToSunMass / 3);
// Dates are ISO strings; weekday names are derived, never typed.
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const day = (iso, { weekday = true, year = true } = {}) => { const d = new Date(`${iso}T12:00:00Z`); return `${weekday ? `${DAYS[d.getUTCDay()]} ` : ''}${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}${year ? ` ${d.getUTCFullYear()}` : ''}`; };
const lecture = { kind: 'Public lecture', speaker: 'Dr Lena Moraes', venue: 'Harbourside Planetarium', date: '2026-11-19', time: '19:30' };

const pw = Math.round(photo.w * photo.scale), ph = Math.round(photo.h * photo.scale);

export default {
  study: true,
  id: 'composition-image-led',
  title: 'Image-led opener: the photograph first, text in its own dark field',
  className: 'st cs-astronomy-night cmp-image-led',
  notes: `Purpose: Open with the subject itself when the audience should look before they read: a launch, a building, an instrument, a place. The photograph is the largest object; the words are few and sit beside it, not on it.\nModify: Replace \`photo\` (keep scale × native size at or below 1.3; this frame is ${pw} × ${ph} px from a ${photo.w} × ${photo.h} file) and \`lecture\`. Choose the two edges the picture bleeds off from where its subject continues (here the sky and the pad); put the text field on the opposite side. With a larger photograph, let it bleed further and keep the same field.\nInvariant: The subject is uncropped and the photograph is never washed, tinted or blurred to make room for type; the text field is the page's own flat dark paper; the title is short enough for three lines in the left four columns; the credit names the photographer, licence, subject, place and date.\nStatic: Already static.`,
  sources: [{ type: 'original-example', file: 'assets/compositions/image-led.mjs' }, { type: 'image', file: 'assets/media/study-02.jpg', license: 'public domain' }],
  exportPolicy: 'final',
  content: `<img class="il-photo" data-region="primary" src="${photo.src}" alt="${photo.alt}" style="width:${pw}px;height:${ph}px">
<h1 class="il-title" data-region="title">From L1, the Earth is always lit</h1>
<p class="il-dek" data-region="support">The satellite on top of this rocket now sits ${fmt(l1 / 1e6, { digits: 1 })} million kilometres towards the Sun. From there the whole sunlit face of the planet fits in one frame.</p>
<p class="il-meta" data-region="support">${lecture.kind}<br><b>${lecture.speaker}</b><br>${lecture.venue}<br>${day(lecture.date)}, ${lecture.time}</p>
<p class="il-credit" data-region="source">${photo.credit}</p>`,
};
