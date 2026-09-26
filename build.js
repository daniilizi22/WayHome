// Генерирует статические страницы стихов для поисковиков и превью ссылок.
// Источник — массив POEMS в index.html. Запуск: node build.js
const fs = require('fs');
const path = require('path');

const SITE = 'https://daniilizi22.github.io/WayHome/';
const TITLE = 'Путь Домой';
const AUTHOR = 'Даниил Побережный';
const ROOT = __dirname;
const OUT = path.join(ROOT, 'poems');

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const line = html.split('\n').find(l => l.startsWith('const POEMS = '));
const POEMS = JSON.parse(line.slice('const POEMS = '.length).replace(/;\s*$/, ''));

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const firstLine = p => p.stanzas[0][0].replace(/[\s,.;:!?…—–-]+$/, '');
const excerpt = p => p.stanzas[0].join(' / ');

function pluralPoems(n) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return `${n} стих`;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `${n} стиха`;
  return `${n} стихов`;
}

const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com">\n  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Cormorant+SC:wght@300;400&display=swap" rel="stylesheet">';
const COUNTER = '<script data-goatcounter="https://daniilizi22.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>';

// Те же цвета и шрифты, что на главной
const CSS = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root { --bg: #0e0d0b; --bg2: #141310; --ink: #e8e0d0; --ink-muted: #7a7060; --ink-faint: #2e2c28; --gold: #c9a84c; --gold-dim: #7a6230; }
    html, body { min-height: 100dvh; background: var(--bg); color: var(--ink); font-family: 'Cormorant Garamond', Georgia, serif; -webkit-font-smoothing: antialiased; }
    a { color: inherit; text-decoration: none; }
    .page { min-height: 100dvh; display: flex; flex-direction: column; }
    header { padding: 2rem 2.5rem 1.5rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; border-bottom: 1px solid var(--ink-faint); }
    .brand a { font-family: 'Cormorant SC', serif; font-weight: 300; font-size: clamp(1.2rem, 3vw, 1.6rem); letter-spacing: 0.25em; text-transform: uppercase; white-space: nowrap; }
    .brand p { font-style: italic; font-size: 0.9rem; color: var(--ink-muted); margin-top: 0.25rem; letter-spacing: 0.05em; }
    .header-controls { display: flex; gap: 0.5rem; align-items: center; }
    .btn-icon { background: none; border: 1px solid var(--ink-faint); color: var(--ink-muted); width: 2.2rem; height: 2.2rem; border-radius: 50%; cursor: pointer; font-size: 0.9rem; }
    .btn-pill { background: none; border: 1px solid var(--ink-muted); color: var(--ink); padding: 0.7rem 1.6rem; border-radius: 99px; cursor: pointer; font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 500; font-size: 1.2rem; letter-spacing: 0.04em; transition: border-color 0.2s; display: inline-flex; align-items: center; gap: 0.4rem; white-space: nowrap; }
    .btn-pill:hover { border-color: var(--ink); }
    .btn-accent { color: var(--gold); border-color: var(--gold-dim); }
    .btn-accent:hover { border-color: var(--gold); }
    .header-controls .btn-pill { padding: 0.4rem 1.1rem; font-size: 1.1rem; }
    main { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 1rem 1.5rem 3rem; gap: 2rem; }
    .poem-label { text-align: center; }
    .tag { font-family: 'Cormorant SC', serif; font-size: 1rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); }
    .num { font-weight: 400; font-size: clamp(1.7rem, 4.5vw, 2.1rem); line-height: 1; color: var(--gold); margin-top: 0.5rem; font-variant-numeric: lining-nums; }
    .num .no { font-size: 0.55em; color: var(--gold-dim); margin-right: 0.15em; }
    .ornament { color: var(--gold-dim); margin-top: 0.6rem; }
    article { width: 100%; max-width: 480px; text-align: center; display: flex; flex-direction: column; gap: 1.8rem; }
    .stanza { display: flex; flex-direction: column; gap: 0.3rem; }
    .stanza span { font-size: clamp(1.1rem, 2.2vw, 1.3rem); font-weight: 300; line-height: 1.7; letter-spacing: 0.03em; }
    .poem-nav { display: flex; align-items: center; gap: 1.5rem; }
    .btn-nav { border: 1px solid var(--ink-faint); color: var(--ink-muted); width: 3.4rem; height: 3.4rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; transition: color 0.2s, border-color 0.2s; }
    .btn-nav:hover { color: var(--ink); border-color: var(--ink-muted); }
    .poem-counter { font-family: 'Cormorant SC', serif; font-size: 1.05rem; letter-spacing: 0.2em; opacity: 0.75; min-width: 6rem; text-align: center; font-variant-numeric: lining-nums; }
    .actions { display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; }
    h1.page-title { font-family: 'Cormorant SC', serif; font-weight: 400; font-size: 1.4rem; letter-spacing: 0.25em; color: var(--gold); text-align: center; }
    .page-sub { font-style: italic; color: var(--ink-muted); text-align: center; margin-top: 0.3rem; }
    .toc { width: 100%; max-width: 560px; list-style: none; }
    .toc a { display: flex; align-items: baseline; gap: 1rem; padding: 0.75rem 0.25rem; border-bottom: 1px solid var(--ink-faint); transition: background 0.2s; }
    .toc a:hover { background: rgba(201,168,76,0.06); }
    .toc .n { font-family: 'Cormorant SC', serif; font-size: 1.15rem; color: var(--gold); min-width: 2.6rem; font-variant-numeric: lining-nums; }
    .toc .first { font-size: 1.15rem; font-weight: 300; }
    footer { text-align: center; padding: 1.5rem; font-style: italic; font-size: 0.85rem; color: var(--ink-muted); border-top: 1px solid var(--ink-faint); }
    @media (max-width: 600px) {
      header { padding: 1.2rem 1rem 1rem; }
      .brand a { font-size: 1.1rem; letter-spacing: 0.16em; }
      .header-controls .btn-pill { padding: 0.35rem 0.9rem; font-size: 1.05rem; }
      main { padding: 0.5rem 1rem 2rem; gap: 1.5rem; }
      article { text-align: left; gap: 2rem; padding: 0 0.5rem; }
      .stanza span { font-size: 1.25rem; line-height: 1.8; }
    }
    @media print { .header-controls, .poem-nav, .actions, footer { display: none; } body { background: white; color: black; } }`;

function page({ title, description, url, body, script = '' }) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="author" content="${AUTHOR}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${TITLE}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:locale" content="ru_RU">
  ${FONTS}
  <style>${CSS}
  </style>
</head>
<body>
<div class="page">
  <header>
    <div class="brand">
      <a href="../">Путь Домой</a>
      <p>${AUTHOR}</p>
    </div>
    <div class="header-controls">
      <a class="btn-pill btn-accent" href="./">☰ Все стихи</a>
    </div>
  </header>
${body}
  <footer>Сборник духовной поэзии «${TITLE}» · 2026</footer>
</div>
<script>${script}
</script>
${COUNTER}
</body>
</html>
`;
}

function poemPage(p, i) {
  const prev = POEMS[(i - 1 + POEMS.length) % POEMS.length];
  const next = POEMS[(i + 1) % POEMS.length];
  const stanzas = p.stanzas.map(s =>
    `      <div class="stanza">${s.map(l => `<span>${esc(l)}</span>`).join('')}</div>`
  ).join('\n');
  return page({
    title: `№ ${p.id} · ${firstLine(p)} — ${TITLE}`,
    description: `${excerpt(p)} — стихотворение из сборника духовной поэзии «${TITLE}», ${AUTHOR}.`,
    url: `${SITE}poems/${p.id}.html`,
    body: `
  <main>
    <div class="poem-label">
      <div class="tag">Стих</div>
      <div class="num"><span class="no">№</span>${p.id}</div>
      <div class="ornament">✦</div>
    </div>
    <article>
${stanzas}
    </article>
    <nav class="poem-nav">
      <a class="btn-nav" href="${prev.id}.html" rel="prev" title="Предыдущий">&#8592;</a>
      <div class="poem-counter">${i + 1} / ${POEMS.length}</div>
      <a class="btn-nav" href="${next.id}.html" rel="next" title="Следующий">&#8594;</a>
    </nav>
    <div class="actions">
      <a class="btn-pill btn-accent" href="../">✦ Случайный стих</a>
      <button class="btn-pill" onclick="share()">&#8599; Поделиться</button>
    </div>
  </main>`,
    script: `
  function share() {
    var url = location.origin + location.pathname;
    var done = function () { var b = document.querySelector('.actions button'); b.textContent = 'Ссылка скопирована'; setTimeout(function () { b.innerHTML = '&#8599; Поделиться'; }, 2000); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(done);
  }
  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowLeft') location.href = '${prev.id}.html';
    if (e.key === 'ArrowRight') location.href = '${next.id}.html';
  });`
  });
}

function tocPage() {
  const items = POEMS.map(p =>
    `      <li><a href="${p.id}.html"><span class="n">${p.id}</span><span class="first">${esc(p.stanzas[0][0])}</span></a></li>`
  ).join('\n');
  return page({
    title: `Все стихи — ${TITLE} · ${AUTHOR}`,
    description: `Оглавление сборника духовной поэзии «${TITLE}»: ${pluralPoems(POEMS.length)}, автор — ${AUTHOR}.`,
    url: `${SITE}poems/`,
    body: `
  <main>
    <div>
      <h1 class="page-title">Все стихи</h1>
      <p class="page-sub">Сборник духовной поэзии «${TITLE}» · ${pluralPoems(POEMS.length)}</p>
    </div>
    <ul class="toc">
${items}
    </ul>
  </main>`
  });
}

function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [SITE, `${SITE}poems/`, ...POEMS.map(p => `${SITE}poems/${p.id}.html`)];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);
POEMS.forEach((p, i) => fs.writeFileSync(path.join(OUT, `${p.id}.html`), poemPage(p, i)));
fs.writeFileSync(path.join(OUT, 'index.html'), tocPage());
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap());
console.log(`Готово: ${POEMS.length} страниц стихов, оглавление poems/index.html, sitemap.xml`);
