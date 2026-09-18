# Export routes: choose deliberately

PDF delivery has actual-font auditing and postflight. Use an approved project-local font contract and follow [PDF typography](pdf-typography.md). The postflight dependency is pypdf, included in `requirements.txt`.

| Route | Preserved | Not preserved |
|---|---|---|
| Authored HTML | HTML/CSS/SVG, declared motion, widgets and local media | Native PPTX objects are not implied |
| Browser PDF | Static final visual state, text/vector where the browser supports it | Interactions, CSS animation, playable media |
| Fidelity PPTX | Static page appearance as a full-slide image; notes/sources | Native editable text/shapes, HTML behavior |
| Native scene PPTX | Native text and supported geometric shapes | CSS layout/motion; SVG/images remain pictures |

Do not choose the image route silently when native editing was requested. A custom
HTML page cannot be converted into exact editable PowerPoint objects merely by
changing the exporter flag. Author the native scene separately when necessary.

## HTML to static PDF or fidelity PPTX

```sh
python scripts/export.py project/deck.html project/deck.pdf
python scripts/export.py project/deck.html project/deck.pptx
```

These commands capture in memory and leave no persistent PNGs. Existing output is
protected unless `--force` is explicitly supplied. Output dimensions follow the
authored canvas. Review the exported file, not only its HTML. Dynamic plots and
media need meaningful export hooks/posters; a still cannot retain exploration.

## Native editable PowerPoint

```sh
node scripts/studio.mjs validate project/deck.json
node scripts/studio.mjs build project/deck.json --out project/native.html
node scripts/export-pptx.mjs project/native.html project/native.pptx --mode editable
```

Use version-1 scene data with `layout:"freeform", chrome:false` for an original
unframed composition. Text/shapes are expressed in CSS-pixel coordinates on the
1280×720 scene. `references/authoring.md` describes the schema. Text wrapping uses
estimates and requires real output inspection. Font differences between environments
can still change wrapping. SVG geometry stays a picture in the PPTX route.

The historical `--mode fidelity --png-dir` entry point is retained for existing
workflows, but the new `export.py` route avoids loose frames. The optional artifact
adapter is inherited and is not part of the tested default release path; do not
claim it was verified unless you run it in a supporting environment.

## Static narrative design

Use final state when it retains the argument. Expand intermediate states when each
contains unique evidence. Use a selected poster for video and several annotated
views for 3D when one view is insufficient. Keep the selected parameter value in a
frozen chart's caption. Remove controls only after preserving their meaning.

Test slide count, dimensions, glyphs, page breaks, notes, sources, pictures and native
objects as appropriate. Opening and parsing a PPTX verifies its structure, not visual
identity in every version of PowerPoint, Keynote or LibreOffice. Review the target
application for critical deliveries. No bundled route converts CSS into PowerPoint
animations or promises editable video/3D assets inside PPTX.
