# Media and 3D: practical boundaries

## Video and audio

Use real local media, a descriptive title, selected poster, controls, captions or
transcript, and an explicit failure fallback. Never create a play button that toggles
an icon without playing media. Do not assume browser autoplay permission. Handle
the promise returned by `play()` and keep native controls available. Pause when the
slide leaves, the document is hidden, or export begins. Do not resume sound without
appropriate user action.

Seek after metadata is available; clamp to actual duration. Test loaded metadata,
play, pause, seek, time/frame change, captions and leave/revisit. An image called
“video poster” is not proof of playback. For large files, package a local asset folder
with relative URLs and use a local HTTP server where file-origin restrictions apply.
Document codecs and fallback formats based on the actual target browser.

Bundled media is a short synthetic signal clip with captions and a low-amplitude
synthetic tone. It is not footage of a real experiment. Its purpose is to exercise
playback behavior and static fallback.

## Mesh viewer included in this release

`assets/runtime/mesh.js` parses local ASCII/binary STL and simple OBJ geometry. It
retains OBJ group names, validates finite coordinates and triangle references, and
bounds input to 8 MiB and 40,000 triangles. The renderer is a lightweight Canvas
painter with group colors. It does not implement full material/texture fidelity,
robust occlusion for all geometry, NURBS, constraints, tolerances or CAD editing.

Orbit uses yaw/pitch controls and pointer/keyboard alternatives. Explode separates
named groups while preserving source geometry. Cutaway clips visible triangles:
it is **not a capped, watertight CAD cross section**. Imported units are unknown unless
provided. Do not label imported geometry “millimetres” by inference. A mechanical
illustration is not a certified engineering drawing.

STL/OBJ does not preserve complete assembly semantics, design history or feature
parameters. Do not claim STEP/native CAD compatibility from mesh import. Convert
CAD in an appropriate tool and retain the original plus a conversion record.

## Production GLB/glTF path (optional adapter, not bundled dependency)

For material-aware interactive 3D, an agent can integrate an approved pinned local
`<model-viewer>` or other renderer after checking current primary documentation.
GLB is a presentation geometry format, not a replacement for the CAD source.
A minimal shape is:

```html
<!-- Load an approved, pinned local model-viewer bundle separately. -->
<model-viewer src="assets/assembly.glb" poster="assets/assembly-poster.webp"
  camera-controls touch-action="pan-y" alt="Assembly with labeled components">
</model-viewer>
```

This snippet is not operational without that dependency. Configure decoder paths
locally when compressed textures/meshes need them; a nominally local model can still
trigger CDN fetches. Respect CORS, licensing, offline operation and browser support.
Use loading/error fallback, keyboard behavior, display budgets and reduced motion.
Do not assume WebGL is available in every viewer. The poster and useful explanatory
text must stand alone when 3D cannot initialize.

## Conversion record

Record original format and units, orientation, tessellation settings, part/group
mapping, simplified triangle count, materials omitted, renderer version and selected
export camera. Preserve scale bars and annotations. Show key views for PDF/PPTX;
do not silently export a blank canvas or controls alone.

External iframes and web demos require explicit permission and a network disclosure.
Treat them as untrusted content, use a sandbox with minimum permissions and a static
fallback. A public OSS skill should not embed accounts, tokens, analytics or private
URLs. See `security-rights.md`.
