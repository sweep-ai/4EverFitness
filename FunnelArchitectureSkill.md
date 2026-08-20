# VSL → Application → Strategy Call Funnel Skill

Use this document as an AI skill / system prompt when building a high-converting funnel in the **same shape** as the Sneak-it-in Fitness funnel — with different branding, assets, and offer copy.

This skill defines **structure, intentionality, and engineering patterns**. It does **not** copy offer-specific claims, niche language, or gender-split page variants. Treat audience splits as an optional pattern, not a requirement.

---

## When to use

Use this skill when the user provides:

1. **Branding** — colors, fonts, logo, voice/tone guide
2. **Assets** — hero/proof photos, founder photos, VSL video (or Loom/YouTube URL), optional testimonial videos + posters
3. **Sales letter / offer brief** — who it's for, dream outcome, mechanism, objections, CTA, what happens on the call

…and wants a mobile-first funnel that:

- sells a **booked strategy call** (not a checkout)
- uses a **VSL + application quiz** gate
- qualifies / disqualifies leads
- sends booked users through a **post-booking commitment sequence**

---

## Required inputs (ask if missing)

```yaml
offer:
  brand_name: string
  founder_name: string
  one_line_promise: string          # dream outcome in plain language
  mechanism: string                 # what makes the system different
  call_name: string                 # e.g. "Strategy Call", "Fit Call"
  call_duration: string             # e.g. "45 minutes"
  calendly_url: string              # inline widget URL
  phone_for_confirmation: string?   # optional post-booking callout

audience:
  icp: string                       # who it's for
  pain: string                      # stuck loop / failed attempts
  dream_outcome: string             # identity + concrete result
  objections: string[]              # time, money, skepticism, past failures

branding:
  colors:
    bg: hex
    fg: hex
    accent: hex
    muted: hex
    border: hex
  fonts:
    display: string                 # expressive headline font (not Inter/Roboto/Arial)
    body: string
  logo: file
  voice: string                     # blunt / premium / warm / etc.

assets:
  vsl: file | youtube_id | loom_url
  vsl_poster: file?
  proof_photos: file[]              # transformations / results / context
  founder_photo_primary: file       # manifesto / authority
  founder_photo_secondary: file?    # exclusive / humanizing
  testimonial_videos: { name, video, poster }[]?
  post_booking_preface_video: file?
  post_booking_breakdown_video: loom_url | file?
  calendar_confirm_screenshots: file[]?  # RSVP + meeting link UI

tracking:
  meta_pixel_id: string?
  meta_capi_token: string?
  clarity_project_id: string?
  zapier_webhook: string?
  crm: ghl | other | none
```

---

## Funnel shape (do not invent a different architecture)

This is a **3-surface conversion system**, not a long-scroll landing page alone.

```
SURFACE A — MAIN FUNNEL (/)
  Attention → Desire (VSL) → Commitment (Quiz) → Proof reinforcement → Authority → Final CTA

SURFACE B — BOOKING (/booking)
  Congrats → Calendly embed → ambient proof banners

SURFACE C — POST-BOOKING (/post-booking)
  Welcome video → Mandatory steps → Confirmation call expectation
  → Breakdown video → Calendar confirm → FAQ → Prep checklist
```

### Conversion spine (canonical)

```
Ad / organic → Funnel page
  → Watch VSL
  → Start application (#application-form)
  → Complete quiz
  → Submit lead (CRM + Zapier)
  → Fire Lead (Pixel + CAPI, shared event_id)
  → /booking
  → Fire Lead again with same event_id (dedupe / reliability)
  → Book Calendly
  → Fire Schedule (shared event_id)
  → /post-booking
  → Fire Schedule again with same event_id
  → Complete mandatory prep steps
```

Qualified path → booking.  
Disqualified path → still capture lead → show soft-reject + resources (do **not** send to Calendly).

---

## Page composition blueprint

### A. Main funnel page (single composition order)

Build **one shared shell**. Optional audience variants may swap proof media only; do not fork the whole page.

| # | Section | Component role | Job |
|---|---------|----------------|-----|
| 1 | **PageHero** | Brand-forward header over atmospheric proof grid | Name the promise; one short subhead that sells watching the VSL |
| 2 | **VSLPlayer** | Autoplay video (file preferred) | Primary persuasion engine |
| 3 | **ApplicationForm** | Multi-step quiz | Qualification + contact capture |
| 4 | **Proof banners** | Horizontal scrolling photo marquee | Social proof without cards |
| 5 | **Client stories** (optional) | Lazy vertical video list | Deeper proof after banners |
| 6 | **Exclusive / scarcity block** | Photo-grid atmosphere + founder image + inverse CTA | Filter + elevate (“not for everyone”) |
| 7 | **Founder manifesto** | Short punchy lines + founder photo + CTA | Authority + identity |
| 8 | **Final CTA** | Headline + subhead + apply button | Last chance before sticky bar |
| 9 | **StickyApplyBar** | Mobile-only sticky CTA | Recover scroll-aways; hide when form visible |

**Layout chrome (all pages):** logo header, scarcity micro-signal (“limited slots”), footer with social + legal.

**First viewport rules (hard):**
- One composition, not a dashboard
- Brand / product name is hero-level (or the promise headline is the brand signal)
- First viewport: brand/promise, one headline, one short supporting sentence, one dominant visual plane (hero atmosphere or VSL), CTA implied by “watch below” or scroll-to-apply
- No cards in the hero
- No stat strips, pill clusters, floating badges, or secondary marketing blocks above the VSL

### B. Booking page

| # | Element | Job |
|---|---------|-----|
| 1 | Congrats label + book headline | Reward qualification; reduce friction |
| 2 | Calendly inline embed | Capture the appointment |
| 3 | Proof banners beneath | Keep belief high while choosing a time |

Listen for `calendly.event_scheduled` → track Schedule → `navigate('/post-booking', { replace: true })`.  
Disable Calendly’s own confirmation redirect to avoid double redirects.

### C. Post-booking page

This page is a **show-rate optimizer**, not a thank-you dead end.

| Order | Block | Job |
|-------|-------|-----|
| 0 | Title + **MANDATORY** subheader | Frame completion as required |
| 0b | Preface video (not a numbered step) | Warm welcome / orientation |
| 1 | Confirmation-call expectation | Set expectation; reduce no-shows |
| 2 | Breakdown / prep video | Pre-sell the call |
| 3 | Confirm appointment UI | Calendar RSVP + meeting-link education |
| 4 | FAQ | Handle lingering objections |
| 5 | Prep checklist | Concrete day-of behavior |

Use numbered step pills + short uppercase prompts. Keep phone / ops details in copy config.

---

## Quiz / application architecture

### Intentionality

The quiz is not a survey. It is a **commitment ladder + filter**:

1. Soft identity / situation questions first (easy wins, momentum)
2. Goal selection (single-select preferred for clarity)
3. **Readiness / investment** question last among qualification questions — this is the DQ gate
4. Occupation / demographics
5. **Contact details last** (name, email, phone, social handle) — after they’ve invested answers

### Recommended step skeleton

| Step | Type | Purpose |
|------|------|---------|
| Qualifying yes/no or niche filter | `yesno` / `single` | Segment; usually **not** hard DQ unless offer requires it |
| Situation | `single` | Self-diagnosis; language for CRM notes |
| Primary goal | `single` (not multi) | Clean CRM mapping; fewer options > more |
| Readiness to invest / act | `single` | Bottom answer = disqualify |
| Occupation (+ age if useful) | dual text | Context for sales |
| Contact details | name + email + phone + social | Submit |

### UX rules

- Choice steps **auto-advance** (~400–600ms) with clear selected/confirmed state
- Progress indicator `N / total`
- Slide forward/back animation
- Validate email + phone before submit
- On success: store applicant PII in `sessionStorage` for later CAPI matching
- Qualified → `/booking`
- Disqualified → submit anyway → DQ slide with helpful resources (not a hard error)

### Payload shape (Zapier + CRM)

Send **both** nested and flat fields:

```ts
{
  name, email, phone, social,
  occupation, age?,
  situation: { prompt, code, label },
  goal: { prompt, code, label },
  readiness: { prompt, code, label },
  leadStatus: 'qualified' | 'disqualified',
  dqReason: string | null,
  submittedAt, source,
  answers: { /* flat Zapier-friendly mirrors */ }
}
```

CRM contact mapping (GHL-style):
- name / email / phone → identity
- occupation → company
- social handle → website URL
- tags for status + answer codes (`Qualified Lead`, `Goal A`, `Readiness C`, etc.)

---

## Copy strategy (structure, not wording)

Abstract the sales letter into these **slots**. Rewrite each slot in the offer’s voice.

### Slot map

| Slot | Location | Strategy |
|------|----------|----------|
| **Hero headline** | PageHero | Promise or category claim. Optional single accent-highlighted word (ICP noun or outcome noun). Keep title casing / display treatment brand-consistent. |
| **Hero subhead** | PageHero | One sentence: dream outcome + constraint relief + **CTA to watch the video**. Combine former “video section label” into this line — do not duplicate a second headline above the VSL. |
| **VSL** | VSLPlayer | Full persuasion: hook → pain → mechanism → proof → CTA to apply |
| **Quiz prompts / options** | ApplicationForm data | Mirror VSL language; options should feel like self-selection into the ICP |
| **DQ copy** | After submit | Soft dignity: “not ready yet” + resources; never shame |
| **Booking congrats** | BookingPage | Status reward: “You qualified” + clear next action |
| **Exclusive block** | Mid/lower funnel | “Not for everyone” + who it *is* for + application-only scarcity |
| **Manifesto lines** | Founder section | 3–5 short lines; alternate normal / emphasized; identity > features |
| **Final CTA** | Bottom | Restate stuck-loop pain + invite to apply / book |
| **Apply button label** | Global CTA | Verb + transformation (“Start Your Transformation”) — same label everywhere for consistency |
| **Sticky bar label** | Mobile | Shorter urgent variant (“Apply Now”) |
| **Post-booking title** | PostBooking | Progress, not celebration (“You’re Almost There…”) |
| **Mandatory subheader** | PostBooking | Highlight **MANDATORY** + complete steps to lock call |
| **FAQ** | PostBooking (+ optionally funnel) | Objection → reframe using mechanism; end with call expectation FAQ |
| **Prep checklist** | PostBooking | 3 concrete actions only |

### Copy principles

1. **VSL does the selling.** Page copy is scaffolding that gets them into the video and into the form.
2. **Identity over features.** Manifesto and exclusive blocks sell who they become.
3. **Scarcity must be operationally true** (application-only, limited spots) — don’t fake countdown timers.
4. **One job per section.** One headline, one supporting sentence, one action.
5. **Gender / segment variants** (if used): change proof media and audience nouns only; keep promise architecture identical.

### Deriving copy from a sales letter

When given a long sales letter, extract:

1. Opening hook → VSL first 15s + hero subhead energy  
2. Mechanism name → exclusive brand span + manifesto tagline  
3. Top 3 objections → FAQ  
4. Dream outcome sentence → hero + final CTA  
5. Disqualifiers → readiness question bottom option + DQ slide  
6. Call agenda → “What happens on the call?” FAQ + post-booking prep video brief  

---

## Aesthetic intentionality

### Design thesis

This funnel looks like a **dark, high-contrast, mobile performance page** — closer to a creator/direct-response surface than a SaaS marketing site.

| Choice | Why |
|--------|-----|
| Near-black background + subtle radial lift | Atmosphere without flat gray; keeps video/photos cinematic |
| Single accent color for CTAs / highlights / form energy | Instant hierarchy; no purple-glow SaaS cliché |
| Expressive display font (uppercase) | Brand force in headlines; Inter/Roboto only for body |
| Narrow content column (~720px) | Mobile-first reading measure; reduces “website” feel |
| Photo-grid backgrounds (grayscale, low opacity) behind hero/exclusive | Proof as texture, not cards |
| No card grids in hero / proof | Cards dilute urgency; marquees + full-bleed media feel alive |
| Red/accent glow on form panel | Marks the conversion instrument as the hot zone |
| Inverse CTA on exclusive block | Visual gear-shift before manifesto |
| Sticky apply on mobile only | Desktop users see in-flow CTAs; mobile needs recovery |

### Token contract

Define CSS variables first, then build:

```css
--color-bg, --color-bg-center, --color-fg
--color-accent, --color-accent-hover
--color-muted, --color-border
--font-display, --font-body
--max-width: 720px
--space-xs…xl, --radius-sm/md
--banner-height
```

### Motion (intentional, sparse)

Ship 2–3 purposeful motions only:

1. Quiz step slide + option confirm check  
2. Scrolling proof marquee (CSS, continuous)  
3. Sticky bar appear/hide  

Avoid decorative particle/glow noise.

### Brand substitution rules

When applying new branding:

- Keep the **layout geometry** (narrow column, section order, marquee proof)
- Swap **accent + fonts + logo**
- Replace proof grids with offer-relevant imagery
- Do **not** invent a light purple SaaS theme, cream-terracotta editorial theme, or newspaper broadsheet layout unless the brand guide explicitly demands it — and even then, preserve funnel geometry

---

## Technical architecture

### Recommended stack

- **Vite + React + React Router** SPA
- **Vercel** (or equivalent) with SPA rewrite excluding `/api/*`
- Serverless routes for `submit-application` and `track-event`
- Colocate API helpers beside handlers (`api/submit-application/*`, `api/track-event/*`) — avoid broken `_lib` imports on Vercel ESM

### Routing

```
/                 → FunnelShell (main)
/booking          → Calendly
/post-booking     → prep sequence (noindex)
/privacy|/terms|/disclaimer → legal
```

Optional audience routes (`/male`, `/female`, etc.) may wrap the same shell with different proof props. Prefer prop injection over duplicated pages.

Patterns:

- Lazy-load all page routes with `Suspense`
- `ScrollToTop` on pathname; support `/#application-form` deep link
- `vercel.json` rewrite: all non-`api` routes → `index.html`

### Component inventory (build these)

```
Layout, Footer
FunnelShell
PageHero
VSLPlayer
ApplicationForm
ScrollingBanner
RealClientStories + LazyClientVideo
ExclusiveProgram
FounderManifesto
FinalCTA, ApplyButton, StickyApplyBar
SectionTitle
CalendlyEmbed
PostBookingPage sections: ConfirmAppointment, FAQ, PrepChecklist
MetaPixelRouteTracker (if Meta)
```

### Data modules (keep copy/assets out of JSX)

```
data/copy.ts              # headlines, FAQ, manifesto, CTAs, helpers
data/applicationForm.ts   # quiz schema, DQ rules, empty state
data/assets.ts            # static imports of images/videos
data/videos.ts            # VSL configs by placement
data/social.ts            # footer / DQ resources
```

### Video / image rendering

**VSLPlayer placements:**

| Placement | Typical provider | Behavior |
|-----------|------------------|----------|
| `funnel` | `file` (self-host) | Autoplay muted → attempt unmute → “Tap to unmute” |
| `postBookingPreface` | `file` | Same |
| `postBooking` | `loom` / `file` | Embed or file; preconnect Loom if used |

Also support YouTube facade (poster + click-to-play) if needed.

**Image rules:**

- Hero/exclusive grids: `loading="lazy"`, decorative `alt=""`
- Founder primary: meaningful alt
- Logo: high priority in header
- Testimonial videos: `IntersectionObserver` (~200–300px rootMargin), `preload="none"` until near viewport, posters required

**Compression pipeline (required before git push):**

- VSL: H.264, CRF ~32, capped bitrate, width ≤960, AAC mono, `+faststart`, extract poster
- Other talking-head videos: CRF ~28, width ≤720
- Photos: resized JPEGs / WebP for branding
- Keep GitHub packs under large-file pain; never commit uncompressed iPhone HEVC originals in history

### Page optimization checklist

- [ ] Lazy route chunks  
- [ ] Compress media before commit  
- [ ] VSL poster present  
- [ ] Autoplay with unmute fallback (never block UI)  
- [ ] Sticky CTA does not cover the form (IntersectionObserver)  
- [ ] Sitemap includes public funnel URLs; **exclude** `/post-booking`  
- [ ] robots.txt Disallow post-booking  
- [ ] Legal pages linked in footer  

---

## Tracking & attribution (non-negotiable patterns)

### Meta Pixel + CAPI dual fire

Every meaningful event fires **browser + server** with the **same `event_id`**:

| Event | When |
|-------|------|
| `PageView` | Every route change (not only first paint) |
| `Lead` | Quiz submit **and** `/booking` landing (same id) |
| `Schedule` | Calendly booked **and** `/post-booking` landing (same id) |

Implementation pattern:

1. `generateEventId()` at conversion moment  
2. Persist in `sessionStorage`  
3. `fbq('track', name, {}, { eventID })`  
4. `POST /api/track-event` with id + hashed PII + `_fbp`/`_fbc`  
5. Destination page `consume`s id and re-fires for reliability  
6. Align Ads Manager optimization events with these names (don’t mix URL-rule CompleteRegistration against code `Schedule` without shared ids)

### Microsoft Clarity

Install official tag in `<head>` with project id. SPAs generally need no extra pageview wiring if the URL changes on route.

### Privacy

Disclose Pixel / Clarity / CRM / scheduling tools on the privacy page when installed.

---

## Intentionality summary (why this converts)

1. **VSL first** — video carries nuance; page doesn’t compete with a wall of text  
2. **Apply, don’t buy** — lower commitment; sales happens on the call  
3. **Quiz as filter** — protects calendar; improves lead quality; creates sunk-cost momentum  
4. **Contact last** — reduces early bounce from form fields  
5. **Proof after form** — recovers scrollers who skip the video; still funnels to apply  
6. **Exclusive + manifesto** — identity close for fence-sitters  
7. **Booking page is short** — don’t re-pitch; schedule  
8. **Post-booking is mandatory work** — show rate > vanity thank-you pages  
9. **Deduped tracking** — optimizes ads on real leads/books, not double counts  

---

## LLM build protocol

When invoked with branding + assets + sales letter, execute in this order:

### Phase 1 — Extract

- ICP, promise, mechanism, objections, DQ criteria, call details  
- Brand tokens (colors/fonts/voice)  
- Asset inventory mapped to slots (VSL, proof, founder, testimonials)

### Phase 2 — Information architecture

- Confirm 3 surfaces + quiz step list + DQ rule  
- List copy slots to fill  
- List env vars needed (Calendly, Zapier/CRM, Meta, Clarity)

### Phase 3 — Implement

1. Tokens + global styles + fonts  
2. Layout chrome  
3. FunnelShell section stack  
4. Quiz schema + validation + submit API  
5. Booking + Calendly listener  
6. Post-booking steps + media  
7. Tracking (Pixel/CAPI/Clarity)  
8. SEO (title/description/sitemap/robots)  
9. Media compression  
10. Legal stubs if missing  

### Phase 4 — Verify

- [ ] First viewport passes brand test (remove nav — still looks like this brand)  
- [ ] VSL autoplays on mobile Safari path (muted fallback works)  
- [ ] Quiz DQ blocks booking  
- [ ] Qualified submit → `/booking`  
- [ ] Calendly book → `/post-booking`  
- [ ] Lead/Schedule event ids match across dual fires  
- [ ] Zapier/CRM payload fields map cleanly  
- [ ] Lighthouse-ish sanity: LCP image/video poster prioritized; no huge uncompressed assets  

---

## Anti-patterns (do not do)

- Turning the funnel into a 12-section SaaS homepage  
- Putting contact fields first  
- Multi-select goals when CRM needs one primary goal  
- Soft DQ that still sends people to Calendly  
- Replacing post-booking steps with a confetti thank-you  
- Card grids of features above the VSL  
- Firing Pixel and CAPI with different event names/ids  
- Relying only on Ads Manager URL rules for conversion optimization  
- Checking in 20MB+ source videos  
- Building separate full page forks for tiny audience copy tweaks  

---

## Reference implementation map

This repo’s concrete mapping (for cloning patterns, not copy):

| Concern | Path |
|---------|------|
| Routes | `src/App.tsx` |
| Shell | `src/components/FunnelShell.tsx` |
| Hero | `src/components/PageHero.tsx` |
| VSL | `src/components/VSLPlayer.tsx`, `src/data/videos.ts` |
| Quiz | `src/data/applicationForm.ts`, `src/components/ApplicationForm.tsx` |
| Submit | `src/lib/submitApplication.ts`, `api/submit-application/*` |
| Booking | `src/pages/BookingPage.tsx`, `src/components/CalendlyEmbed.tsx` |
| Post-booking | `src/pages/PostBookingPage.tsx` |
| Copy | `src/data/copy.ts` |
| Assets | `src/data/assets.ts` |
| Tokens | `src/styles/tokens.css`, `src/styles/global.css` |
| Tracking | `src/lib/metaPixel.ts`, `src/lib/conversionTracking.ts`, `api/track-event/*` |
| Compress | `scripts/compress-assets.mjs` |
| Deploy | `vercel.json` |

---

## One-paragraph skill prompt (paste into an LLM)

> Build a mobile-first VSL → application quiz → strategy-call funnel using the architecture in `FunnelArchitectureSkill.md`. Use the provided branding tokens, assets, and sales letter to fill the copy slots and media slots only — do not change the surface structure (Funnel / Booking / Post-Booking), section order, quiz intentionality (contact last, readiness DQ), dual-fire Meta event-id pattern, or aesthetic geometry (narrow column, dark atmospheric proof grids, accent CTAs, no hero cards). Compress media, lazy-load routes, and treat post-booking as a mandatory show-rate sequence.
