# Images, illustration and geometric texture

## Choose a visual for a job

An image may be evidence, the subject being explained, context, a spatial reference,
a metaphor, atmosphere or a visual pause. Name its role. Use actual supplied product
or experiment images when making claims about those artifacts. Do not imply that a
stock photo documents a user's product, team, facility or result.

Use local, approved media when available. Obtain rights before redistributing external
media. Record original source, author, license, modifications and alternative text.
No image-generation service is required by this skill. When image generation is
explicitly prohibited, use code-native vector work or legitimate existing assets,
not a generated concept image in disguise.

## Placement modes and their trade-offs

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
testable; see [rendered integrity](rendered-integrity.md). Recognition still requires
viewing the original. A narrower frame is not automatically a better composition.

## Text over images

Inspect the actual pixels beneath each line. A generic dark overlay is not a guarantee.
Move text to genuine negative space, use a separate field, or add a localized scrim
when appropriate. Avoid washing a photograph uniformly merely to force a headline.
White text over bright clouds is still illegible inside an elegant composition.

## Integrity of scientific images

Preserve orientation, scale bars, acquisition conditions and relevant surroundings.
Declare crop, color mapping, normalization or contrast adjustments. Do not apply
“beautifying” effects to measurement imagery. Compare panels under equivalent
transformations. Decorative duotone is acceptable for clearly non-evidentiary artwork,
not for changing the apparent strength of a result.

## Illustrations and patterns

Illustration should expose a mechanism, not act as generic clip art. Choose a coherent
line/fill vocabulary; use labels on real parts. Simplify incidental detail while
retaining the relationships needed for the claim. Editable SVG is preferred for
schematics because geometry and semantics can be inspected.

Geometric motifs can establish rhythm, partition sections or create visual identity.
Use clipping and containment so they do not obscure essential content. Keep density
and contrast below the focal subject unless the pattern is the subject itself.
A dot grid is not a data plot; label schematic encodings as such.

## Performance and packaging

Resize raster media to an appropriate effective resolution after selecting the crop.
Use PNG for transparency or sharp screenshots where appropriate, JPEG/WebP for
photographic imagery after checking artifacts. Keep originals outside disposable QA.
The built-in placeholder syntax embeds local media up to 16 MiB per asset; large
video should be an explicit local asset bundle, not megabytes pasted into model context.
Do not ship font files or unrelated photographs with the deck.
