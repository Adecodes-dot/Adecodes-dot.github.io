// HTML templates. Every value from site.json passes through esc() before it reaches markup.

export const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const pad = (n) => String(n).padStart(2, '0');
const isUrl = (s) => /^https?:\/\//.test(s ?? '');

const FONTS = 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Bodoni+Moda:ital,opsz,wght@1,6..96,400..700&family=Hanken+Grotesk:wght@400;500;600&family=Martian+Mono:wght@400;500&display=swap';
const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3CradialGradient id='g' cx='.35' cy='.3'%3E%3Cstop offset='0' stop-color='%23fff'/%3E%3Cstop offset='.55' stop-color='%239AA1AF'/%3E%3Cstop offset='1' stop-color='%232A2F3B'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='16' cy='16' r='15' fill='url(%23g)'/%3E%3C/svg%3E";

// --- Shared pieces -------------------------------------------------------

function layout({ site, title, description, base, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#06070B">
<link rel="icon" href="${FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="${base}assets/styles.css">
<script>
  // Arrival sequence plays once per browser session.
  document.documentElement.classList.add('js');
  try { if (sessionStorage.getItem('arrived')) document.documentElement.classList.add('arrived'); sessionStorage.setItem('arrived', '1'); } catch (e) {}
</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${body}
<script src="${base}assets/main.js" defer></script>
</body>
</html>
`;
}

function resumeHref(site, base) {
  return site.person.resume ? base + site.person.resume : `${base}#contact`;
}

function nav(site, base, { home }) {
  const links = home
    ? [['#work', 'Work'], ['#about', 'About'], ['#skills', 'Orbit'], ['#lab', 'Lab'], ['#contact', 'Contact']]
    : [[`${base}#work`, 'All work'], [`${base}#contact`, 'Contact']];
  return `<header class="topbar"><div class="nav wrap">
  <a class="brand" href="${home ? '#top' : base}" aria-label="${esc(site.person.handle)}, home">
    <span class="brand-dot" aria-hidden="true"></span><span class="chrome">${esc(site.person.handle)}</span>
  </a>
  <nav aria-label="Main">
    <ul class="nav-links" id="nav-links">
      ${links.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('\n      ')}
      <li><a class="pill pill--solid" href="${resumeHref(site, base)}">Résumé <span aria-hidden="true">↓</span></a></li>
    </ul>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Open menu">
      <svg class="icon-open" width="18" height="12" viewBox="0 0 18 12" aria-hidden="true"><path d="M0 1h18M0 11h12" stroke="currentColor" stroke-width="1.6"/></svg>
      <svg class="icon-close" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.6"/></svg>
    </button>
  </nav>
</div></header>`;
}

// The herald: an original standing figure, seen from behind.
function figure(id) {
  return `<svg class="figure" viewBox="0 0 60 130" aria-hidden="true" focusable="false">
  <defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#4E5565"/><stop offset=".45" stop-color="#F1F3F7"/><stop offset=".72" stop-color="#B7BECB"/><stop offset="1" stop-color="#3A404D"/></linearGradient></defs>
  <circle cx="30" cy="10" r="8" fill="url(#${id})"/>
  <path fill="url(#${id})" d="M27 18 L33 18 L34 22 C41 23 46 25 47 31 L50 58 C50.5 62 49 64 47.5 60 L44 36 L42 52 C42.5 60 43 64 42 70 L41 96 L42 124 C42 127 39 128 37.5 126 L35 98 L31 74 L29 74 L25 98 L22.5 126 C21 128 18 127 18 124 L19 96 L18 70 C17 64 17.5 60 18 52 L16 36 L12.5 60 C11 64 9.5 62 10 58 L13 31 C14 25 19 23 26 22 Z"/>
</svg>`;
}

// Gravity-well grid: rings sink toward a throat, spokes run from the throat to the rim.
function well({ w, h, cx, cy, rx, ry, drop, spokes = 24, cls = 'well' }) {
  const ks = [1, 0.78, 0.6, 0.46, 0.35, 0.26, 0.19, 0.13, 0.08, 0.04];
  const r = (n) => Math.round(n * 10) / 10;
  const rings = ks.map((k) => `<ellipse pathLength="1" cx="${cx}" cy="${r(cy + drop * (1 - k) ** 1.5)}" rx="${r(rx * k)}" ry="${r(ry * k)}"/>`);
  const ty = cy + drop;
  const lines = Array.from({ length: spokes }, (_, i) => {
    const a = (i / spokes) * 2 * Math.PI;
    return `<line pathLength="1" x1="${cx}" y1="${r(ty)}" x2="${r(cx + rx * Math.cos(a))}" y2="${r(cy + ry * Math.sin(a))}"/>`;
  });
  return `<svg class="${cls}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  <defs><linearGradient id="${cls}-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C8D0DE" stop-opacity="0"/><stop offset=".35" stop-color="#C8D0DE" stop-opacity=".22"/><stop offset="1" stop-color="#C8D0DE" stop-opacity=".5"/></linearGradient></defs>
  <g fill="none" stroke="url(#${cls}-fade)" stroke-width="1">${rings.join('')}${lines.join('')}</g>
</svg>`;
}

const planet = (kind, extra = '') =>
  `<span class="planet planet--${esc(kind)} ${extra}" aria-hidden="true">${kind === 'ring' ? '<span class="planet-ring"></span>' : ''}</span>`;

function extLinks(p) {
  return [
    p.live && `<a class="ext" href="${esc(p.live)}" rel="noopener">${esc(p.liveLabel ?? 'Live')} <span aria-hidden="true">↗</span></a>`,
    p.code && `<a class="ext" href="${esc(p.code)}" rel="noopener">Code <span aria-hidden="true">↗</span></a>`,
  ].filter(Boolean).join('');
}

function footer(site, base) {
  return `<footer class="footer wrap">
  <span class="label">© ${esc(site.person.year)} ${esc(site.person.name)} · designed and built by hand</span>
  <a class="label" href="${base ? base : '#top'}">${base ? 'Home' : 'Back to top'} <span aria-hidden="true">↑</span></a>
</footer>`;
}

// --- Home ----------------------------------------------------------------

function hero(site) {
  const { person, hero: h } = site;
  return `<section class="hero stars" id="top" aria-labelledby="hero-title">
  <div class="scene" aria-hidden="true">
    <div class="horizon"></div>
    <div class="layer" data-depth="0.3">${planet('corona', 'hero-planet')}</div>
    <div class="layer" data-depth="0.15">${planet('moon', 'hero-moon')}<span class="planet planet--moon hero-speck"></span></div>
    <div class="layer" data-depth="0.6">${well({ w: 1440, h: 460, cx: 1000, cy: 300, rx: 1100, ry: 200, drop: 98, cls: 'well' })}</div>
    <div class="herald"><span class="board"></span>${figure('fg-hero')}</div>
  </div>
  ${nav(site, '', { home: true })}
  <div class="hero-copy wrap" id="main">
    <p class="label label--bright" data-arrive>${esc(person.name)} · ${esc(person.role)} · ${esc(person.degree)}, ${esc(person.year)}</p>
    <h1 id="hero-title" data-arrive>
      <span class="display chrome">Building</span>
      <span class="display chrome">at the edge</span>
      <span class="voice">of the known.</span>
    </h1>
    <p class="lede" data-arrive>${esc(h.intro)}</p>
    <div class="cta" data-arrive>
      <a class="pill pill--chrome" href="#work">View the work <span aria-hidden="true">→</span></a>
      <a class="pill" href="${resumeHref(site, '')}">Résumé (PDF)</a>
      <a class="pill pill--icon" href="${esc(person.github)}" rel="noopener" aria-label="GitHub profile">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg>
      </a>
    </div>
  </div>
  <div class="hero-foot wrap">
    <p class="status"><span class="status-dot" aria-hidden="true"></span>${esc(person.status)}</p>
    <span class="label scroll-cue" aria-hidden="true">Scroll to descend ↓</span>
  </div>
</section>`;
}

function stackStrip(site) {
  const items = site.stack.map((s) => `<li>${esc(s)}</li>`).join('');
  // Second copy makes the marquee loop seamlessly; screen readers get one list.
  return `<div class="strip">
  <div class="strip-track"><ul aria-label="Technologies I use">${items}</ul><ul aria-hidden="true">${items}</ul></div>
</div>`;
}

function work(site) {
  const rows = site.projects.map((p, i) => `
    <li class="work-row"${p.cover ? ` data-shot="${esc(p.cover)}" data-alt="${esc(p.coverAlt ?? `${p.name} screenshot`)}"` : ''}>
      <span class="label work-num">${pad(i + 1)}</span>
      ${planet(p.planet, 'planet--row')}
      <div class="work-main">
        <h3 class="work-name"><a href="work/${esc(p.slug)}/">${esc(p.name)}</a></h3>
        <p>${esc(p.line)}</p>
      </div>
      <ul class="tags" aria-label="Stack">${p.tags.map((t) => `<li class="chip">${esc(t)}</li>`).join('')}</ul>
      <div class="work-links">${extLinks(p)}<span class="label">${esc(p.year)}</span></div>
    </li>`).join('');
  return `<section class="section wrap" id="work" aria-labelledby="work-title">
  <div class="section-head">
    <div class="stack">
      <p class="label">Selected work · ${pad(site.projects.length)}</p>
      <h2 class="h2" id="work-title"><span class="display chrome">${['No', 'One world', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'][site.projects.length] ?? site.projects.length}${site.projects.length > 1 ? ' worlds' : ''},</span><span class="voice">each one shipped.</span></h2>
    </div>
    <div class="stack aside">
      <p class="muted">Every project below is live or open source. Open one for the full case study.</p>
      <a class="ext" href="${esc(site.person.github)}" rel="noopener">${esc(site.person.github.replace(/^https?:\/\//, ''))} <span aria-hidden="true">↗</span></a>
    </div>
  </div>
  <ol class="work-list">${rows}
  </ol>
  <div class="preview" aria-hidden="true"><img alt="" decoding="async"></div>
</section>`;
}

function about(site) {
  const { person, about: a } = site;
  const slides = a.slides.map((s, i) => `
      <div class="slide" id="slide-${i + 1}"${i ? ' data-hidden' : ''}>
        <p class="label">About · ${pad(i + 1)} ${esc(s.label)}</p>
        ${i === 0 ? '<h2 class="h2" id="about-title"><span class="display chrome">The herald</span><span class="voice">has landed.</span></h2>' : `<h3 class="h3">${esc(s.title)}</h3>`}
        ${s.paragraphs.map((t) => `<p class="body">${esc(t)}</p>`).join('')}
      </div>`).join('');
  const facts = [['Degree', `${person.degree}, ${person.university}, ${person.year}`], ['Focus', a.focus], ['Based', person.city], ['Looking for', a.lookingFor]];
  return `<section class="band" id="about" aria-labelledby="about-title">
  <div class="wrap about">
    <div class="portrait-col">
      <div class="portrait">
        ${planet('corona', 'portrait-planet')}
        ${person.portrait ? `<img src="${esc(person.portrait)}" alt="Portrait of ${esc(person.name)}">` : `<div class="herald herald--portrait"><span class="board"></span>${figure('fg-portrait')}</div>`}
      </div>
      <div class="slider" data-slider>
        <span class="label" data-slide-now>01</span>
        <span class="slider-track"><span class="slider-fill"></span></span>
        <span class="label">${pad(a.slides.length)}</span>
        <button class="round" type="button" data-next aria-label="Next about slide" aria-controls="slides">→</button>
      </div>
    </div>
    <div class="about-copy">
      <div id="slides" aria-live="polite">${slides}
      </div>
      <dl class="facts">${facts.map(([k, v]) => `<div><dt class="label">${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    </div>
  </div>
</section>`;
}

function orbit(site) {
  const rings = [['inner', 18, -90], ['middle', 34, -150], ['outer', 50, -60]];
  const chips = rings.flatMap(([ring, radius, start]) =>
    site.skills[ring].map((name, i, all) => {
      const a = ((start + (360 / all.length) * i) * Math.PI) / 180;
      const x = (50 + radius * Math.cos(a)).toFixed(1);
      const y = (50 + radius * Math.sin(a)).toFixed(1);
      return `<span class="chip chip--${ring}" style="left:${x}%;top:${y}%">${esc(name)}</span>`;
    }));
  const rows = [['inner', 'Inner · daily'], ['middle', 'Middle · shipped'], ['outer', 'Outer · explored']];
  return `<section class="section wrap orbit" id="skills" aria-labelledby="skills-title">
  <div class="orbit-map" aria-hidden="true">
    <span class="ring ring--outer"></span><span class="ring ring--middle"></span><span class="ring ring--inner"></span><span class="core"></span>
    ${chips.join('\n    ')}
  </div>
  <div class="stack orbit-copy">
    <p class="label">Capabilities</p>
    <h2 class="h2" id="skills-title"><span class="display chrome">Orbit map</span></h2>
    <p class="muted">Distance from the centre is how often I reach for a tool. Inner ring daily, outer ring explored.</p>
    <dl class="rows">${rows.map(([k, t]) => `<div><dt class="label label--bright">${t}</dt><dd>${site.skills[k].map(esc).join(', ')}</dd></div>`).join('')}</dl>
  </div>
</section>`;
}

function lab(site) {
  const items = site.lab.map((l) => {
    const inner = `<p class="label">${esc(l.label)}</p><h3 class="lab-title">${esc(l.title)}</h3><p class="muted">${esc(l.text)}</p>`;
    return l.href
      ? `<li><a class="lab-item" href="${esc(l.href)}" rel="noopener">${inner}<span class="ext">Read the write-up <span aria-hidden="true">→</span></span></a></li>`
      : `<li class="lab-item">${inner}</li>`;
  }).join('');
  return `<section class="band" id="lab" aria-labelledby="lab-title">
  <div class="wrap section section--tight">
    <div class="section-head">
      <h2 class="h2 h2--inline" id="lab-title"><span class="display chrome">From the lab</span> <span class="voice">tested, then trusted.</span></h2>
      <p class="muted aside">Research projects where the honest answer was “no”, and how I got to it.</p>
    </div>
    <ul class="lab-list">${items}</ul>
  </div>
</section>`;
}

function contact(site) {
  const p = site.person;
  return `<section class="contact stars" id="contact" aria-labelledby="contact-title">
  <div class="contact-scene" aria-hidden="true">
    ${well({ w: 1440, h: 300, cx: 1120, cy: 250, rx: 700, ry: 120, drop: 30, spokes: 0, cls: 'well-small' })}
    <div class="herald herald--small"><span class="board"></span>${figure('fg-contact')}</div>
  </div>
  <div class="wrap contact-copy">
    <p class="label">Contact</p>
    <h2 class="h2 h2--huge" id="contact-title"><span class="display chrome">Send a</span><span class="voice">signal.</span></h2>
    <div class="email-row">
      <span class="email" id="email">${esc(p.email)}</span>
      <button class="pill pill--accent" type="button" data-copy="email">Copy email</button>
      <span class="label copy-status" role="status"></span>
    </div>
    <ul class="contact-links">
      <li><a class="ext" href="${esc(p.github)}" rel="noopener">GitHub <span aria-hidden="true">↗</span></a></li>
      ${isUrl(p.linkedin) ? `<li><a class="ext" href="${esc(p.linkedin)}" rel="noopener">LinkedIn <span aria-hidden="true">↗</span></a></li>` : ''}
      <li><a class="ext" href="${resumeHref(site, '')}">Résumé (PDF) <span aria-hidden="true">↓</span></a></li>
    </ul>
  </div>
  ${footer(site, '')}
</section>`;
}

export function home(site) {
  const { person } = site;
  return layout({
    site,
    base: '',
    title: `${person.name}: ${person.role}`,
    description: site.hero.description,
    body: `${hero(site)}\n<main>\n${stackStrip(site)}\n${work(site)}\n${about(site)}\n${orbit(site)}\n${lab(site)}\n</main>\n${contact(site)}`,
  });
}

// --- Case study ----------------------------------------------------------

function shot(src, alt, caption) {
  return src
    ? `<figure class="shot"><img src="../../${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async">${caption ? `<figcaption class="label">${esc(caption)}</figcaption>` : ''}</figure>`
    : `<figure class="shot shot--empty" aria-hidden="true"><span class="shot-rings"></span>${caption ? `<figcaption class="label">${esc(caption)}</figcaption>` : ''}</figure>`;
}

export function caseStudy(site, p, i) {
  const n = site.projects.length;
  const next = site.projects[(i + 1) % n];
  const base = '../../';
  const meta = [['Role', p.role], ['Year', p.year], ['Stack', p.tags.join(', ')]];
  const body = `<div class="case-hero stars">
  ${nav(site, base, { home: false })}
  ${planet(p.planet, 'case-planet')}
  <div class="wrap case-head" id="main">
    <a class="label back" href="${base}#work">← Selected work</a>
    <p class="label label--accent">Case study · ${pad(i + 1)} of ${pad(n)}</p>
    <h1><span class="display display--xl chrome">${esc(p.name)}</span><span class="voice">${esc(p.tagline)}</span></h1>
    <p class="lede">${esc(p.summary)}</p>
    <dl class="meta">
      ${meta.map(([k, v]) => `<div><dt class="label">${k}</dt><dd>${esc(v)}</dd></div>`).join('')}
      <div><dt class="label">Links</dt><dd class="meta-links">${extLinks(p) || 'Private repository'}</dd></div>
    </dl>
  </div>
</div>
<main>
  <section class="wrap case-shot">${shot(p.cover, p.coverAlt ?? `${p.name} screenshot`, p.coverCaption)}</section>
  <section class="wrap two-col">
    <div class="stack"><p class="label">The problem</p><h2 class="h3">${esc(p.problem.title)}</h2><p class="body muted">${esc(p.problem.text)}</p></div>
    <div class="stack"><p class="label">What I built</p><h2 class="h3">${esc(p.built.title)}</h2><p class="body muted">${esc(p.built.text)}</p></div>
  </section>
  <section class="wrap features" aria-label="Features">
    ${p.features.map((f) => `<article class="feature">${f.shot ? shot(f.shot, f.alt ?? f.title) : ''}<h3>${esc(f.title)}</h3><p class="muted">${esc(f.text)}</p></article>`).join('\n    ')}
  </section>
  <section class="band" aria-labelledby="arch-title">
    <div class="wrap section section--tight stack">
      <p class="label">Architecture</p>
      <h2 class="h3" id="arch-title">${esc(p.archTitle ?? 'How it fits together')}</h2>
      <ol class="arch">${p.arch.map((b, k) => `<li class="arch-box${k === p.arch.length - 1 ? ' arch-box--end' : ''}"><strong>${esc(b.title)}</strong><span>${esc(b.text)}</span></li>`).join('')}</ol>
    </div>
  </section>
  <section class="wrap section lessons" aria-labelledby="lessons-title">
    <h2 class="label" id="lessons-title">What I learned</h2>
    <ul>${p.lessons.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
  </section>
</main>
<a class="next stars" href="../${esc(next.slug)}/">
  <span class="wrap next-inner">
    <span class="stack"><span class="label">Next world · ${pad(((i + 1) % n) + 1)}</span><span class="display display--lg chrome">${esc(next.name)} <span aria-hidden="true">→</span></span></span>
    ${planet(next.planet, 'next-planet')}
  </span>
</a>
${footer(site, base)}`;
  return layout({ site, base, title: `${p.name}: case study · ${site.person.name}`, description: p.summary, body });
}
