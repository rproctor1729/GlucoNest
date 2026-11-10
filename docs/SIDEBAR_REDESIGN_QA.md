# Workspace sidebar

The sidebar is a React/Tailwind component with adjustable CSS variables in `src/app/globals.css`. It stays on a solid #0F1412 surface in either page theme. Widths are 248px expanded and 64px collapsed; the header, main content, warnings, and footer follow the selected width. The existing mobile breakpoint remains 900px.

## Navigation and behavior

- Existing hash destinations and translated labels are preserved. Main order: My Day, My Insights, Food Library, Learn & Guides, Doctor report. Bottom order: Devices & Data Sources, Feedback, About GlucoNest.
- One Log button opens the existing Quick Log route, which supports meals, glucose, insulin, and activity. Duplicate Add a moment entry points and their now-unused modal were retired. Quick Log's existing data and confirmation behavior remain intact.
- The monochrome 28px brand links home. The sidebar has no breadcrumb, tagline card, home-return row, or section headers. The desktop header keeps its existing page breadcrumb and no longer duplicates the brand.
- The rail keeps accessible names and provides tooltips on hover/focus. Collapse and expand controls are keyboard accessible. Collapse state lasts for the current page session and is not persisted.
- The pinned profile row uses Your space rather than inventing a user name. Its popover exposes working language, theme, unit, and Privacy & terms controls. It closes on Escape, focus leaving, or outside pointer activation; Escape restores trigger focus.
- The Devices attention badge appears only on a real connection error or local-data error. Demo/disconnected mode does not manufacture a warning.
- Mobile uses a labelled modal drawer with focus containment, Escape dismissal, scroll locking, and focus restoration. A flat scrim covers the page. Switching to desktop closes the drawer. The mobile bottom bar retains a Log entry when the drawer is closed.
- Print output hides navigation and releases the content margin for doctor reports.

## Visual rules

Muted white text/icons, neutral hover and active backgrounds, one sage accent, a 2px active indicator, 14px/500 navigation text, 18px/1.5px Lucide icons, 36px item height, 8px horizontal padding, 2px item gaps, and 24px group separation are explicit. Only color/background transitions run at 120ms; reduced-motion disables them. Text/primary token contrast is checked mathematically and focus contrast exceeds 3:1.

## Checks and limitations

Sidebar tests cover route/label order, one Log action, modified clicks, collapse controls, rail names/tooltips, real error badges, preferences, Escape/outside dismissal, mobile focus containment/restoration, token contrast, and axe structural checks for expanded, collapsed, and profile-open states.

The existing browser preview security rejection remains unresolved. Actual browser layout, screen-reader behavior, and visual rendering at mobile/desktop sizes have not been verified. jsdom's layout is simulated for focus tests, and axe contrast is disabled there; token calculations are separate.

No dependencies or routes were added. The existing English label spellings/capitalization were retained, including Doctor report and About GlucoNest.

Validation: all 79 repository tests, ESLint, and the optimized production build passed. Seven tests specifically cover the sidebar. The mobile initial-focus helper now includes links as well as buttons and form fields.
