# GlucoNest application audit

Completed source review: 9 November 2026.

## Scope and verification limits

Reviewed all application sections, shared navigation, dialogs, styles, local-data flows, imports, exports, and report calculations. This is a source and automated-regression audit. Browser security review declined access to the local preview during this run, so live navigation, computed hover contrast, animations, screenshots, and responsive rendering were not visually verified. Source checks are not a substitute for those browser checks.

No live Nightscout credentials were used. Authentication, errors, retries, parsing, and cancellation are covered by controlled tests. A real instance's credentials, network availability, and CORS configuration remain instance-specific.

## Fixed findings

| Area | Finding | Resolution |
| --- | --- | --- |
| Dark-mode interactions | Some hover states applied light backgrounds or dark text without a matching dark-mode state. | Added explicit dark hover foregrounds/surfaces for Quick Log, Add a moment, Food Library, and landing navigation. Added dark SOS, image-label, select-option, empty-state, loading, and footer colors. |
| Visual consistency | Navy surfaces and teal controls differed from the newer evergreen editorial pages. Small interface headings inherited the display serif. | Aligned the brand palette and shared dark surfaces; kept display typography for page/editorial headings and body typography for interface headings. Preserved distinct glucose-status colors. |
| Form sizing | A global minimum input height also affected checkboxes and radio buttons. | Limited the minimum height to text/number/date inputs, selects, and textareas. |
| Navigation | The skip-to-content anchor could be interpreted as a route and return users to Home. Direct hash changes were not observed. Repeated navigation added redundant history entries. | Centralized valid sections, ignored document anchors, handled hash changes, and avoided duplicate history pushes. |
| Quick Log glucose records | Manual readings could be saved but were absent from the records list. | Added personal glucose readings to All Logs and a Glucose filter, with deletion through persisted local storage. |
| Entry dates | Initial dates used UTC while times used local time. Editing a record did not populate its original date/time. | Added shared local date/time parsing, refreshed dates for new records, and populated original local dates for edits. Invalid dates are rejected before ISO conversion. |
| Entry integrity | Manual glucose values could be outside the range accepted by CSV/CGM parsing and were assigned a fabricated flat trend. Editing meal totals could leave stale item details. Sample edits appeared editable but were not persisted. | Validated manual glucose values, omitted unsupported manual-reading trends, kept edited meal item details consistent, and removed sample-record edit controls. Personal meal and insulin records remain editable. |
| Activity presets | Running, cycling, gym, and yoga presets all recorded a walk. | Each preset now records its actual activity type and intensity. |
| Add a moment | Close timers could affect a later modal session, rapid taps could duplicate logs, failed saves disappeared quickly, and unspecified insulin brands were filled in automatically. | Cleaned up timers, guarded rapid repeat submissions, kept failed-save messages visible, and removed inferred brand names. Insulin confirmation remains in place. |
| Saved preferences | Initial effects could write default theme/text preferences before stored values finished loading, especially in development Strict Mode. | Added a preference-loading guard before persistence. |
| Local-data deletion | Failed storage writes could remove records from the visible list while they remained on disk. | Delete operations now persist before updating the visible collection. |
| Imported readings | Stored readings were assumed to already be chronological. | Sorted restored manual readings so the latest-reading display uses the latest timestamp. |
| Reports | Reports ignored saved target ranges, could show time percentages from sparse data, and used fixed thresholds in daily summaries. | Used the configured range throughout, excluded unusable/future/sample readings, and displayed insufficient-data states. |
| Report duplication | Insights contained a second print/report implementation alongside Doctor report. | Consolidated reporting in Doctor report. Preserved the exploratory time-of-day profile there. Insights links to the single report flow. |
| Report printing | Global print rules could hide report headings/footer and retain dark backgrounds or pale text. | Preserved document headings/footer and explicitly rendered reports with dark text on white paper. |
| Meal observations | A decrease could be displayed as an unsigned positive number. | Preserved the sign of observed changes; extracted the calculation for regression tests. |
| Today's summary | Daily calculation logic was duplicated and could include future/sample data. | Reused the shared summary utility with the saved target range and personal, nonfuture records. |
| Food Library | Every saved plate was assigned to lunch. A delayed redirect could interrupt subsequent navigation. Large introductory/safety blocks repeated existing explanations. | Added an explicit meal-type choice, replaced the redirect with a View in Quick Log action, distinguished save failures, and collapsed estimate information into one disclosure. |
| Excess copy | Several tools repeated their page title and had overlapping descriptions. | Removed redundant Food Library, Quick Log, Insights, and report headings; shortened explanatory text while retaining relevant estimate/data-source information. |
| Terminology | Report descriptions called time-weighted metrics a share of readings. | Updated the report and glossary wording to match the calculations. |

## Removed obsolete code

- `TodayCard.tsx`, superseded by the integrated My Day summary.
- `TargetRangeSettings.tsx` and `ReminderSettings.tsx`, already removed from the interface.
- `LocalReminderManager.tsx` and `lib/reminders.ts`; removed controls no longer leave unmanaged notifications running. Existing browser data is not erased.
- `mockInsights.ts` and unused pattern-selection context state.
- Unused `dateUtils.ts` and `unitConverter.ts`.
- Unused settings methods and duplicate report/print logic.

Enabled TypeScript's unused-local and unused-parameter checks. The regression suite also traverses local imports from every app entry point and rejects unreachable source modules.

## Link and asset checks

All declared tool hashes, referenced local images, manifest icons, and CSS-module class references pass automated checks. Document anchors are tested separately from tool routes. No external URL was replaced merely because a network timeout occurred.

External guide references that opened successfully during the audit:

- [FDA insulin storage](https://www.fda.gov/drugs/emergency-preparedness-drugs/information-regarding-insulin-storage-and-switching-between-products-emergency)
- [CDC managing sick days](https://www.cdc.gov/diabetes/living-with/managing-sick-days.html)
- [NIDDK continuous glucose monitoring](https://www.niddk.nih.gov/health-information/diabetes/overview/managing-diabetes/continuous-glucose-monitoring)
- [CDC traveling with diabetes](https://www.cdc.gov/diabetes/about/tips-for-traveling-with-diabetes.html)

[NIDDK Managing Diabetes](https://www.niddk.nih.gov/health-information/diabetes/overview/managing-diabetes) timed out twice in the link checker. It remains unverified, rather than confirmed broken.

## Automated verification

- `npm test`: 47 tests passed, including nine new application-audit regressions.
- `npm run typecheck` and `npm run lint`: passed.
- `npm run build`: passed; optimized production output generated successfully.
- TypeScript now checks unused locals and parameters as part of normal typechecking/builds.
- The audit regressions cover route hashes and document anchors, Indian local dates across UTC midnight, invalid dates, custom report ranges, sparse data, future/sample exclusions, negative meal observations, local assets, CSS-module references, dark hover counterparts, and module reachability.
- Existing tests continue to cover CSV parsing, backups, feedback exports/privacy, Nightscout requests and retries, chart-window bounds, glucose status, report summaries, and service-worker chunk caching.

Live browser QA remains outstanding because local-preview permission was declined. Do not interpret automated checks as a claim that every visual interaction was exercised in a browser.
