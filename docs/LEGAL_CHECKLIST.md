# GlucoNest legal and compliance checklist

Status key: **Done** (fixed in the repo) · **Decide** (needs your choice) · **Lawyer** (needs advice from a qualified lawyer or regulator) · **Clinician** (needs review by a qualified diabetes clinician) · **Check** (verify after deploy)

This checklist reduces risk. It is not legal advice and cannot guarantee that no one will raise a concern. Before public launch, get advice from a lawyer in your jurisdiction (India: data protection under the DPDP Act 2023, and medical device rules under CDSCO, if the app is used for health decisions).

## 1. Regulatory position (medical device boundary)

- [x] **Check** The app does not calculate insulin doses or recommend units. Keep it that way: never add a bolus, correction, or dose calculator. Doing so would likely make the app a medical device in many jurisdictions. (Current state: education on ICR and correction factor only.)
- [x] Footer and Legal page state it is educational self-tracking, not a medical device, and not a replacement for a care team.
- [x] Hypo SOS shows "Cannot swallow safely, seizure, or unconscious? Nothing by mouth… Call emergency services."
- [ ] **Lawyer** Confirm whether the app, as shared with friends and later publicly, needs any CDSCO or other registration. Get written advice before promoting it.
- [ ] **Clinician** Have a diabetes clinician review the hypo guidance (15 g rule, product examples, timings) and the knowledge hub before public release. Record the reviewer's name and date in the repo.

## 2. Privacy and data protection

- [x] **Check** No analytics, advertising, or tracking scripts. No cookies set by the app. Confirm after deploy in DevTools (Network and Application tabs).
- [x] Legal page explains: local storage, not encrypted, backups may contain health data, Nightscout data goes only to the host the user configures, service worker does not cache health data.
- [x] Feedback is anonymous by default. Name and contact are optional and only stored locally.
- [ ] **Decide** Set `NEXT_PUBLIC_FEEDBACK_EMAIL` to a monitored address. Without it, users have no contact route for privacy or safety questions (the "Email maintainer" button is hidden).
- [ ] **Decide** Add a "Delete all data on this device" control in Devices & Data. Today users can only clear browser storage themselves. A deletion control supports the right to erasure and user trust.
- [ ] **Lawyer** Under DPDP 2023 and similar laws, check obligations if any user is a child (under 18). Add an age notice (for example: "for adults or with a parent or guardian") and decide whether parental consent is needed.
- [ ] **Lawyer** If anyone in the EU or UK uses the app, check GDPR and UK GDPR notice requirements. The local-only design helps, but notices still apply.
- [ ] **Check** A Nightscout access token is a credential. The UI should advise using a read-only token. (Confirm the wording in the Devices section.)
- [ ] Write a short standalone privacy notice page if the Legal page becomes the public notice. Current text is a prototype summary.

## 3. People shown in the app

- [x] **Done (this PR)** The six team entries were marked `consent: true` while their stories were placeholders ("Add story here"), and one had the role "Hypo SOS advisor" with no evidence of that role. All entries are now `consent: false`, so the About team section is hidden. Nothing is published until each person consents in writing.
- [ ] **Decide** Before publishing any team member: written consent for name, photo, role, diagnosis note and story; the person writes or approves their own text; roles must be true (do not describe anyone as an advisor or clinician unless they are one, and they agree to the wording).
- [ ] **Decide** Photos of real people: only with written consent. Stock photos are used on the home page under the Unsplash and Pexels licences (see below); they must not imply endorsement.

## 4. Product names and endorsements

- [ ] **Decide** Brand names in the app: Glucon-D, Glucovita, Frooti, Real juice (hypo guide and one-tap log), Lantus, Tresiba, Novorapid, Humalog (insulin logging and mock data), Dexcom (a source citation). Using brand names for information is usually allowed, but it can look like endorsement. Safer option: generic terms (for example "glucose tablets", "fruit juice", "rapid-acting insulin"), with a note that examples are not endorsements. Recommended: switch hypo and one-tap log examples to generic wording.
- [ ] Trademark check for the name "GlucoNest" in India and your target markets before any public promotion.

## 5. Content accuracy and sources

- [x] Food library: each item has a source (IFCT, NIN Hyderabad, or Clinical T1D tables). It states values are general estimates, not laboratory-verified.
- [x] Carbohydrate estimates are labelled as not insulin dosing advice.
- [ ] **Clinician** Review all knowledge hub content (`src/data/knowledge/*.json`, `educationalContent.ts`) against current guidance (ADA, NICE, ISPAD, and Indian guidance). Record the review.
- [ ] **Check** Knowledge hub summaries must be written in your own words. Do not copy long passages from NICE, ADA or other copyrighted sources. NICE and some sources have their own reuse terms; check each.
- [ ] **Check** The "Sources" pages link to real, current documents. Re-check links on the day of launch.

## 6. Images and third-party code

- [x] `public/images/SOURCES.md` lists Unsplash and Pexels photos with licence links. Both licences allow commercial and non-commercial use without attribution, but credit is kept for courtesy.
- [x] AI-generated images are disclosed as generated in `SOURCES.md`.
- [x] The unicorn and 100 mg/dL graphic is labelled as an illustrative reading, not a target.
- [ ] **Decide** Add a visible credits page (or link from the About page) listing photo sources and the React Bits attribution.
- [ ] **Lawyer** React Bits components are under "MIT + Commons Clause". The Commons Clause prohibits selling the software or offering a product whose value comes substantially from it. This is fine for a free, non-commercial app. Do not monetise the app without checking this licence. Keep `licenses/react-bits.txt` with the code.
- [ ] Run `npm audit --omit=dev` on the laptop and fix high or critical findings before launch.

## 7. Project licence and terms

- [ ] **Decide** The repository has no `LICENSE` file, so the code is all rights reserved by default. Pick a licence (for example MIT, or a non-commercial licence if you want to prevent commercial reuse) and add `LICENSE` plus a `license` field in `package.json`. Note that React Bits requires its own terms to be kept.
- [x] Terms and safety section: educational, not a medical device, no guarantee, emergency guidance.
- [ ] **Lawyer** Add a short terms of use: no warranty, limitation of liability, user responsibility for their own care decisions, acceptable use, and how to report a problem.

## 8. Security (legal exposure from data leaks)

- [x] Next.js build cache containing an encryption key was in an old commit (`e214bc3`). It is no longer on any current branch. **Still to do:** rotate the key by redeploying a fresh build, and decide whether to purge history (force-push required).
- [ ] **Decide** Replace `script-src 'unsafe-inline'` with a nonce-based CSP, and remove the unused `public/_headers` copy of the policy.
- [x] Nightscout is HTTPS-only except for localhost. Tokens are kept in memory only.

## 9. Accessibility (legal in India under RPwD guidelines and in the US under ADA guidance)

- [ ] **Check** Run axe-core (already in devDependencies) on every section in light and dark mode, at 375, 768 and 1280 px, with reduced motion on. Fix any serious or critical findings.
- [ ] **Check** Keyboard-only and screen-reader pass (VoiceOver on iPhone, TalkBack on Android) for the Hypo SOS modal, food dialog, and the team story dialog.

## 10. Deployment checks (after going live)

- [ ] **Check** Live site uses HTTPS. Response headers include the CSP, X-Frame-Options and Referrer-Policy.
- [ ] **Check** Privacy, terms, and contact content are reachable from every page.
- [ ] **Check** The About page shows no team members until consent is recorded.
- [ ] **Check** The service worker does not cache `/api` or Nightscout responses (none exist) and the offline page loads.
- [ ] **Check** Feedback and backup downloads work on a phone.
- [ ] Keep a dated record of the review: who reviewed the content, the date, and the version deployed.

## Sign-off

| Item | Owner | Date | Notes |
|---|---|---|---|
| Lawyer review (regulatory, privacy, terms, licence) | | | |
| Clinician review (hypo guide, knowledge hub) | | | |
| Team consent records (one per person) | | | |
| Brand-name decision | | | |
| Licence chosen | | | |
