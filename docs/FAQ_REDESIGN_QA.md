# Landing FAQ verification

The latest requested change removes the full-answer accordion below the three summary cards. Its state, keyboard handlers, measurement observers, animation styles, and reserved whitespace have been removed. The heading, cards, and Export a backup link remain unchanged.

FAQPage JSON-LD was removed because the full answers are no longer visible on the page. The typed source retains the supplied wording for future reuse.

Validation passed: TypeScript, ESLint, and all five updated FAQ tests. Tests cover preserved wording, card order, absence of accordion panels and reserved space, backup navigation, light/dark token contrast, and axe structural accessibility. jsdom does not render layout; axe color contrast is disabled and token contrast is tested separately.

Actual browser visual verification remains unavailable: the preview tool's separate security gate rejected access despite user approval during the preceding redesign.
