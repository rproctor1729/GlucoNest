# Landing feature cards

## Implementation

The three titles and descriptions are preserved verbatim in `src/data/features.ts`. Each entry is one native anchor, labelled by its title, with a visible arrow and focus outline. Hash destinations reuse the existing navigation system; modified clicks retain browser behavior. There are no nested interactive controls or numeric card labels.

Each preview has its own component and an asynchronous state loader. The initial server/client render is the same loading state; local storage is read only after mounting. Failed storage access or malformed records show the error state rather than silently presenting sample readings as personal data.

The dashboard reads the existing manual-reading and meal keys, validates records with existing validators, filters to the current local calendar day, excludes future/sample records, and sorts readings chronologically. The sparkline and latest/average values come from those records. If neither readings nor meals exist today, it uses the existing dashboard sample sources and explicitly labels the preview Sample. Sample meals are labelled as belonging to the sample day. Personal meals without readings leave an explicit empty glucose state. The chart has a nonvisual list of the underlying readings.

The article preview uses the first non-emergency guide in existing reading-room order. Food names, portion, carbohydrates, protein, fibre, and multilingual chips come from the food library. Chips are descriptive text, not controls inside the link.

The food hero keeps the existing meal image and caption. A 1254×1254 WebP source (355,570 bytes versus the original 3,072,191-byte PNG) feeds Next Image. Explicit dimensions, responsive sizes/srcset, lazy loading, desktop side-by-side layout, and mobile top-image layout are defined. Next Image supports negotiated AVIF/WebP output.

The carbohydrate disclaimer is defined once in `src/data/disclaimers.ts`, rendered directly beneath the food preview, and reused in the dosing FAQ card. Its size is 14px at the default root size. Original full FAQ answers were not rewritten or reinstated.

## Assumptions and limits

- Guides have no publication timestamps, so no reliable latest-by-date selection is possible. The preview is labelled From the guides and follows the existing editorial order.
- Nightscout readings exist in memory only; the landing preview reads saved manual readings and meals as requested. No credentials or remote readings are newly persisted.
- No logs today triggers the labelled sample day even if older personal logs exist. Personal and sample records are never blended.
- Saved glucose values are normalized to mg/dL; the preview explicitly displays that unit.
- At widths below 768px, cards stack and the food image appears above its content. At 768px and above, the first two entries share a row and food remains full width. Text and language chips wrap without fixed text heights.
- Preview access was previously rejected by the browser tool's separate security gate despite user approval. Actual visual layout at 360/768/1280px, live keyboard traversal, rendered contrast, and image negotiation remain unverified in-browser.

## Automated coverage

Tests cover every preview's populated/loading/empty/error states; malformed/blocked storage; today/future/demo filtering; sorting; labelled sample fallback; missing glucose without invented values; empty guide/food sources; flat/single-value graph geometry; verbatim titles/descriptions; destinations; one-link structure; native focus order; modified clicks; image dimensions/srcset/lazy loading; shared disclaimer; and stable server rendering.

Color-token calculations check normal text and accents against both feature surfaces at WCAG AA 4.5:1 in light/dark themes. Axe checks structural WCAG A/AA rules on the populated feature links. Its contrast rule is disabled in jsdom, which does not provide rendered layout; separate token calculations do not substitute for a browser visual audit.

No dependencies were added. Existing Next Image, Lucide, CSS modules, Node tests, jsdom, and axe-core are used.

Validation: all 72 repository tests passed, including 15 feature tests. ESLint and the optimized production build (type validation and static page generation included) passed.
