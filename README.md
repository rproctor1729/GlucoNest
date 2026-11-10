# Saathweft

Saathweft is a browser-based Type-1 diabetes companion prototype. It is an educational and self-tracking tool, not a medical device, alarm, or substitute for clinical care.

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
- Create a 14-, 30-, or 90-day reading summary in Doctor report and use the browser's print dialog to save it as PDF. The report uses the saved target range and available, dated readings from the active personal data source.
- There is no cross-device caregiver-sharing feature. Health data is not placed in shareable URLs.

The interface currently provides language selection and translations for key navigation, onboarding, and dashboard labels in English, Hindi, Tamil, Kannada, and Telugu; some detailed sections remain in English.

## Hosting and privacy

The app stores user-entered records in browser local storage. Browser storage is unencrypted and can be cleared by the user or browser. JSON backups may contain sensitive health information; keep them private. Nightscout readings and credentials are only held in memory and are not included in backups. The service worker caches the app shell and static assets for offline access; it does not cache API responses.

The `public/_headers` file provides security headers for static hosting providers that support the Cloudflare Pages `_headers` convention. Next.js deployments also receive matching response headers from `next.config.mjs`. Review the CSP if adding a new external integration. The current policy allows HTTPS connections to user-selected Nightscout hosts.

Offline mode is not a real-time glucose monitor. Emergency response should use the user's existing CGM alerts and care plan.

## Interface and navigation

The root page introduces Saathweft; the daily workspace starts at `/#my-day`. Each tool has a shareable section hash, including `/#quick-log`, `/#food-library`, `/#insights`, and `/#devices`. Browser back/forward restores the selected section. The T1D Knowledge Hub at `/#knowledge-hub` includes searchable lessons and practical guides with shareable topic, category and guide links. The former `/#learn-community` address opens the Hub.

The responsive workspace uses persistent desktop navigation and mobile quick navigation. Tool bundles load on demand. The T1D Knowledge Hub at `/#knowledge-hub` includes searchable lessons and practical guides with shareable topic, category and guide links. The former `/#learn-community` address opens the Hub. Dialogs support keyboard focus containment and restore focus to their trigger; dismissible dialogs support Escape. Reduced-motion preferences are respected.

Photography is bundled locally under `public/images`; source references are in `public/images/SOURCES.md`. No remote photo requests are needed at runtime. The home carousel uses real diabetes-care photography. Its separate unicorn reading is explicitly labelled as illustrative.

## Release checks

Run the validation commands above before deployment, then serve with `npm start`. Development uses `.next-dev`; production builds and `npm start` use `.next`, so a production build cannot replace a running development server's bundles. Service-worker registration is enabled only in production. Development automatically unregisters an existing GlucoNest worker, clears only GlucoNest shell caches, and reloads once if the page was controlled by that worker. This preserves local health records and preferences. Serve over HTTPS for offline support and review browser-storage, Nightscout CORS, and notification behavior on the deployment host. The app remains a local self-tracking tool; a successful build does not establish clinical or regulatory validation.

For a second development preview, use a separate output directory so it cannot invalidate the primary server's chunks:

```powershell
$env:GLUCONEST_PREVIEW = '1'
npm run dev -- --port 3003
```

The preview uses `.next-preview`; the main development server uses `.next-dev`. Do not start two development servers against the same output directory. If a running page references a missing chunk after a server restart or deployment, its error boundary offers **Reload app**, which fetches a new runtime while preserving the current section hash and local records.


## Hero carousel

The home-page carousel adapts the supplied React Bits Carousel with its spring-based tilt transition and momentum drag handling. It keeps the local real-photography slides, uses responsive portrait sizing on mobile, and supports autoplay, keyboard navigation, pause/play, and reduced motion. Existing Lucide icons replace the reference's separate icon dependencies.

React Bits attribution and the applicable license are retained in [licenses/react-bits.txt](licenses/react-bits.txt). The carousel is integrated as part of this application.

## Recent correctness updates

- Time in range counts each reading once when readings are too far apart for time-weighted estimation.
- The current reading is selected by timestamp rather than array position.
- Sample meals and insulin entries are hidden when personal entries exist, without changing saved data.
- The optional hypo-timer chime resumes its audio context when possible, closes it after playback, and stops when the modal closes.
