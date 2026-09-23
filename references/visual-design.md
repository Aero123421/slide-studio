# Visual design guide

Working order: establish the explanation, budget space, build a testable skeleton, direct the composition, then apply color, typography, and imagery consistently.

## Design a page without a template

This is a concrete route for an agent that has trouble inventing stable geometry.
It does not require asking the user to pick a style or loading hundreds of examples.
Read the space procedure below and then work through one page.

### Establish the explanation before its shape

Write the claim and its scope in one plain sentence. Name the actual relationship:
paired comparison, flow, causal hypothesis, mechanism, containment, sequence,
topology, part-whole, threshold, uncertainty, spatial correspondence or spatial
detail, evidence versus interpretation, or emphasis.
A diagram is not automatically appropriate: the original image, a table or a short
statement may be the best evidence.

Choose a reading operation: compare on an aligned axis (compare registered
positions), follow a path, find a part (inspect a focal object or a selected
range), scan rows, read a hierarchy, progress through states, or connect an
observation to its limit.
Now choose the primary medium and a subordinate treatment for supporting material.
Write a three-line plan of *content and geometry*, not a long art-direction essay.

### Build a skeleton that can fail cheaply

Create the real heading, the primary region and essential labels on a neutral canvas.
Use the real long strings, not “Title / Body / Item”. Derive dimensions from their
measured needs. Render before styling all pages. Do not mistake a finished cover for
a tested explanation. Use another page with a different density as a cross-check.

Ask: would this be comprehensible as black type and lines? If not, color and motion
will not fix the missing thought. Correct the relationship before styling it.

### Make geometry from data, not disconnected coordinates

`assets/runtime/layout.mjs` supplies:

- `allocate`: partition a region by meaningful weights and explicit gaps.
- `dagLayers`: a stable layered layout for directed acyclic graphs. Reject cycles
  or a canvas that cannot fit the nodes; preserve IDs/edges.
- `routeOrthogonal`: candidate orthogonal routes with obstacle checks. It fails
  rather than pretending it found a clear route. Complex routing still needs review.
- `labelRail`: distribute **measured-height** labels along an external rail while
  retaining their target order. Refuse labels that do not fit instead of shrinking.

These helpers are building blocks, not a general automatic graphic designer. They
must not silently change a graph's semantics, chart scale or labels. Browser text
measurement remains necessary. If a solver fails, change the orientation, region,
label wording or page decomposition. Do not weaken its constraints just to render.

### Turn a skeleton into a coherent composition

Choose one dominant hierarchy, a small set of type roles and semantic color roles.
Adjust shape language to the subject: a boundary is not a pill, a timeline is not a
row of feature cards, and a measured distribution is not an ornamental wave. Keep
strokes, corner behavior, icon scale and arrowheads internally consistent.

Use proximity to group evidence with its interpretation.
Place sources where they are readable without competing with the argument. Use
photographs at a scale that lets them communicate; avoid arbitrary microthumbnails.
A new diagram can share a brand's type and colors without sharing a preset layout.

### SVG production details

Set a real `viewBox`, explicit drawing extent, unique namespaced IDs and a meaningful
accessible title/description. Put connectors behind nodes. Calculate ports at shape
boundaries, not centers behind filled objects. Give arrowheads clearance. Keep label
padding proportional to type size, not inherited from tiny icons. Use an external
rail if internal labels require crowded boxes.

For editable text, retain `<text>`/`<tspan>` when possible. Do not outline text merely
to hide font problems. Avoid arbitrary line breaks and fit-to-box shrinking. Verify
accented characters, CJK, long labels and SVG marker/clip references after embedding.

For motion, a geometry group and its attached label should usually move together.
A label that must stay upright belongs outside the rotated geometry. On SVG use
explicit `transform-box` and `transform-origin`; do not rely on accidental defaults.

### Test a new arrangement, not only a copied example

Make one controlled mutation: a label twice as long, a different node count, a
negative datum, a new column order, or a different language. It must preserve facts
and still fit. The benchmark briefs in `tests/agent-evals.json` and the examples can
help define tasks; they are not evidence that other models have been evaluated.

When the result is weak, change one cause at a time. Record the observed defect and
the concrete repair. “Make more professional” is not an actionable review finding.

## Inventing compositions from relationships

### A constructive grammar

Start from the relationship and reading operation chosen in “Establish the
explanation before its shape” above. Derive a composition through transformations: translate a cluster; change scale
hierarchies; rotate the conceptual axis; expand a selected region; split a figure
across registered views; put annotations in an external rail; turn repeated values
into small multiples; replace a diagram with the actual object plus labels; combine
an image and a shared data axis. Transform the relationship, not just the colors.

### Geometry contract

The default canvas is 1280×720 CSS pixels. It is a starting coordinate system, not a
requirement. The authoring API supports explicit width/height. For another aspect
ratio, recompose important regions; do not crop the edges or compress every element.

`grid`, `position`, `port`, `connector`, `scaleLinear`, `contrast` and `checkBounds`
in `assets/runtime/kit.mjs` are optional mathematical helpers. They do not prescribe
visual layouts. A grid cell is a coordinate box, not a card.

```js
const [figure, commentary] = grid({x:64,y:182,width:1152,height:458,
  columns:2,rows:1,gap:44});
// This symmetric grid is only a starting calculation.
figure.w = 744;
commentary.x = 856;
commentary.w = 360;
// Derive labels and connectors from these edited boxes, not stale coordinates.
```

Every essential text block needs a measured content area. Prefer flowing text in a
bounded block to manually positioned words. Use absolute coordinates for diagrams,
not to force prose into individual lines. Avoid clipping wrappers around essential
text. A clipping region is valid for deliberate photo crops and masks, not a remedy
for text that does not fit.

### Repair order for crowding

Check whether the claim is trying to do two jobs. Remove duplicate wording. Shorten
without deleting scope. Reassign space from lower-priority content. Change columns
or place labels outside the plot. Split a genuinely independent explanation onto
another page. Only then adjust a local type size within a readable role range.

Tables may need density. Do not turn a 12-row comparison into 12 oversized cards.
Align numbers by decimal or right edge, keep units explicit, and use rules sparingly.
A table with readable annotations can be a better full-slide design than a chart.

### Intentional overlap versus failure

Text may overlap an image where actual negative space and contrast support it. An
annotation may point through a diagram when the crossing is understandable. Decorative
geometry may bleed past the canvas. Mark only the specific intentional element with
`data-qa-overflow="reason"` or `data-qa-overlap="reason"`. These are review notes,
not permission to suppress all defects. Never put a waiver on the whole slide.

## Space is a relationship, not an occupancy target

First choose the [reading mode and density](writing-and-editing.md); a high-positioned cluster of tiny text is not good whitespace.

An empty region can focus a claim, separate roles or preserve an image's breathing
room. It can also expose an undersized figure, an awkward title block or a detached
annotation. Never classify it only by how many pixels are blank. There is no required
filled-area percentage, golden ratio, card count or minimum number of objects.

### The constructive procedure

**1 — Identify the optical primary.** What must be readable first: the finding, a
photograph, a mechanism, a comparison, or a table? Choose this before allocating
supporting modules. A large title is not automatically the primary.

**2 — Reserve the frame.** Start with the output aspect ratio, brand clear space,
projection/reading requirements and any true footer/source needs. Reserve safe
margins. Do not inherit an arbitrary template's huge header and footer regions.

**3 — Allocate relationships.** Put the evidence and the text that interprets it near
each other. Separate independent roles with a deliberate gap. A note belongs beside
the feature it qualifies, not in the next empty corner. Equal widths are useful for
controlled comparison; otherwise they must be earned.

**4 — Measure, then draw.** Measure the longest actual label, headline and table row
in the intended font. Calculate the minimum object area from these measurements.
For SVG, distinguish the `viewBox` from the visible drawing's `getBBox()`; a huge
empty viewBox does not produce a large diagram. Measure again after labels wrap.

**5 — Adjust the optical weight.** Compare the actual masses: dark marks, type,
photographic texture, dense tables, and whitespace. A thin outline and a solid
photograph do not have equal visual weight at equal area. Align visible edges and
baselines, not only nominal wrapper rectangles.

**6 — Explain each large gap.** Is it a pause, reading separation, photo negative
space, an axis range, a brand rule or room for the next animation state? If it has
no job, move/enlarge the primary, narrow the secondary column, or restructure the
page. Do not fill the hole with icons, background blobs or unrelated text.

**7 — Stress it.** Try the longest heading, full labels, largest table, final animation
state, a reversed transition, and target language fallback. A layout that works
only with the sample labels is not reusable.

### A useful calculation, not a fixed layout

For a 1280×720 page with 64px side margins, the usable width is 1152px. A diagram
that needs an external explanation can allocate a 48px gap and divide the remaining
1104px in a 3:1 relation: 828px for evidence and 276px for a concise explanation.
These numbers are a *candidate*, not a standard. If the explanation wraps into ten
lines, change the thought, width or composition instead of pretending 276px fits.

```js
import {allocate,dagLayers,labelRail} from './layout.mjs';
const [evidence,explanation] = allocate({
  x:64, y:230, width:1152, height:410, weights:[3,1], gap:48
});
// Determine labels and their measured sizes before building nodes.
// A narrow-canvas exception from dagLayers means recompose, not disable the check.
```

### Diagnose the visible symptom

| Symptom | Check first | Useful repair |
|---|---|---|
| Small figure floating in a large empty page | SVG drawing bounds, fixed media height, huge inherited title slot | Remove viewBox padding; enlarge real geometry; free the title slot |
| Title and figure look unrelated | Gap relative to their own heights; missing verbal relationship | Move evidence closer; combine a redundant subheading; align one anchor |
| Awkward empty center | Independent absolute boxes have been pushed to corners | Recompose as a primary + rail, registered pair, or continuous sequence |
| A giant gap on one side | Nominal center differs from optical center; source image has padding | Crop transparencies; move the actual primary; preserve intentional negative space |
| Last line is a lone short phrase | The block width forces an orphan | Edit syntax or shift width locally; do not insert arbitrary `<br>` everywhere |
| Figure has ample space but labels collide | Labels added after geometry; connectors cut through text | Reserve a rail, measure text, reroute from ports, or expand the whole figure |
| Everything is equally important | Equal weights, equal boxes, equal sizes | Choose a real primary; reduce hierarchy competition rather than using more colors |
| A page feels sterile | Content has no argument or figure is a generic substitute | Improve the explanation; do not add decorative density as a reflex |
| A page feels cramped only after animation | Initial state was reviewed, final states were not | Budget maximum extents and moving labels; inspect crossing trajectories too |

### Mark the intended structure in authored HTML

`data-region="title|primary|support|source"` makes the browser report easier to read.
For an intentionally quiet primary, add a short `data-space-intent` explaining its
job. These attributes are invisible metadata. They are not audience captions.
Do not add large `data-qa-overlap` waivers to hide unresolved collisions.

The browser report provides actual text line counts, heading stacks, orphan hints,
declared-region boxes, an approximate occupied-area fraction and the largest coarse
empty rectangle. These are diagnostic clues. Decoration can game occupancy; wrapper
boxes can inflate it. Never optimize the metrics as a taste score. Read the image.

### Deck-level rhythm

Review a contact view for repeated shapes, title locations, image-to-text ratios,
background changes and density. Repetition earns its place in comparison or teaching;
random alternation does not create quality. Use quiet and dense pages where the
argument needs them. A page can depart from the usual grid while retaining typography,
color logic and alignment discipline. Company identity is not compulsory uniformity.

## Art direction is a system of decisions

A deck can be quiet, cinematic, technical, illustrative, playful, formal, dense or
editorial. None is a default synonym for quality. Match the audience, content and
viewing distance; preserve user direction instead of imposing a house style.

### Define the visual contract before multiplying pages

Record the dominant idea in one sentence. For example: “A photographic subject
anchors a restrained editorial composition; annotations reveal details without
obscuring the original.” Choose background, text, accent and data roles; heading,
body, label and code styles; a spacing rhythm; image treatment; and motion character.
Start color from a role-based system in `assets/color-systems/` (below), not a list of swatches.

A slide needs a clear first read, a second read, and a deliberate stopping point.
Rank elements by meaning before assigning size. The most saturated area, highest
contrast edge, largest type or strongest face/subject will usually compete for
attention. Decide which should win. Do not let the logo, footer and ornament all
compete with the result.

### Design the entire canvas

Start with occupied masses, empty areas and alignment anchors. Then refine text and
figures. If the right half is busy, a larger left margin may be useful balance,
not wasted space. If the subject occupies the image's center, text may need a separate
field rather than a dark overlay across the photograph.

Check the silhouette at reduced size, and content at actual presentation size. A
beautiful thumbnail can hide illegible labels. A readable close-up can hide a
cluttered overall hierarchy. Both views are required.

Do not treat top-left title + three cards as universal. Alternatives include one
dominant image with a marginal note, a shared axis across the canvas, a diagram
occupying the full field with labels at its perimeter, a typographic statement,
a split comparison, a sequence crossing several pages, or a dense research plate.
Choose because of the content, not to satisfy a variation counter.

### Cohesion with variation

Hold a few identity features constant: type roles, margin anchors, color meanings,
annotation style and stroke rhythm. Vary information density, dominant medium,
composition and temporal pace when the narrative changes. Repeated comparisons
should keep their axes and visual grammar stable. Random layout changes make
comparisons harder and do not demonstrate originality.

### Finish details that generic decks neglect

Align visible glyph edges optically, not only text-box edges. Match image baselines
with relevant text, align figure captions with the figure, and give notes a readable
measure. Avoid microscopic footers. Use typographic punctuation appropriate to the
language; do not simulate letterspacing by inserting spaces between characters.

Match illustration perspective, outline weight and light direction where they share
a scene. A cutout should meet the background naturally; a white rectangle around it
is not a cutout. A large image must have enough effective pixels for its crop. Ensure
that a decorative pattern neither implies data nor creates a false connector.

Review both dark and light page runs in a contact sheet. Sudden changes can be
purposeful chapter boundaries, but accidental alternation feels like unrelated decks.

### Critique questions with actionable answers

“What should I notice first?” Name an object, not “the design.”
“What can I remove without losing meaning?” Remove redundant chrome, not caveats.
“What is causing crowding?” Name the competing regions and reallocate space.
“What is generic?” Identify a content-independent phrase or motif, then replace it
with a content-specific relationship. Do not just replace one fashionable style
with another.

Taste is not scored by the script. Produce a short evidence-backed critique, fix
concrete defects, and retain intentional deviations with narrow explanations.

## Color with stable meaning

Name roles before choosing swatches: paper, primary text, secondary text, accent,
comparison series, annotation, warning and positive/negative change. A new color
should carry a role or a deliberate artistic reason, not merely add variety.

Start with a neutral field and a small number of meaningful colors, or a deliberately
expressive palette when the brief warrants it. A dark scientific slide and a warm
editorial slide can both be excellent. Never “improve” a supplied white brand to
cream without permission. Preserve identity and source evidence.

### Role-based color systems

`assets/color-systems/<id>.json` defines each palette by role — paper, surface, ink,
inkMuted, rule, accent, onAccent, positive, negative — plus data palettes
(categorical 3–6 ordered by use, a 5-step sequential ramp, a 5-step diverging ramp
with a neutral middle, one highlight and a quiet context color), font stacks with
Japanese fallbacks, rough area ratios and palette-specific usage rules. Pick by
content and audience (`useFor` / `avoidFor`), not by taste in isolation; a supplied
brand overrides all of them. `gallery/color-systems.html` shows every system applied
to text, a highlight-versus-context chart, categorical lines and both ramps.

```sh
node scripts/color-systems.mjs validate                       # all systems, or pass files
node scripts/color-systems.mjs specimen out.html my-brand.json   # preview your own system
python scripts/slop_check.py deck.html --palette assets/color-systems/laboratory.json
```

The validator computes WCAG contrast for every text/background role pair, CIELAB
distance between categorical colors with and without simulated deuteranopia,
protanopia and tritanopia, monotonic lightness for sequential ramps and a neutral
middle for diverging ramps. `slop_check.py --palette` lists colors used outside the
declared system. Arithmetic does not replace looking at the rendered page.

Discipline that makes a palette read as designed rather than generated: one hue
family dominates; the accent is scarce and means "this"; everything not under
discussion takes the context color; identity colors (a product, a model, a team)
are used for that entity only; positive/negative always carry a sign or word as well.

Use the `contrast()` helper for opaque pairs. It returns a numerical ratio, not a
full accessibility certification. For ordinary web text, the relevant WCAG AA
contrast thresholds are 4.5:1, or 3:1 for qualifying large text; verify the current
W3C source and the actual size/weight/context. Projection may need more contrast
than a compliance minimum. Blends, transparency and image backgrounds require
sampling the actual rendered result, not only token values.

### Data color

Use categorical colors for categories, sequential luminance for ordered magnitude,
and a meaningful diverging scale around a stated reference. Do not imply order with
arbitrary hue. Do not use a rainbow to encode precise magnitude by default. Labels,
position, shapes or line patterns must carry meaning too; avoid red-versus-green as
the sole distinction. Keep colors consistent across the deck and every state.

A selected datum can gain emphasis without making the rest unreadable. Uncertainty
bands should remain visible in print and when overlapping. Avoid semitransparent
fills that accidentally suggest additional categories. Legends need labels and units;
direct labels often reduce lookup effort.

### Gradients and patterned surfaces

Gradients are allowed where they create a deliberate field, lighting or spatial
hierarchy. They do not automatically make a slide modern. Avoid placing small text
across widely varying luminance. Patterns need scale discipline: fine lines can
alias on projectors and exports. Inspect at actual target dimensions.

The color systems are editable starting points; a supplied brand identity is not
(see above). Run real
contrast checks after changes and review data semantics separately.

## Typography across languages

For a PDF complaint, distinguish source text, substituted family, print-state loading and PDF encoding using [PDF typography](verification-and-delivery.md). A font readiness check alone is insufficient.

Typography is a semantic and spatial system, not choosing a fashionable font name.
Define heading, body, chart label, caption, control and code roles independently.
Use available fonts with verified coverage. **No font binaries are bundled.**
Users obtain fonts through their own approved channels and licenses.

### Readability versus density

At a 1280×720 reference canvas, 44–76 px headings, 24–34 px prose and 18–24 px chart
labels are useful starting ranges, not universal rules. A research plate can use
smaller labels for near-screen reading, but a live projection requires a different
content budget. State the intended viewing condition and inspect at that scale.

Set line height for the script and role. Tight display typography is not a model for
Arabic, Devanagari or CJK body text. Use real font weights, avoid fake bold when it
changes the appearance, and do not assume equal metrics between fallback fonts.
Test `document.fonts.ready` and inspect actual glyphs; a font family name is not proof
that the font was installed or contains the characters.

### Language is not only translated wording

Set `deck.language` with a BCP 47 tag. Set `direction:'rtl'` for the presentation when
appropriate; individual slides may have their own `language` and `direction`.
Use `lang` and `dir` on mixed-language regions. The player has 12 localized label
sets and accepts `deck.labels` overrides for others. Widget text is authored content:
the 24 teaching widgets use English labels by default and must be localized when
reused. Do not claim that player localization translates a deck.

For Japanese, use natural phrasing, appropriate line breaks and punctuation. Avoid
isolated closing punctuation at line start; do not force a break between a number
and its unit. For Chinese, select the intended script and regional glyph forms. For
Korean, check word and syllable wrapping instead of assuming Japanese rules.

For Arabic and other RTL scripts, preserve shaping and joining; avoid artificial
letterspacing. Use logical properties (`margin-inline-start`, `inset-inline-end`,
`text-align:start`). Mirror reading flow where appropriate, not numerical charts,
scientific axes or the inherent direction of a physical object. Use `<bdi>` or
`dir="ltr"` for identifiers, code, units or URLs inside RTL prose. Never reverse
strings programmatically to “support RTL”. See the W3C references in [working agreements](working-agreements.md#primary-references).

For Devanagari and other combining scripts, do not split grapheme clusters. Avoid
letter-by-letter text animation that separates combining marks. Reveal phrases,
lines or whole labels instead. Cursive fonts and ligatures need the same care.

German and other expansion-prone translations need wider text budgets. Numbers,
dates, decimal punctuation, percentage spacing and minus signs should use the target
locale where appropriate. `Intl.NumberFormat` is preferable to concatenating strings.
Quoted source terminology may remain in the original language with an explanation.

### Localizing a designed page

Translate the argument, then recompose. Do not freeze English coordinates and shrink
translated text until it fits. Re-evaluate heading breaks, reading order, image/text
balance, figure widths and footnote space. Test roughly 40% expansion as an engineering
stress fixture, not a claim about every language. Also test a long unbreakable token,
an empty optional label and mixed numeral systems.

The language gallery contains typography fixtures, not certified translations.
Native-language editorial review is still necessary for high-visibility publication.
Use `python scripts/fontcheck.py PATH_TO_APPROVED_FONT --text "Text to check"`
for an explicit font's cmap coverage (optional fontTools dependency). Choose `--index`
for a font collection. This does not inspect installed families, install fonts, or
certify shaping/ligatures. Inspect actual rendered output as well. Never bundle font
binaries merely because a font was available on the development machine.

## Images, illustration and geometric texture

### Choose a visual for a job

An image may be evidence, the subject being explained, context, a spatial reference,
a metaphor, atmosphere or a visual pause. Name its role. Use actual supplied product
or experiment images when making claims about those artifacts. Do not imply that a
stock photo documents a user's product, team, facility or result.

Use local, approved media when available. Obtain rights before redistributing external
media. Record original source, author, license, modifications and alternative text.
No image-generation service is required by this skill. When image generation is
explicitly prohibited, use code-native vector work or legitimate existing assets,
not a generated concept image in disguise.

### Placement modes and their trade-offs

**Contain:** preserve the whole artifact; useful for instruments, maps, figures and
screenshots. Accept letterboxing as a design choice or place it on a matching field.
**Cover:** fill a frame; protect the subject's focal point with `object-position`.
Never crop axis labels, scale bars, identifying parts or experimental context.
**Bleed:** let an image touch one or more edges while maintaining a deliberate text
anchor. **Cutout:** use real transparency and a coherent background; inspect edge
halos at full size. **Registered pair:** use identical crop, scale and alignment.
**Detail inset:** preserve a full view and connect the selected area to the crop.
**Image in type/mask:** an expressive treatment, rarely appropriate for evidence.
Provide text fallback and preserve legibility across fonts and export.

For a frame `fw×fh` and source `iw×ih`, cover scale is `max(fw/iw,fh/ih)`; contain
scale is `min(...)`. The discarded image area is a factual/design decision, not a
browser accident. A crop fixture should test portrait, square and panoramic sources.

Inspect the original **and the final crop**. Confirm the subject promised by the title
is still visible, not just surrounding scenery. When a small subject sits near an edge,
change `object-position`, contain the image, or change the frame and adjacent text.
Cropping a real photograph can remove its evidentiary value without breaking its URL.
For fragile crops, an optional `data-qa-focus` region can make the intended subject
testable; see [rendered integrity](verification-and-delivery.md). Recognition still requires
viewing the original. A narrower frame is not automatically a better composition.

### Text over images

Inspect the actual pixels beneath each line. A generic dark overlay is not a guarantee.
Move text to genuine negative space, use a separate field, or add a localized scrim
when appropriate. Avoid washing a photograph uniformly merely to force a headline.
White text over bright clouds is still illegible inside an elegant composition.

### Integrity of scientific images

Preserve orientation, scale bars, acquisition conditions and relevant surroundings.
Declare crop, color mapping, normalization or contrast adjustments. Do not apply
“beautifying” effects to measurement imagery. Compare panels under equivalent
transformations. Decorative duotone is acceptable for clearly non-evidentiary artwork,
not for changing the apparent strength of a result.

### Illustrations and patterns

Illustration should expose a mechanism, not act as generic clip art. Choose a coherent
line/fill vocabulary; use labels on real parts. Simplify incidental detail while
retaining the relationships needed for the claim. Editable SVG is preferred for
schematics because geometry and semantics can be inspected.

Geometric motifs can establish rhythm, partition sections or create visual identity.
Use clipping and containment so they do not obscure essential content. Keep density
and contrast below the focal subject unless the pattern is the subject itself.
A dot grid is not a data plot; label schematic encodings as such.

### Performance and packaging

Resize raster media to an appropriate effective resolution after selecting the crop.
Use PNG for transparency or sharp screenshots where appropriate, JPEG/WebP for
photographic imagery after checking artifacts. Keep originals outside disposable QA.
The built-in placeholder syntax embeds local media up to 16 MiB per asset; large
video should be an explicit local asset bundle, not megabytes pasted into model context.
Do not ship unrelated photographs or font files with the deck.
