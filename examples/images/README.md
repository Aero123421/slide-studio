# Image handling: twelve pages from one magazine issue

The spring issue of a fictional city magazine, *Weir Quarterly*: an installation at a
gallery, a mug from a pottery, a café's espresso and a launch pad at dusk. Every page
is a real page of the issue — a cover, an exhibition opener, a catalogue plate, a shop
page, a café review, a recipe, a menu, a lab figure, a feature opener, an annotated
photograph, a picture-desk decision — and each one makes one image decision visible.
The right side of the source line names the technique in a small, consistent caption;
the left side says what the picture is, its licence, its native size and the scale it
is shown at.

```sh
node scripts/craft.mjs build examples/images/deck.mjs --out images.html --force
```

## How the module is built

- **Media, read once.** `media()` reads each file, takes its real pixel size from the
  file header and embeds it as a data URI (self-contained under any build route; in
  your own project keep pictures beside `deck.mjs` and write `{{asset:assets/…}}`).
- **Features in image pixels.** `FEATURES` holds what was measured on the originals:
  the cup's rim, the spoon, the fairing tip, the mast tops, the empty wall of the
  rendering, the brightest pixel of the sky band. Nothing is placed by eye on the page.
- **`place(img, frame)`** computes every crop (`cover`, `contain`, or a zoomed detail),
  refuses any frame that would show a picture above **1.3× its native size**, writes
  `data-qa-focus` for the subject so `qa.py` fails if a later edit crops it, and
  returns `at()`, which maps image pixels to page pixels through the same transform —
  leaders, locator boxes, dimension lines and type boxes follow the crop.
- **One grid and one palette.** 64 px margins, 12 columns of 74 px with 24 px gutters;
  `cs-culture-gallery` (gallery white, near-black ink, one wine accent); a serif for
  headlines (Charter on a Mac, Cambria on Windows, Caladea on Linux) and Inter for
  everything read at size. Scale: display 104 · headline 40 · lead 22 · body 18–20 ·
  label 16 · source 15.
- **Story data** (`show`, `shot`, `menu`, `mugSpec`, `crema`) drive every number on the
  pages: the brew ratio, the menu headline's count, the mug's diameter (measured from
  the picture and the stated 11 cm height), the crema half-time.

## The pages, in deck order

| Page | Id | Technique | What to look at |
|---|---|---|---|
| Cover | `image-11` | **Overlay only where contrast survives** | The cover line sits on the sky band, whose brightest pixel still gives white type 11.4 : 1; on the floodlights it would be 1.0 : 1, so nothing else touches the photo — even the source line moves to the paper column. |
| Exhibition opener | `image-3` | **Negative space for type** | Full bleed at 0.89×; the title and dates sit on the rendering's empty wall (measured, 12.2 : 1 for ink). The crop keeps the floor under the disc and the wall above the apex. |
| Catalogue plate | `image-1` | **Contain the whole** | The rendering whole at exactly 0.50×, label beside it, never on it: the three shadows share one floor, so no edge can go. |
| Look closer | `image-5` | **Context and detail** | The full view at 0.44× carries a box; the detail beside it is cut from that box at 1.00×; two lines connect them. |
| Shop | `image-6` | **Transparent cutout** | The cutout stands on the page paper with its own floor shadow, nothing cropped; dimension lines are drawn from the measured body box. |
| Café review | `image-2` | **Crop toward the subject** | A 4 : 5 crop at 1.30× keeps 53% of the width, centred on the cup; `data-qa-focus` protects the rim and the spoon. |
| Recipe card | `image-4` | **Deliberate inset** | The photo at native size, with margins on all four sides and its caption beneath; the steps take the other column. |
| Bar menu | `image-10` | **Shaped frame** | A circle that repeats the round cup, for an identity picture — never for evidence. |
| Coffee lab | `image-12` | **Preserve the full scientific figure** | The figure arrives as a file (an SVG in an `<img>`), shown whole at 1.00× with both panels, axes, scale bar and its own caption. The scale bar is computed from the 68 mm rim and holds only at the rim plane, as the caption says. |
| Science opener | `image-7` | **Bleed to one edge** | The photo runs off the right edge only, at 1.30×; the other three edges sit on the margins. |
| Annotated photo | `image-8` | **Separate text from evidence** | Labels in a column beside the photo; leaders are white over the photo and ink over the paper; one measured line shows the mast tops 5 px above the fairing tip in a 427 px frame — a fact about the picture, not about the ground. |
| Picture desk | `image-9` | **Crop exploration** | Three equal 4 : 5 frames, three focal decisions (0.94×, 1.20×, 1.15×), the chosen one marked in the accent. |

## Rules to carry into your own decks

- Name the picture's job first (evidence, subject, context, atmosphere), then choose
  `contain`, `cover`, an inset, a bleed or a detail.
- Never show a photograph above ~1.3× its native pixels; `place()` throws instead of
  softening the picture. A small photo becomes an inset, not a background.
- Measure features once in image pixels and map them; never hand-place a leader, a box
  or a type block over a photograph.
- Declare the subject (`data-qa-focus`) so QA catches a crop that cuts it.
- Put type on a picture only where you have measured the contrast under every letter.
- Keep scientific figures, artworks and instruments whole; crop views, not evidence.
- Credit every picture with its licence, native size and display scale.

## Media and honesty

`study-01.jpg` (espresso, 600 × 400, CC0) and `study-02.jpg` (launch pad at dusk,
640 × 427, public domain) are photographs; the two `image-fixture-*.webp` files are
original synthetic illustrations, presented here as a studio rendering and a product
render. The magazine, the gallery, the café, the pottery, the artist, the writer and
all numbers are fictional; the crema data are illustrative. The launch-pad labels
describe what is visible in the picture; they are not an engineering survey.
