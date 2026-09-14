# Design System

The art direction for the public site. Read this before adding or changing any
marketing UI, so the site stays one coherent thing rather than a pile of
individually reasonable screens.

Everything below is implemented in `src/app/globals.css`. That file is the source
of truth; this document explains the intent behind it.

## The idea

Billboard.me sells *physical* advertising surfaces, so the site borrows the visual
language of the physical advertising trade: media kits, printers' spec sheets and
out-of-home rate cards.

That shows up as warm paper stock rather than screen white, an industrial ink
black, one signage-red accent, registration marks and dimension callouts, and
monospaced annotation labels sitting next to very large display type.

Consequences of committing to that idea:

- **Sharp corners.** Buttons, cards, panels and sections all use `border-radius: 0`.
  Rounding is reserved for the drawn objects inside the asset plates.
- **Hairline rules instead of boxes.** Sections and form fields are separated by
  1px rules, the way a printed page is.
- **Light only.** `color-scheme: light`. This is a deliberately art-directed
  surface, not an app, so there is no dark theme — contrast comes from the ink
  sections inside the page instead. Do not add a theme toggle here.

## Colour

Warm-biased neutrals throughout. No zero-chroma greys — they read as dead.

| Token | Value | Use |
| --- | --- | --- |
| `--color-paper` | `#f3efe7` | Default background |
| `--color-paper-deep` | `#e9e3d6` | Alternating section background |
| `--color-paper-edge` | `#dcd4c3` | Panel borders on paper-deep |
| `--color-ink` | `#17140f` | Text, dark sections, primary buttons |
| `--color-ink-soft` | `#4a453b` | Body copy |
| `--color-ink-faint` | `#7d7464` | Spec labels, placeholders |
| `--color-rule` | `#d5cdbd` | Hairlines on paper |
| `--color-vermilion` | `#d9402a` | Accent: marks, focus, spot outlines |
| `--color-vermilion-deep` | `#b32d19` | Accent **for small text** (AA on paper) |
| `--color-flare` | `#f26b4e` | Accent for text **on ink** (AA on ink) |
| `--color-chalk` | `#ede7da` | Text on ink |
| `--color-chalk-muted` | `#a79f8f` | Secondary text on ink |
| `--color-rule-dark` | `#3a3429` | Hairlines on ink |

**Contrast rule of thumb.** Plain `--color-vermilion` only reaches ~3.9:1 on
paper, which is fine for large display type, icons and borders but fails AA for
body-sized text. Use `--color-vermilion-deep` (5.5:1) for anything small on
paper, and `--color-flare` (6.1:1) for anything small on ink.

Roughly 60% paper / 30% ink-and-paper-deep / 10% vermilion. The accent is used
sparingly on purpose: it stops being an accent if it is everywhere.

## Type

Two families, three roles.

- **Bricolage Grotesque** (`--font-display`, also `--font-sans`) — headlines and
  body. Loaded variable with the `opsz` and `wdth` axes. Chosen for its ink traps
  and slightly odd proportions; it does not look like a default.
- **IBM Plex Mono** (`--font-mono`, weights 400/600) — every small label, eyebrow,
  button, stat and annotation. This carries most of the "spec sheet" feeling.

Weight contrast is deliberately extreme: display type is `font-extrabold` (800),
body is 400. Timid 400-vs-600 contrast is the giveaway of an undesigned page.

Fluid sizes, all with their own line-height and tracking:

| Token | Range | Use |
| --- | --- | --- |
| `text-display` | 2.625 → 6rem | Hero H1 only |
| `text-headline` | 2.125 → 4rem | Section H2 |
| `text-title` | 1.375 → 2rem | Card and step H3 |
| `text-lead` | 1.0625 → 1.3125rem | Intro paragraph under a heading |
| `text-spec` | 0.6875rem | The `.spec` mono label |

`.spec` is the workhorse: mono, uppercase, `0.18em` tracking. Reach for it before
inventing another small-text style.

## Motion

All CSS. No animation library — see ADR-002.

- `--ease-out-expo` `cubic-bezier(0.16, 1, 0.3, 1)` for entrances.
- `--ease-out-quart` `cubic-bezier(0.25, 1, 0.5, 1)` for hover and press.
- Entrances and the ticker animate `transform` and `opacity`. Controls also
  transition colors, borders and shadows; `globals.css` records actual behavior.

Three mechanisms:

1. **`.rise`** — page-load entrance. Stagger it by setting `--delay` inline, e.g.
   `style={{ "--delay": "140ms" }}`. Used for the hero only; one well-orchestrated
   load beats scattered micro-animations.
2. **`[data-reveal]`** — scroll entrance. Add the attribute to any element;
   `components/marketing/scroll-reveal.tsx` is mounted once in the marketing
   layout and observes them all, so pages stay server components. Stagger with the
   same `--delay` custom property.
3. **`.marquee-track`** — the surface ticker. Linear easing is correct here; a
   continuously scrolling strip must not accelerate.

**`prefers-reduced-motion: reduce` disables all of it**, including the marquee and
button lifts, and the `ScrollReveal` component marks everything visible
immediately instead of observing. A `<noscript>` block in the marketing layout
also forces `[data-reveal]` visible, so content is never hidden behind JS.

## Components

- `.btn` + `.btn-primary` / `.btn-ghost` / `.btn-invert` (`invert` is for use on
  ink backgrounds). Lift 2px on hover, settle to `scale(0.985)` on press.
- `.control` — the ruled form input. Borderless except for a bottom rule.
  Focus turns the rule vermilion and tints the field; it deliberately does *not*
  draw the global focus box, which would make the form look like a widget stack.
  The override lives **unlayered** next to the global `:focus-visible` rule,
  because `@layer components` always loses to unlayered CSS in the cascade
  regardless of specificity.
- `.mark` — the vermilion rule that wipes in under a hero word.
- `.link-draw` — underline that draws in from the left on hover and focus.

## Asset plates

`src/components/marketing/asset-plates.tsx` draws the MacBook and jersey as
annotated technical drawings, with the sponsorable area marked as a dashed
vermilion "spot".

Per AGENTS.md §5 this renderer is isolated and coordinate-driven: `MACBOOK_PLATE`
and `JERSEY_PLATE` hold the viewBox and the spot rectangles, and the components
only draw what those objects describe. It can be replaced with a richer renderer
later without touching any page. It is marketing illustration only — it is not
connected to real assets, surfaces or listings, none of which exist yet.

Each plate takes `tone="light" | "dark"` so it works on both paper and ink.

## Things to keep avoiding

The site should not drift toward the generic. Concretely: no purple or
blue-to-purple gradients, no aurora/mesh backgrounds, no uniformly rounded cards,
no evenly-sized three-card grids, no zero-chroma greys, and no invented logos,
testimonials or metrics while the numbers are not real.

## Proposed application extension

The [master PRD](../product/prd.md) defines future seller forms and sponsorship
pages. Reuse this identity with readable mobile terms, visible keyboard focus,
accessible text alternatives to SVG selection and explicit availability. A
premium page must help a buyer understand seller, spot, period, deliverables,
price and next step. Additional motion or a shadcn install is justified only by
an implemented interaction.

The current plates are marketing illustrations. Their coordinate-derived MM
labels are not validated print sizes; [template architecture](../architecture/assets-and-surfaces.md)
separates canonical geometry from measured production dimensions. Future brand
artwork is reviewed media, not executable seller-supplied SVG. Real trust signals
need explicit provenance and consent; no fake listings, proof or rating stars.
