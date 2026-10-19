// Composition study · Cinematic chapter — a dark divider with one photograph and a long pause.
// The chapter facts are data; the lead sentence is computed from them, so a changed hold or
// window length cannot leave the divider saying something the chapter does not show.

const deck = 'Flight 14 launch-day review';
const chapter = {
  number: 3, of: 5, title: ['Terminal', 'count'],
  span: 'T−40 min to liftoff',
  polls: 11,          // go/no-go polls in the terminal count
  holdMin: 17,        // one hold, upper-level winds
  windowMin: 32,      // length of the launch window
};
const windowLeft = chapter.windowMin - chapter.holdMin; // minutes of window left at liftoff

// Photograph: 640×427 source, shown 368×524 (scale 1.23, under the 1.3 limit).
// object-position 50% keeps the central 300 px of the frame: rocket and the two inner towers.
const photo = {
  src: '{{asset:assets/media/study-02.jpg}}',
  alt: 'A two-stage rocket standing on its launch pad at dusk, lit by floodlights, between two lattice lightning towers.',
  caption: 'Launch vehicle on its pad at dusk. Photo: SpaceX, public domain.',
  focus: [0.28, 0.22, 0.44, 0.78],   // source region that must stay in frame: rocket, pad and the two inner towers
};
const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

export default {
  study: true,
  id: 'composition-cinematic-chapter',
  title: 'Cinematic chapter: one photograph, a dark field and a long pause',
  className: 'st cs-astronomy-night cmp-cinematic',
  spaceIntent: 'Dark field left empty on purpose: the pause between chapters.',
  notes: 'Purpose: Mark a turn in a long talk (a new phase, a new question) so the room resets before the evidence starts again. Use it once per chapter, never as a decorative interlude.\nModify: Replace `chapter` and `photo`. Choose one photograph whose subject belongs to the chapter, crop it to a tall frame on the right four columns, and keep it at or below 1.3× its native size. The lead sentence is built from the chapter data; rewrite it as one sentence that says what the chapter will settle.\nInvariant: Dark paper with no gradient, glow or texture; one photograph, uncropped subject, credited in ink outside the frame; the title block sits on the left seven columns and its last line aligns with the bottom edge of the photograph; the top-left stays empty except for the running line.\nStatic: Already static. No parallax, no slow zoom: the pause comes from scale and space, not motion.',
  sources: [{ type: 'original-example', file: 'assets/compositions/cinematic-chapter.mjs' }, { type: 'image', file: 'assets/media/study-02.jpg', license: 'public domain' }],
  exportPolicy: 'final',
  content: `<p class="cc-run" data-region="support">${deck}</p>
<img class="cc-photo" data-region="primary" src="${photo.src}" alt="${photo.alt}" data-qa-focus="${JSON.stringify(photo.focus)}">
<p class="cc-caption" data-region="source">${photo.caption}</p>
<div class="cc-block">
  <p class="cc-label">Chapter ${chapter.number} of ${chapter.of}</p>
  <h1 class="cc-title" data-region="title">${chapter.title.join('<br>')}</h1>
  <p class="cc-lead" data-region="support">${chapter.span}: ${words[chapter.polls] ?? chapter.polls} go/no-go polls, one <b>${chapter.holdMin}-minute hold</b> for upper-level winds, and ${windowLeft}&nbsp;minutes of the window left at liftoff.</p>
</div>`,
};
