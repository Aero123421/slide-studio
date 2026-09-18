# Color with stable meaning

Name roles before choosing swatches: paper, primary text, secondary text, accent,
comparison series, annotation, warning and positive/negative change. A new color
should carry a role or a deliberate artistic reason, not merely add variety.

Start with a neutral field and a small number of meaningful colors, or a deliberately
expressive palette when the brief warrants it. A dark scientific slide and a warm
editorial slide can both be excellent. Never “improve” a supplied white brand to
cream without permission. Preserve identity and source evidence.

Use the `contrast()` helper for opaque pairs. It returns a numerical ratio, not a
full accessibility certification. For ordinary web text, the relevant WCAG AA
contrast thresholds are 4.5:1, or 3:1 for qualifying large text; verify the current
W3C source and the actual size/weight/context. Projection may need more contrast
than a compliance minimum. Blends, transparency and image backgrounds require
sampling the actual rendered result, not only token values.

## Data color

Use categorical colors for categories, sequential luminance for ordered magnitude,
and a meaningful diverging scale around a stated reference. Do not imply order with
arbitrary hue. Do not use a rainbow to encode precise magnitude by default. Labels,
position, shapes or line patterns must carry meaning too; avoid red-versus-green as
the sole distinction. Keep colors consistent across the deck and every state.

A selected datum can gain emphasis without making the rest unreadable. Uncertainty
bands should remain visible in print and when overlapping. Avoid semitransparent
fills that accidentally suggest additional categories. Legends need labels and units;
direct labels often reduce lookup effort.

## Gradients and patterned surfaces

Gradients are allowed where they create a deliberate field, lighting or spatial
hierarchy. They do not automatically make a slide modern. Avoid placing small text
across widely varying luminance. Patterns need scale discipline: fine lines can
alias on projectors and exports. Inspect at actual target dimensions.

`assets/design-systems.json` includes editable starting palettes. Any palette may be
changed. Run real contrast checks after changes and review data semantics separately.
