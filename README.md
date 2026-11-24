# Herald portfolio

Personal portfolio: a home page and one case study per project, rendered from `site.json` into static files. No dependencies, Node 24 only.

```sh
npm run serve   # build, then preview at http://localhost:4321
npm test        # build checks: every page exists, text is escaped, internal links resolve
npm run build   # writes dist/ and lists any [PLACEHOLDER] still in site.json
```

- **Content:** all copy and facts live in `site.json`. Anything in `[BRACKETS]` is a placeholder the build warns about.
- **Résumé:** source in `resume/resume.html`, exported to `assets/Ademola-Adegbola-Resume.pdf` (one A4 page). Re-export the PDF after editing the HTML.
- **Portrait:** add an image under `assets/` and set `person.portrait` to its path. It is shown in grayscale over the red planet.
- **Screenshots:** `assets/shots/`, 1440 × 900.
- **Deploy:** `npm run deploy` runs the tests, builds, and force-pushes `dist/` to `main` of `Adecodes-dot/Adecodes-dot.github.io`, served at https://adecodes-dot.github.io. It refuses while placeholders remain. Source lives on the `source` branch.

Design notes: `docs/design.md`.
