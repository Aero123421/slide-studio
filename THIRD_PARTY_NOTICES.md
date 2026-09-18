# Third-party media and dependency notices

Original instructional source, diagrams, geometry, mesh fixture, waveform video,
poster, tone and prose are distributed under the MIT license in this package.
Synthetic data are examples, not measurements. No external model output, personal
profile, private project document or account credential is needed to use this skill.
No font binaries are distributed. Fonts named in CSS are local fallbacks only.

## Photographs

| Files | Creator and rights | Source / modifications |
|---|---|---|
| `assets/media/photo.jpg`, `assets/media/study-01.jpg` | Rachel Michetti; CC0, courtesy of Pikolo Espresso Bar | scikit-image `coffee`; re-encoded JPEG, resized/cropped or grayscale where marked in individual studies |
| `assets/media/study-02.jpg` | SpaceX; public-domain release documented by scikit-image | scikit-image `rocket`, Falcon 9 / DSCOVR launch photograph; re-encoded/resized and presentation crops |

Rights documentation checked 2026-09-06:
https://scikit-image.org/docs/stable/api/skimage.data.html#skimage.data.coffee
https://scikit-image.org/docs/stable/api/skimage.data.html#skimage.data.rocket

The same photographs may be embedded as data URLs in built galleries. This notice
applies to those embedded copies too. A crop or visual filter is not an unedited
scientific observation. No sponsorship or endorsement by the creators is implied.
For reuse, retain provenance even where attribution is not a legal requirement.

## Optional tools, not vendored here

Node.js, Python, Chromium, Playwright, Pillow, python-pptx, pypdf and PptxGenJS are external
runtime/build tools. Install them from their official distributions and retain their
licenses when redistributing those tools. This ZIP does not contain node_modules,
browser binaries, Python environments or third-party JavaScript library bundles.
Optional model-viewer/Three.js/KaTeX adapters are discussed in documentation, not
bundled or automatically downloaded. A URL in the documentation is not an offline
runtime dependency. The viewer's Canvas mesh code is original instructional code,
not a CAD kernel. Host-agent products have their own terms and are not part of this
license.

The PDF text/font postflight uses separately installed **pypdf** (BSD-3-Clause), not
a vendored PDF engine. See https://pypdf.readthedocs.io/en/latest/meta/faq.html .
The package does not redistribute pypdf or font binaries. Retain the dependency's
license if you distribute it with your own application.
