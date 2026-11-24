# Herald portfolio — design

Approved 2026-11-24.

## Intent
Personal portfolio for a 2026 B.Sc. Software Engineering graduate. Linked from the résumé and job applications. A recruiter must get name, role, status, and proof of shipped work within 60 seconds; an engineer must reach architecture and source code in two clicks.

## Goals
- One scene across every page: void, star field, gravity-well grid, small silver figure on a board of light, one red planet.
- Home page sections: hero, stack strip, selected work (6 rows), about, orbit map, from the lab, contact.
- One case-study page per project at `/work/<slug>/`, with next-project link.
- Works at 390 px wide. Keyboard and screen-reader friendly. Honors reduced motion.

## Non-goals
- No CMS, no blog, no contact form (email shown as text with a copy button).
- No analytics or cookies in v1.

## Anti-goals
- Looks like a template. Invented numbers or claims. Slow first paint from heavy 3D.

## Constraints
- Use the canvas's tokens: Void #06070B, Nebula #0D0F17, Dust #9AA1AF, Silver #E6E9EF, Corona #E8432A, Ember #7A0E1E; Archivo Expanded 800, Bodoni Moda italic, Hanken Grotesk, Martian Mono.
- Personal facts not yet given (full name, portrait, university, city, email, LinkedIn, résumé PDF) live in one file, `site.json`, as `[PLACEHOLDERS]`.
- Original figure only; no Marvel character art.

## Approaches
1. **Hand-written HTML/CSS/JS plus a ~100-line Node build script (stdlib only)** that renders the home page and case studies from `site.json`. No dependencies, output is plain static files, hosts anywhere. **Picked** (builder's call): least code, nothing to update, and the repo itself reads cleanly to a reviewer.
2. Astro: components and content collections, but adds a framework and a dependency tree for six pages.
3. A single-page app with client routing: case-study links would not be real URLs and first paint would wait on JS.

## Builder's calls
- Hosting: GitHub Pages or Cloudflare static assets; decide at deploy time with the user.
- Screenshots: captured from the live projects; Pit Wall (no web UI) gets a drawn telemetry graphic.
- Motion: CSS arrival sequence (2.2 s, once per session), light scroll parallax, row-hover preview on pointer devices only.
