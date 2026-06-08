# Design QA

## Scope

- Target: homepage hero
- Desktop viewport: 1512 x 900
- Mobile viewport: 390 x 844
- Reference: `/Users/takna/Downloads/_Screenshot/Screenshot_2026-06-08_14-32-42.png`
- Character source: `/Users/takna/Downloads/hermes girl.jpg`
- Implementation capture: `/tmp/hermes-design-qa/implementation-full.png`
- Side-by-side comparison: `/tmp/hermes-design-qa/hero-comparison.png`

## Visual Review

- The electric-blue and white palette follows the supplied Hermes Agent reference.
- The left editorial headline and right character panel create a clear reading order.
- The character uses the supplied image as white line art rather than decorative CSS.
- Buttons remain visually distinct in both light and dark themes.
- Desktop content does not overlap the character panel.
- Mobile content uses intentional word-level line breaks and has no horizontal overflow.

## Usability Review

- The page retains one `h1`, followed by the existing `h2` and `h3` hierarchy.
- Both primary actions retain their original destinations.
- The character image has descriptive alternative text.
- Focus outlines, reduced-motion behavior, search, navigation, and theme controls remain available through Starlight.

## Findings

- P0: none
- P1: none
- P2: none

---

## Homepage Directory Grid

### Evidence

- Source visual truth: `/tmp/hermes-directory-qa/before-1512.png`
- Implementation screenshot: `/tmp/hermes-directory-qa/after-1512.png`
- Full-view comparison: `/tmp/hermes-directory-qa/comparison-1512.png`
- Viewport: 1512 x 900
- State: dark theme, homepage scrolled to `#目的から探す`
- Responsive checks: 768 x 900 and 390 x 844
- Focused comparison: not required because both directory sections fill the captured viewport and
  their headings, links, spacing, and column boundaries are directly readable.

### Fidelity Review

- Fonts and typography: existing Starlight font families, weights, heading hierarchy, and link
  styles are unchanged.
- Spacing and layout rhythm: the two directory sections align at the same top edge and share equal
  height at tablet and desktop widths. Mobile returns to a single column without extra top margin.
- Colors and visual tokens: panels use the existing navigation background and hairline tokens in
  both themes.
- Image quality and asset fidelity: this change does not add or alter imagery.
- Copy and content: all headings, 25 destination links, ordering, and heading anchors remain intact.

### Patches Since Previous QA

- Added a homepage-only Markdown AST wrapper for the two directory sections.
- Added a two-column layout from 768px and a single-column mobile fallback.
- Added responsive list columns where space permits.
- Added transformation tests for homepage and non-homepage documents.

### Findings

- P0: none
- P1: none
- P2: none

---

## Header Version Badge

### Evidence

- Source visual truth: `/tmp/hermes-header-qa/before-header.png`
- Implementation screenshot: `/tmp/hermes-header-qa/desktop-dark.png`
- Full-view comparison: `/tmp/hermes-header-qa/header-comparison.png`
- Focused region comparison: the comparison image contains the complete 1512 x 64 header before
  and after the change.
- Viewports: 1512 x 900, 1024 x 844, and 390 x 844
- States: desktop dark, tablet light, and mobile dark

### Fidelity Review

- Fonts and typography: the badge uses the existing monospace UI font while preserving the site
  title's weight and hierarchy.
- Spacing and layout rhythm: the badge sits between the site title and search without shifting the
  right-side controls. At 390px, the site title shortens to `Hermes` and the badge remains visible.
- Colors and visual tokens: border, background, text, hover, and focus colors use Starlight theme
  tokens and remain legible in light and dark themes.
- Image quality and asset fidelity: this change does not add or alter imagery.
- Copy and content: `対応 v0.16.0` is sourced from the version evidence entry and links to its
  supporting documentation.

### Patches Since Previous QA

- Added a custom Starlight site-title component with a responsive version badge.
- Added an accessible label explaining the version and link destination.
- Added compact mobile title rendering without hiding the version.

### Findings

- P0: none
- P1: none
- P2: none

final result: passed
