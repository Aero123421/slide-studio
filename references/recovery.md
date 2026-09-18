# Recovery ladder for difficult authoring

Do not respond to “make it better” with random restyling. Diagnose the failure first.
Use the following bounded actions when you need more explicit scaffolding.

| Symptom | Inspect | First repair | Escalation |
|---|---|---|---|
| Generic title | What changes for the audience? | State the specific contribution | Revisit the slide's job |
| Too much text | Repetition, scope, independent claims | Remove repetition, keep caveats | Split independent questions |
| Diagram feels tangled | Entities, directed edges, boundaries | Reorder nodes by relation | Redraw using lanes or layers |
| Chart seems impressive but unclear | Question, units, baseline | Use direct labels/common scale | Change encoding, not the data |
| Empty-looking page | Focal object and second read | Enlarge the meaningful subject | Reallocate regions; don't add filler |
| Busy page | Competing contrast/saturation | De-emphasize secondary material | Recompose instead of shrinking |
| Image crop loses subject | Original subject boundary | Move focal point or contain | Change frame and text location |
| Translation does not fit | Script, line height, token lengths | Reflow and reallocate width | Redesign that localized page |
| Motion drifts on reverse | State derived incrementally? | Use absolute target states | Replace custom loop with state map |
| Reset fails | Nested initial state mutated? | Deep-copy initial state | Separate source/model/view |
| Output works only online | Hidden font/CDN/decoder fetch | Bundle approved local assets | Static fallback and disclosure |
| PDF is empty | Hidden layers, Canvas, export hooks | Apply informative static state | Expand key states into pages |
| QA keeps flagging intended overlap | Exact element and reason | Narrow waiver plus visual review | Redraw the ambiguous crossing |

## A productive repair loop

Observe one actual rendered defect. Name its cause. Make one bounded change. Rebuild.
Run the same test. Inspect the same region and adjacent regions. Keep the change only
if the defect is fixed without breaking the claim or introducing another defect.

When uncertain about artistry, compare two materially different treatments of the
same content *internally* and choose one. Examples: registered comparison versus
side-by-side text, full figure versus detail inset, dense table versus shared axis.
Do not ask the user to choose between ten arbitrary palettes.

## Avoid common small-model traps

Do not copy screenshot pixels into an HTML image and claim editable design. Do not
copy a gallery's entire generic frame into every final deck. Do not edit a bar's
label without its scale. Do not hide overflows with `overflow:hidden`. Do not remove
notes containing limitations. Do not install a large framework for a two-control
widget. Do not create parallel loops/timers for every hidden slide.

If you cannot run a tool, identify the precise untested gate and retain inspectable
source and a fallback. Do not manufacture passing tests. If the environment permits
other verified paths, use them without repeatedly asking permission for reversible
local steps. A simpler correct delivered deck is preferable to an impressive broken
prototype, but simplicity must not become an excuse to ignore the requested medium.

## Stop unproductive tool loops

For media retrieval, inspect the HTTP status, content type and final URL before retrying.
Do not repeat the same malformed request after 400, missing resource after 404, or
unsupported image-view request: change the request or use a permitted alternative.
For 429/transient failure, honor Retry-After and use a small bounded retry budget
(normally at most two retries per candidate), then use another legitimate source,
approved local material, or explain the missing evidence. Avoid mass scraping and
do not bypass access controls. Keep the provenance of any replacement.

If the current agent/tool cannot view images, do not keep resending the same image or
call geometry measurements a visual inspection. Retain screenshots/review HTML for an
available visual reviewer. Report exactly which checks ran and that visual review is
pending. Do not claim a universal model limitation from one tool's error.
