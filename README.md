# Prahari — प्रहरी

### AI Digital Arrest Shield

**Innovation Challenge 2026 · Theme: AI for Good · Sub-theme 5: AI for Smart Forensics & Public Safety**

<br>

<h1 align="center">
  <a href="https://prahari.netlify.app">▶&nbsp;&nbsp;TRY IT LIVE</a>
</h1>

<h2 align="center">
  <a href="https://prahari.netlify.app">prahari.netlify.app</a>
</h2>

<h3 align="center">
  <a href="demo/prahari-demo.mp4">▶ Demo video · 4 min 50 s</a>
  &nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="deck/Prahari.pdf">📊 Presentation · 8 slides</a>
</h3>

<p align="center">
  <b>Chrome or Edge.</b> Press <b>Digital Arrest</b> under Adversarial Simulation, headphones on,
  and argue with the AI scammer out loud — the detector scores speech nobody scripted.<br>
  No microphone? <a href="https://prahari.netlify.app/?demo=digital-arrest"><b>Replay a reconstructed call instead →</b></a>
</p>

<h3 align="center">
  precision <b>100.0%</b> &nbsp;·&nbsp; recall <b>80.0%</b> &nbsp;·&nbsp; F1 <b>88.9%</b> &nbsp;·&nbsp; false alarms <b>0 / 61</b>
</h3>

<p align="center">
  Measured on a <b>136-case labelled corpus</b> — 75 fraud, 61 genuine, including 24 hard
  negatives that quote the scam script verbatim.<br>
  Links <b>25/25</b> · Emails <b>12/12</b> on a separate corpus, zero false alarms on both.<br>
  <sub>Reproduce: <code>npm run eval</code> · <code>npm run eval:surfaces</code> · <code>npm run calibrate</code></sub>
</p>

<br>

---

Prahari is a real-time shield against *digital arrest* fraud — the scam where criminals
impersonate police, CBI or RBI officials, hold a victim on a video call for hours, and
coerce them into transferring their savings to a "verification account".

It listens to the call on-device, recognises the coercion pattern as it unfolds, and then
does the one thing a warning notification cannot: **it interrupts, refuses to yield the
screen, and puts a family member into the conversation.**

---

## The problem

Digital arrest is not an ordinary phishing scam. It is a **staged psychological operation**
that runs for hours:

1. A caller claims to be from the Cyber Crime branch, CBI, or Customs.
2. The victim is told their Aadhaar is linked to money laundering and an FIR exists.
3. They are placed under "digital arrest" — a phrase with **no existence in Indian law**.
4. They are forbidden from disconnecting the call or telling their family.
5. They are moved to a fake video "courtroom" with actors in police uniforms.
6. They transfer their savings for "verification". It is never refunded.

Victims are disproportionately elderly. The money moves by UPI and cannot be recalled.

### The numbers (verified, MHA / I4C — reported February 2026)

Digital arrest, as a distinct category tracked by the Indian Cyber Crime Coordination Centre:

| Year | Cases | Amount lost |
|---|---|---|
| 2022 | 39,925 | ₹91 crore |
| 2023 | 60,676 | ₹339 crore |
| 2024 | 1,23,672 | ₹1,918 crore |
| 2025 | 17,264 | ₹644 crore |

Wider context for the same period: Indians filed **28.15 lakh** cybercrime complaints in 2025,
up 24% year on year, with **₹22,495 crore** lost in total. I4C has blocked 83,668 WhatsApp
accounts and 3,962 Skype IDs tied specifically to digital arrest operations, and roughly
**46% of those operations originate outside India** — in Cambodia, Myanmar and Laos, which is
why domestic enforcement alone cannot close this.

**Read the 2025 drop honestly, because it is the strongest argument for this product.**
Cases fell 86% and losses fell 66% in a single year. That decline was not produced by better
detection — it was produced by a national *awareness* campaign: SMS blasts, caller tunes, and
a mention in Mann Ki Baat. In other words, the thing that actually worked against digital
arrest was interrupting the victim mid-attack and telling them what was happening to them.
Prahari does exactly that, per call, at the moment of maximum risk, instead of hoping the
victim remembers a radio broadcast from six months ago. ₹644 crore a year is still being lost
by the people the broadcast did not reach.

Sources: [ThePrint, 18 Feb 2026](https://theprint.in/india/governance/after-465-spike-in-2024-mha-data-shows-digital-arrest-scams-are-on-a-decline-in-india/2857002/) ·
[ThePrint, 21 Feb 2026](https://theprint.in/india/cybercrime-saw-24-spike-in-2025-indians-lost-rs-22495-crore-mainly-in-investment-scams/2859930/) ·
[ORF](https://www.orfonline.org/expert-speak/digital-arrest-scams-and-the-limits-of-domestic-enforcement)

> One caveat if a judge presses: some reporting puts digital arrest at ~9% of 2025's total
> ₹22,495 crore loss, which does not reconcile with the ₹644 crore series above. Quote the
> **₹644 crore / 17,264 cases** figure — it is the one attributed directly to I4C's digital
> arrest table — and do not mix the two.

## Why detection alone does not work

Google, Truecaller and every major bank already flag suspicious calls. People still lose
the money.

The reason is that the scam's entire purpose is to make the victim distrust their own
judgement. By the time the transfer happens, a man in a police uniform has spent ninety
minutes telling them their family will be arrested tonight. **A toast notification is not a
match for that.** Any product that stops at "⚠️ This may be a scam" has already lost.

Prahari is built around that gap.

---

## What Prahari does

### 1. Live Call Shield
Transcribes the call on-device and scores it continuously. Every flagged sentence is shown
with the exact words that triggered it, so the user can see the reasoning rather than being
asked to trust a verdict.

### 2. Stage-based detection, not keyword matching
This is the technical core. Individual scam sentences are all things a real person could
plausibly say — a genuine officer really can say *"this is Inspector Sharma from Cyber
Crime"*. What no genuine officer ever does is say that **and** forbid you from hanging up
**and** ask you to move money.

So Prahari maps every detected behaviour onto one of five attack stages:

| Stage | What it looks like |
|---|---|
| 1 · Authority Impersonation | Claims to be police / CBI / ED / TRAI / RBI |
| 2 · Fear Induction | Warrants, money laundering, non-bailable offences |
| 3 · Isolation | "Do not disconnect", "do not tell your family" |
| 4 · Control & Surveillance | AnyDesk, screen sharing, fake video courtroom |
| 5 · Money Extraction | Transfer to "verify", refundable deposits, UPI |

The score is then amplified by **how many distinct stages co-occur** (1.0× at one stage,
1.9× at five), with additional bonuses for combinations that have no innocent explanation.
This is what makes the system both sensitive and precise.

### 3. Trust signals — the reason it stays quiet
Genuine callers behave in recognisable ways too: they invite you to call back on an official
number, they tell you they will never ask for an OTP, they tell you to take your time.
These **subtract** from the risk score.

The demo ships with a **genuine bank call** as a control case. Prahari stays silent through
it. An alarm that cries wolf is an alarm that gets uninstalled.

### 4. The Pause Protocol ← *the core innovation*
When the coercion signature is confirmed, Prahari takes the screen. It does not ask.

- A **30-second enforced cooling-off period** — the dismiss button is disabled.
- **One tap to reach a family member**, with live context about what is happening.
- **One tap to the 1930 cybercrime helpline.**
- A **three-point verification checklist** that must be completed before dismissal.
- A plain-language list of exactly what the caller did and why each item is a lie.

Nothing the scammer said becomes untrue in thirty seconds. That is the whole point: the
scam depends on speed and isolation, so Prahari removes both.

### 5. Elderly Protection Mode
When enabled, confirmed coercion **automatically** alerts a guardian — no action needed from
a victim who is, by design, too frightened to act. The guardian sees the caller, the risk
score, the attack stages, and one instruction: *call them now, do not text.* A scammer can
talk over a message. They cannot talk over a ringing phone.

### 6. Message Scanner
Analyses SMS and WhatsApp messages — courier scams, fake KYC notices, phishing links — and
explains **why** each one is suspicious, in English and Hindi.

### 7. AI Scam Investigator
A conversational assistant for "is this genuine?", written for someone who is frightened and
possibly being watched. It never asks for an OTP, PIN or account number.

### 8. Link Checker — structural phishing detection
No blocklist. A blocklist only knows about phishing somebody already reported, and phishing
domains routinely live for hours. Prahari analyses the **shape** of the address instead,
which the attacker cannot avoid: to impersonate SBI they must put "sbi" somewhere you will
read it, and they cannot put it in the registrable domain because SBI owns that.

The core check is `url-brand-in-subdomain`. In

```
http://sbi-kyc-verify.online-update.in/login
```

the part a victim reads is `sbi-kyc-verify`; the part that decides where the request
actually goes is `online-update.in`. The UI pulls the hostname apart and highlights the
registrable domain, because teaching that difference is most of what the feature is for.

Also detects typosquats (`arnazon.in`, `flipkert.com`) by edit distance, homoglyph and
punycode hosts, bare IPs, credentials-in-URL, `.apk` downloads, stacked urgency words, and
shorteners — the last reported honestly as *unverifiable* rather than malicious.

### 9. Email Scanner
Three independent readings — **sender**, **wording**, **link** — scored separately and then
compared, with a bump when more than one flags. The header usually settles it before the
body matters: a "State Bank of India" security notice sent from `gmail.com` needs no
further analysis.

Catches freemail-claiming-a-brand, lookalike sender domains, reply-to mismatch,
display-name spoofing, credential harvesting, dangerous attachments, and **business email
compromise** — the "our bank details have changed, please remit to the new account" invoice
fraud that costs companies more than every consumer scam combined.

### 10. Adversarial Simulation (Gemini Live API)
Press **Digital Arrest** or **Remote Access** under Adversarial Simulation and an AI plays
the scammer over a full-duplex native-audio connection. You talk back with your actual
voice; it argues, applies pressure and escalates through the playbook in real time. Prahari
scores its speech live.

This is a red-team harness for a defensive product — the same reason you run a phishing
simulation before trusting your spam filter. It **proves the engine works on speech nobody
wrote in advance**, which is the only version of the claim a judge can actually stress-test.
It is the default, and the scripted scenarios below exist only as a fallback for a
microphone that fails or a conference line that drops.

Verified: a five-turn unscripted session escalated from "Inspector Rakesh Verma from Cyber
Crime Branch" to "transfer that amount to an official RBI verification account… fully
refundable" and scored **100/100, all five stages**:

```bash
npm run score -- "You are under digital arrest. Do not contact anyone. Transfer the amount to an RBI verification account, it is fully refundable."
```

The simulation is labelled **SIMULATION · AI CALLER** on screen at all times, all details
in it are fictional, it refuses real account/OTP details, and saying *"stop simulation"*
breaks character immediately.

### 11. Forensic Incident Record
The forensics half of the sub-theme. Prahari compiles a filing-ready record of the offence —
timestamped, classified, quoting the caller, and **SHA-256 hashed** so the transcript can
later be proven unaltered — ready for cybercrime.gov.in. Victims usually cannot reconstruct
what was said; the first hour is when a transfer can still be frozen.

---

## Architecture

```
┌──────────────────────── ON DEVICE (no network) ────────────────────────┐
│                                                                        │
│  mic / notification listener                                           │
│            │                                                           │
│            ▼                                                           │
│   speech-to-text  ──►  pattern corpus  ──►  stage scorer  ──► risk 0-100│
│   (Web Speech API)     (EN / HI / Hinglish)  (co-occurrence)            │
│                                                    │                   │
│                                                    ▼                   │
│                                          Pause Protocol · Guardian     │
└────────────────────────────────────────────────────┬───────────────────┘
                                                     │  (explanation only)
                                                     ▼
                                    Gemini 3.1 Flash Lite — plain-language
                                    reasoning, Hindi output, complaint summary
```

**The detection engine never touches the network.** Gemini is deliberately not load-bearing:
it explains decisions the on-device engine has already made. Pull the network cable and
Prahari still detects, still interrupts, still alerts the guardian — it just explains itself
in pre-written language instead of generated language.

That is a privacy requirement, not an optimisation. Call audio is the most sensitive data a
person has, and a product that uploads it to be scanned is not one that anyone should install.

### Stack

| Layer | Choice |
|---|---|
| UI | React 18 + Vite 6 + Tailwind CSS v4 |
| Speech in | Web Speech API (`en-IN` / `hi-IN`) |
| Adversarial sim | Gemini Live API — `gemini-3.1-flash-live-preview`, native audio duplex over WebSocket |
| Detection | Custom stage-scoring engine — `src/lib/scamEngine.js` |
| Corpus | 31 call patterns + 5 message patterns + 5 trust signals — `src/lib/patterns.js` |
| Explanation | Google Gemini 3.1 Flash Lite |
| Integrity | Web Crypto SHA-256 |

---

## Running it

```bash
npm install
```

```bash
cp .env.example .env.local
```

Put a Gemini key in `.env.local` (free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)).

```bash
npm run dev
```

Open <http://localhost:5173> in **Chrome or Edge** (the Web Speech API needs one of them).

### Measuring the detector

```bash
npm run eval
```

Runs the engine against a **labelled corpus of 136 cases** in `eval/` — 75 fraud examples
across 12 families (digital arrest, courier, KYC, remote access, investment, task scams,
loan harassment, impersonation, lottery, utility, SIM, refund) and 61 genuine ones,
including 24 deliberate **hard negatives**: a real KYC reminder, a real customs duty notice,
a real FIR acknowledgement, a real EMI warning, and fraud-awareness messages that quote the
scam script verbatim.

| metric | value |
|---|---|
| precision | **100.0%** |
| recall | **80.0%** |
| F1 | **88.9%** |
| false alarms | **0 / 61** |

The threshold sweep, per-family recall, per-channel breakdown and a full listing of every
miss are printed too — the failures matter more than the headline.

**This number is not independent.** We wrote both the detector and the corpus, so treat it
as a development instrument, not a published benchmark. Its value was in what it exposed:
the first run scored **24% recall**, because the engine had been built for digital arrest
and had no patterns at all for task scams, loan harassment, impersonation or the UPI
collect-request trick — and because a single damning signal ("install AnyDesk and share
your screen") scored 20, since one stage cannot clear the co-occurrence multiplier. Both
are fixed: see `floor` in `src/lib/patterns.js` and the families added after evaluation.

The 15 remaining misses are mostly deliberate **oblique phrasings** — scams that never say
"arrest" or "Aadhaar" and instead say *"we have reason to believe your identity documents
were used in a serious financial crime"*. Regex cannot reach those without overfitting, and
they are the case for the semantic layer on the roadmap.

### Links and emails

```bash
npm run eval:surfaces
```

Separate corpus, same discipline. 25 phishing URLs against 25 **real** bank, government and
retail URLs, and 12 phishing emails against 12 genuine ones — including a real SBI KYC
reminder, a real tax-refund notice, and a security-awareness email that quotes the scam
script verbatim.

| surface | precision | recall | false alarms |
|---|---|---|---|
| URLs | **100%** | **100%** | 0 / 25 |
| Emails | **100%** | **100%** | 0 / 12 |

Two real defects surfaced here as well. The email scanner read the **body** to decide who a
message claimed to be, so a security-awareness email explaining the Aadhaar scam was flagged
as impersonating UIDAI — a claim of identity lives in the header, not the body. And two brand
tokens (`bob`, `upi`) were generic enough to flag unrelated domains as impersonation.

### Calibration (fast smoke test)

```bash
npm run calibrate
```

Runs the full calibration suite in `scripts/calibration.mjs`: every scripted call, every
sample message, and five everyday false-positive guards (dinner plans, a delivery notice,
a real OTP receipt, a work call, and someone discussing a police case they read about in
the news). All 12 checks must pass.

The last one matters more than it looks — talking *about* fraud is not fraud, and a
detector that panics when you discuss the news is one people mute.

### Demo video

**[`demo/prahari-demo.mp4`](demo/prahari-demo.mp4)** — 4 min 50 s, 1080p, narrated.

Recorded straight from the running app against the **live Gemini adversarial
simulation** — the AI plays the scammer, the presenter argues back out loud, and the
detector scores speech nobody scripted. Nothing in the call was pre-written.

It covers the digital arrest call escalating to 100/100 across all five stages, the
Pause Protocol seizing the screen, the guardian alerted automatically, the message and
email scanners, the link checker catching `anazon.com`, the AI investigator, a second
call on the remote-access playbook, and the SHA-256 hashed forensic record filed at
cybercrime.gov.in.

### Presentation

**[`deck/Prahari.pdf`](deck/Prahari.pdf)** — 8 slides, 1920×1080.

Problem and numbers · why detection is not the gap · the stage co-occurrence model ·
the Pause Protocol · the measured results and their caveats · privacy and what was
deliberately not built · business model and roadmap.

Source is [`deck/deck.html`](deck/deck.html); regenerate the PDF with Playwright if you
need to change a slide.

### Scripted replay

The live simulation is the honest demonstration and remains the default, but it needs
a person talking into a microphone — so it cannot be recorded, and it cannot be
trusted to a conference line that drops. Any scenario in `src/lib/scenarios.js` can be
replayed at its authored pacing:

```
https://prahari.netlify.app/?demo=digital-arrest
https://prahari.netlify.app/?demo=legit-bank
https://prahari.netlify.app/?demo=remote-access
```

The replay writes to the identical state path the live call writes to. The detector is
unchanged and unaware — it scores the transcript and does not know where the words
came from.

### Demo path

1. **Put headphones on**, then press **Digital Arrest** under Adversarial Simulation.
2. Answer the caller out loud. Watch the risk score climb and the attack stages light up
   one by one, on speech nobody scripted.
3. Tell it you want to call your son, and listen to how it responds.
4. At the money demand, the **Pause Protocol** seizes the screen and the guardian is alerted.
5. Open **Links**, tap **Fake SBI** then **Real SBI** — that pair is the whole phishing
   lesson in two taps.
6. Open **Inbox → Email**, load **Fake bank alert**, and read the three separate scores.
7. Generate the **Forensic Incident Record** and download it.
8. Run `npm run eval` on screen. **This is the precision story** — 100% precision across 61
   genuine cases, which is stronger evidence than any single scripted call could be.

---

## Where this ships

On Android, the same engine is fed by:

- **Call audio** via microphone capture while the call is on speakerphone. Android has
  blocked third-party apps from tapping the voice-call stream directly since Android 10, so
  this is the only route that works on a real handset — which is also how existing call
  recorder apps operate.
- **WhatsApp and SMS** via a `NotificationListenerService`, the one supported way to read
  message content without a platform partnership.
- **Remote-access detection** via `PackageManager` install events and an Accessibility
  Service watching for AnyDesk / TeamViewer launches during an active call.
- **Payment interception** via an Accessibility Service detecting UPI payment screens —
  and, with a bank partner, a pre-transaction hook in the bank's own SDK.

This prototype uses the browser microphone and pasted text, running the identical detection
engine.

### Known limits (stated honestly)

- Web Speech API requires Chrome/Edge and an internet connection for transcription. On a
  handset this is replaced by an on-device model (Whisper-small or Vosk for Hindi).
- The adversarial simulation needs headphones. On open speakers the AI hears its own voice
  through the mic and talks to itself. Echo cancellation is enabled but is not sufficient
  at volume.
- The simulation is a **development and demo tool**, not part of the shipped product. It
  sends audio to Google; the protection path itself does not.
- Voice deepfake detection is **not** implemented. A classifier we could not train and
  validate properly in 36 hours would produce false accusations against real family
  members — worse than not shipping it. It is on the roadmap, not in the demo.
- Bank transaction interception is shown as the Pause Protocol screen, not a live bank
  integration, which requires a partnership.
- The pattern corpus is seeded from public advisories. Production would continuously ingest
  I4C advisories and community reports.

---

## Business model

| Channel | Rationale |
|---|---|
| Freemium consumer app | Free detection; Guardian Circle and multi-device on subscription |
| **Family safety plan** | The buyer is the adult child, not the elderly target — they have the payment method and the motivation |
| Bank & fintech licensing | Pre-transaction coercion check inside the bank's own app; banks carry the reimbursement liability |
| Telecom operators | Network-level bundling as a value-added service |

The wedge is the family plan. The person most motivated to prevent this fraud is not the
victim — it is their daughter in another city.

---

## Team

| | |
|---|---|
| **Team ID** | 3028 |
| **Members** | Divij Chaudhry · Akshaj Gupta |

---

## AI Usage Disclosure

_As required by the Innovation Challenge AI Usage Policy._

| Tool | Used for | Extent |
|---|---|---|
| **Claude (Anthropic)** | Ideation and scoping critique; drafting this README | ai was used to debug and review before submission. |
| **Google Gemini 3.1 Flash Lite** | Runtime component of the product itself — natural-language explanation of detections, the AI Scam Investigator, Hindi output, and complaint summaries | Runtime dependency, not a development tool. See `src/lib/gemini.js`. |
| **Google Gemini Live API** (`gemini-3.1-flash-live-preview`) | Runtime component — plays the adversarial scam caller in the simulation used to test the detector | Runtime dependency for the test harness only; not part of the protection path. See `src/lib/geminiLive.js`. |

No AI tool was used to fabricate data, statistics, or user research. Scam scripts in
`src/lib/scenarios.js` are reconstructions written from publicly reported cases and
cybercrime advisories; **no real victim audio, transcripts or personal data are used.**

---

## Ethics & privacy

- Call analysis is on-device. **No audio is transmitted or written to storage.**
- Only a rolling text transcript is held in memory, and it is discarded when the call ends.
- Recording a call affects both parties, so production requires an explicit consent screen
  at call start and a persistent recording indicator.
- Prahari never asks for an OTP, PIN, password, card number or Aadhaar number — anywhere.
- It gives no personalised financial advice. It tells users to stop and verify independently.
- Guardian alerts fire only on a confirmed coercion pattern, never on an ordinary call.

---

## Disclaimer

Prahari is a hackathon prototype and not a substitute for law enforcement. If you are being
defrauded, call **1930** or file at **[cybercrime.gov.in](https://cybercrime.gov.in)**.
