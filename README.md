# GlucoNest

GlucoNest is a browser-based Type-1 diabetes companion prototype. It is an educational and self-tracking tool, not a medical device, alarm, or substitute for clinical care.

## Local development

1. Use Node.js 20 or later.
2. Run `npm ci`.
3. Optionally copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_FEEDBACK_EMAIL` to a public feedback contact address.
4. Run `npm run dev`.

The optional feedback email is public browser configuration; do not put secrets in `NEXT_PUBLIC_*` variables.

## Validation

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

The GitHub Actions workflow runs the same checks for pull requests and pushes to the main branch.

## Personal data tools

- Import CSV readings from the Devices & Data Sources section. Files must include a recognizable timestamp (or date) and glucose/value column; optional units may be `mg/dL` or `mmol/L`. CSV data is parsed locally and invalid rows are reported before import.
- Create a 14-, 30-, or 90-day reading summary in My Insights and use the browser's print dialog to save it as PDF. The report uses only available, dated readings from the active personal data source.
- Optional check-in and sensor-change reminders run only while the app remains open in the browser. Browser notifications require permission; reminders are not reliable alarms and never replace CGM alerts or a care plan.
- There is no cross-device caregiver-sharing feature. Health data is not placed in shareable URLs.

The interface currently provides language selection and translations for key navigation, onboarding, and dashboard labels in English, Hindi, Tamil, Kannada, and Telugu; some detailed sections remain in English.

## Hosting and privacy

The app stores user-entered records in browser local storage. Browser storage is unencrypted and can be cleared by the user or browser. JSON backups may contain sensitive health information; keep them private. Nightscout readings and credentials are only held in memory and are not included in backups. The service worker caches the app shell and static assets for offline access; it does not cache API responses.

The `public/_headers` file provides security headers for static hosting providers that support the Cloudflare Pages `_headers` convention. Next.js deployments also receive matching response headers from `next.config.mjs`. Review the CSP if adding a new external integration. The current policy allows HTTPS connections to user-selected Nightscout hosts.

Offline mode is not a real-time glucose monitor. Emergency response should use the user's existing CGM alerts and care plan.
