# Hack Academy

A hands-on curriculum for web application security and bug bounty skills — eight tracks, thirty-one
levels, all running as a static site with no backend. No prior coding or security knowledge assumed:
Track 0 teaches the terminal, HTTP, HTML, DevTools, JSON, and SQL from scratch before anything else
relies on them.

**[Live site →](#)** _(filled in once GitHub Pages is enabled)_

## What this is

Every "target" is a sandboxed simulation that runs entirely client-side, inside a
`sandbox="allow-scripts"` iframe or a fake terminal — nothing here touches a real network or another
person. That containment means it can teach the *mechanics* of each vulnerability class honestly, but
it isn't a substitute for practicing against real (authorized) targets. Track 8, "Bug Bounty
Methodology," ends with exactly where to go next: PortSwigger Web Security Academy, OWASP Juice Shop,
TryHackMe/HTB, and real bug bounty programs.

## Tracks

0. **Foundations** — what a website/terminal/HTTP request even is, HTML, DevTools, cookies, JSON,
   your first SQL query, URL-encoding. Zero assumed knowledge; everything else depends on this.
1. **Recon & Footprinting** — WHOIS/DNS, search-engine dorking, content discovery
2. **Injection** — SQL injection (auth bypass, UNION extraction), OS command injection
3. **Cross-Site Scripting** — reflected, stored, DOM-based
4. **Auth & Access Control** — IDOR, JWT `alg:none` tampering, broken access control
5. **CSRF & SSRF** — forged state-changing requests, server-side request forgery to cloud metadata
6. **Crypto & Client-Side Bugs** — weak/unsalted hashing, encoding vs. encryption, prototype pollution
7. **Bug Bounty Methodology** — rules of engagement, the recon-to-report workflow, tooling, writing
   reports, and where to practice for real

Progress is tracked per-level in `localStorage` only — nothing is sent anywhere, and there's no
account system.

## Running locally

No build step. From the project root:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Structure

```
index.html            landing page / track overview
track.html            level workspace (level rail + briefing/sandbox/flag/debrief)
styles/main.css       design system
js/engine.js          shared engine: progress tracking, terminal emulator,
                      iframe sandbox renderer, flag checking, hints
js/app.js             landing page logic
js/track-app.js       track workspace logic / routing
js/data/*.js          one file per track — all level content and challenge logic
```

To add a level, add an entry to the relevant `js/data/<track>.js` file — the shared engine renders
whichever `type` (`terminal`, `webapp`, `answer`, or `reading`) it declares.

## Ethics

Only use what you learn here against systems you have explicit authorization to test. See Track 8
("Bug Bounty Methodology"), Level 1 for a rundown of what "authorized" actually means.
