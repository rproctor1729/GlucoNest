# GlucoNest release test plan

This plan covers everything that could not be verified in the cloud sandbox (the npm registry was unreachable there). Run it on a laptop before each deploy.

## Open PRs to verify

| PR | Branch | What it changes |
|---|---|---|
| #12 | `perf/web-performance` | WebP guide images, skeleton loaders, lazy hero slides, image cache headers, removed unused dependencies |
| #13 | `legal/checklist-and-team-consent` | Team entries set to `consent: false` (About team hidden), `docs/LEGAL_CHECKLIST.md`, this plan |

Merge order: #13 then #12. Both are based on `main`. After merging #12, its lockfile change needs one `npm install` check (see step 2).

## Prompt to run on your laptop (Claude Code)

Paste the block below into Claude Code in an empty folder on your laptop. It is self-contained.

```
You are verifying the GlucoNest release on my laptop. Repository: rproctor1729/GlucoNest (default branch main). Node 20 or later is required.

Rules:
- Do not force-push, delete branches, or rewrite history.
- Do not merge PRs. Report results and wait for me.
- Do not add dependencies. If npm install changes package-lock.json, stop and report the diff.
- Put any temporary scripts in a scratch folder outside the repo.
- If a step fails, stop, record the exact error, and continue with the steps that do not depend on it.

1. Clone or update the repo. Check out each branch in turn and run steps 2 to 7 on each:
   a. main
   b. perf/web-performance (PR #12)
   c. legal/checklist-and-team-consent (PR #13)

2. Install from the lockfile: `npm ci`. Then run `git status --short`. Expect no changes to package-lock.json. Record the result.

3. Static checks: `npm run typecheck`, `npm run lint`. Record errors with file and line.

4. Unit and component tests: `npm test`. Expect every test file to pass. Record the pass and fail counts and the names of any failing files.

5. Production build: `npm run build`. Record the route list and any warnings. Confirm the build finishes without errors.

6. Start the production server: `npm start` (port 3000). In a second terminal, fetch the headers:
   `curl -sI http://localhost:3000/ | grep -iE "content-security-policy|x-frame|referrer|permissions"`
   `curl -sI http://localhost:3000/images/guides/storage.webp | grep -i cache-control` (expect max-age=604800).
   Record the results.

7. Throttled browser test. Install the browser if needed (`npx playwright install chromium`). Write a Playwright script in the scratch folder that:
   - opens http://localhost:3000/ and http://localhost:3000/#my-day, each with a mobile viewport of 375x812 and deviceScaleFactor 2
   - applies CDP network throttling: Slow 4G (download 1.6 Mbps, upload 750 kbps, latency 150 ms)
   - applies CDP CPU throttling at 4x
   - records performance timing: first contentful paint, largest contentful paint, time to interactive (or DOMContentLoaded), and total transfer bytes of images
   - confirms no horizontal scroll (document.documentElement.scrollWidth <= window.innerWidth)
   - confirms no console errors
   - clicks each navigation item in the sidebar or bottom bar and confirms the section heading appears within 5 seconds
   - opens the Hypo SOS modal, checks the timer starts after choosing a carb option, and closes it with Escape
   - repeats the page load with reduced motion enabled and confirms the skeleton does not animate infinitely
   Run it and report the numbers in a table.

8. Accessibility: run axe-core against each main section in light and dark mode at 375, 768 and 1280 px. Report every serious or critical violation with its selector.

9. Dependency audit: `npm audit --omit=dev`. Report high and critical findings.

10. Final report, in this order:
   - a table: branch, install, typecheck, lint, tests (pass/fail), build, headers, throttled test numbers, axe results
   - any failures with exact error text
   - anything that could not be checked and why
   - the single most important next action

Do not claim a step passed unless you ran it and saw the result.
```

## Manual checks on a phone (after deploy)

Use a real Android phone and a real iPhone if you have one. Use Chrome on Android and Safari on iPhone.

**Load and network**
- [ ] Open the site on mobile data, then on a throttled connection (Chrome: DevTools is not available on phones, so use a laptop Chrome with Slow 4G, or Android's developer options to limit bandwidth).
- [ ] The skeleton appears before each section and is replaced by content. Nothing jumps.
- [ ] Turn on airplane mode after the first load: the app still opens, and the home page loads.

**Layout**
- [ ] No horizontal scrolling at portrait and landscape.
- [ ] The Hypo SOS button is reachable with one thumb.
- [ ] Text is readable at the phone's largest system font size.

**Core flows**
- [ ] Add a manual reading, then a meal, then an insulin entry. Reload the page: all three remain. Delete one: it stays deleted after reload.
- [ ] Sample data is labelled as sample and does not mix into your real history.
- [ ] Export a backup, clear site data, import the backup: records return.
- [ ] Import a CSV with a few rows, including one bad row: the bad row is reported, the others import.
- [ ] Connect to a Nightscout test instance (or check the error message for a wrong URL and an `http://` remote URL).
- [ ] Open the Doctor report: the printed or saved version has no sample data mixed with real data.

**Safety**
- [ ] Hypo SOS: the timer runs, the chime plays with the phone unmuted (note whether it works with the screen locked; it often will not).
- [ ] Reminders: set one for two minutes; note whether it fires with the app open and with the phone locked (expected: open only).

**Legal and content**
- [ ] The About page shows no team members (until consent is recorded).
- [ ] Privacy, terms and contact text appear on the Legal page.
- [ ] The footer disclaimer is visible on every page.
- [ ] Feedback form: anonymous by default; no data is sent anywhere (check the network tab on a laptop).

**Accessibility**
- [ ] VoiceOver (iPhone) or TalkBack (Android) reads the Hypo SOS dialog, the food dialog and the navigation in order.
- [ ] Turn on "Reduce motion" in phone settings: animations stop, and nothing flashes.
- [ ] Dark mode: all text is readable.

**Browsers**
- [ ] Chrome and Safari on phone, Edge on desktop, and Firefox on desktop.
- [ ] Install to home screen (Android and iPhone) and open offline.

## Not yet tested (be honest about these)

- Real slow-network results (step 7 simulates them; a real phone on weak network is still the truth).
- Screen reader behaviour on real devices.
- Legal review by a lawyer and clinical review by a clinician (see `docs/LEGAL_CHECKLIST.md`).
- Behaviour of the Nightscout integration against a real Nightscout instance (only the error handling has been checked).
- Printing the doctor report on paper.
