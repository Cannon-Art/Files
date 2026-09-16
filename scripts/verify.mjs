/**
 * Local pre-push checks (no GitHub, no extra npm dependencies).
 * Run: npm test   or   node scripts/verify.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const REQUIRED_SECTIONS = [
    'dc-characters',
    'marvel-characters',
    'music-legends',
    'recovery-art',
    'miscellaneous'
];

let failures = 0;

function fail(message) {
    console.error(`FAIL: ${message}`);
    failures += 1;
}

function pass(message) {
    console.log(`OK:  ${message}`);
}

function checkJavaScriptSyntax() {
    const files = readdirSync(ROOT).filter((f) => f.endsWith('.js'));
    if (files.length === 0) {
        fail('No .js files found in project root');
        return;
    }
    for (const name of files.sort()) {
        const full = join(ROOT, name);
        const result = spawnSync(process.execPath, ['--check', full], {
            encoding: 'utf8'
        });
        if (result.status !== 0) {
            fail(`${name} — syntax error (node --check)`);
            if (result.stderr) console.error(result.stderr);
        } else {
            pass(`${name} — syntax OK`);
        }
    }
}

function checkGalleryData() {
    const path = join(ROOT, 'gallery-data.json');
    let data;
    try {
        data = JSON.parse(readFileSync(path, 'utf8'));
    } catch (e) {
        fail(`gallery-data.json — ${e.message}`);
        return;
    }
    if (!data || typeof data !== 'object') {
        fail('gallery-data.json — root must be an object');
        return;
    }
    if (!data.sections || typeof data.sections !== 'object') {
        fail('gallery-data.json — missing "sections" object');
        return;
    }
    for (const key of REQUIRED_SECTIONS) {
        if (!(key in data.sections)) {
            fail(`gallery-data.json — missing section "${key}"`);
            continue;
        }
        if (!Array.isArray(data.sections[key])) {
            fail(`gallery-data.json — sections["${key}"] must be an array`);
        }
    }
    pass('gallery-data.json — structure OK');

    const dc = data.sections['dc-characters'] || [];
    if (!dc.some((pic) => pic && pic.name === 'The Joker - Multiple Expressions')) {
        fail('gallery-data.json — DC Characters missing The Joker - Multiple Expressions');
    }
    if (dc.some((pic) => pic && (pic.name === 'The Joker' || String(pic.imageUrl || '').includes('The_Joker.JPG')))) {
        fail('gallery-data.json — DC Characters still includes The Joker artwork');
    } else {
        pass('gallery-data.json — DC Characters uses Multiple Expressions only');
    }

    for (const key of REQUIRED_SECTIONS) {
        const arr = data.sections[key];
        if (!Array.isArray(arr)) continue;
        arr.forEach((pic, i) => {
            if (!pic || typeof pic !== 'object') {
                fail(`gallery-data.json — ${key}[${i}] must be an object`);
                return;
            }
            for (const field of ['id', 'name', 'imageUrl']) {
                if (pic[field] === undefined || pic[field] === null || String(pic[field]).trim() === '') {
                    fail(`gallery-data.json — ${key}[${i}] missing or empty "${field}"`);
                }
            }
        });
    }
}

function checkControlPanelUi() {
    const path = join(ROOT, 'control-panel.html');
    let html;
    try {
        html = readFileSync(path, 'utf8');
    } catch (e) {
        fail(`control-panel.html — ${e.message}`);
        return;
    }

    const forbidden = [
        ['Regenerate All HTML Files', 'manual regenerate button'],
        ['Export JSON Data', 'manual JSON export section'],
        ['id="jsonOutput"', 'JSON export textarea'],
        ['regenerateAllHTML()', 'regenerate onclick handler']
    ];

    for (const [needle, label] of forbidden) {
        if (html.includes(needle)) {
            fail(`control-panel.html — unexpected ${label} still present`);
        }
    }

    if (!html.includes('Edit Existing Pictures')) {
        fail('control-panel.html — missing Edit Existing Pictures section');
    }
    if (!html.includes('id="usernameInput"')) {
        fail('control-panel.html — missing username login field');
    }
    if (!html.includes('Token Admin') || !html.includes('panelViewDelete')) {
        fail('control-panel.html — missing panel submenu views');
    }
    if (html.includes('Regenerate All HTML Files') || html.includes('Export JSON Data')) {
        fail('control-panel.html — advanced regenerate/export UI still present');
    } else {
        pass('control-panel.html — panel submenu and simplified admin UI');
    }

    const jsPath = join(ROOT, 'control-panel.js');
    let js;
    try {
        js = readFileSync(jsPath, 'utf8');
    } catch (e) {
        fail(`control-panel.js — ${e.message}`);
        return;
    }

    if (!js.includes('ADMIN_ACCOUNTS') || !js.includes('liam1davis@icloud.com') || !js.includes('cannonno1@icloud.com') || !js.includes('isAllowedAdminLogin')) {
        fail('control-panel.js — hardcoded admin username/password access control missing');
        return;
    }

    if (!js.includes('async function deletePicture') || !js.includes('callHTMLGenerator(galleryData)')) {
        fail('control-panel.js — delete/edit HTML sync helpers missing');
        return;
    }

    // Delete should regenerate HTML, not only update JSON
    const deleteFn = js.slice(js.indexOf('async function deletePicture'));
    const deleteBody = deleteFn.slice(0, deleteFn.indexOf('\nasync function ') > 0
        ? deleteFn.indexOf('\nasync function ')
        : deleteFn.indexOf('\nfunction showSection'));
    if (!deleteBody.includes('callHTMLGenerator')) {
        fail('control-panel.js — deletePicture does not regenerate HTML files');
    } else {
        pass('control-panel.js — deletePicture syncs JSON + HTML');
    }
}

function checkFreeAnalytics() {
    // Visit data used to reach a Netlify function on the Paul Casso site via
    // analytics.js -> simple-analytics.js, reachable only from the archived
    // pages' cookie banner. All of that is gone; the official Simple Analytics
    // tag is the only analytics now. Paul Casso's site is unaffected - it owns
    // that function, and this repo was only ever one of its callers.
    let unwired = true;
    for (const name of ['analytics.js', 'simple-analytics.js']) {
        if (existsSync(join(ROOT, name))) {
            fail(`${name} — retired Netlify analytics file has reappeared`);
            unwired = false;
        }
    }
    const scanned = [
        ...readdirSync(ROOT)
            .filter((f) => f.endsWith('.js') || f.endsWith('.html'))
            .map((f) => ['', f]),
        ...(existsSync(join(ROOT, 'Archive'))
            ? readdirSync(join(ROOT, 'Archive'))
                  .filter((f) => f.endsWith('.html'))
                  .map((f) => ['Archive', f])
            : [])
    ];
    for (const [dir, name] of scanned) {
        const body = readFileSync(join(ROOT, dir, name), 'utf8');
        const label = dir ? `${dir}/${name}` : name;
        if (body.includes('.netlify/functions/analytics')) {
            fail(`${label} — still posts to the Netlify analytics function`);
            unwired = false;
        }
        if (body.includes('plausible.io')) {
            fail(`${label} — Plausible script is back`);
            unwired = false;
        }
    }
    if (unwired) {
        pass('Netlify analytics wiring removed (Paul Casso site untouched)');
    }

    const panel = readFileSync(join(ROOT, 'control-panel.html'), 'utf8');
    if (!panel.includes('panelViewAnalytics')) {
        fail('control-panel.html — missing Analytics tab');
    } else {
        pass('control-panel.html — Analytics tab present');
    }

    const generator = readFileSync(join(ROOT, 'html-generator.js'), 'utf8');
    if (!generator.includes('scripts.simpleanalyticscdn.com/latest.js') || !generator.includes('data-hostname="cannon-art.uk.eu.org"') || generator.includes('id="cookie-consent"')) {
        fail('html-generator.js — should emit official Simple Analytics and no cookie banner');
    } else {
        pass('html-generator.js — official Simple Analytics, no cookie banner');
    }

    const publicPages = [
        'index.html',
        'control-panel.html',
        'miscellaneous.html',
        'music-legends.html',
        'recovery-art.html',
        'marvel-characters.html',
        'dc-characters.html',
        'the-who.html',
        'rolling-stones.html',
        'terms-of-use.html',
        'batman.html'
    ];
    let analyticsOk = true;
    for (const name of publicPages) {
        const html = readFileSync(join(ROOT, name), 'utf8');
        if (html.includes('id="cookie-consent"')) {
            fail(`${name} — cookie consent banner still present`);
            analyticsOk = false;
        }
        if (!html.includes('scripts.simpleanalyticscdn.com/latest.js')) {
            fail(`${name} — missing official Simple Analytics script`);
            analyticsOk = false;
        }
    }
    if (analyticsOk) {
        pass('public pages — official Simple Analytics, no cookie banner');
    }

    const dash = readFileSync(join(ROOT, 'analytics-dashboard.js'), 'utf8');
    if (!dash.includes('cannon-art.uk.eu.org') || !dash.includes('simpleanalytics.com/')) {
        fail('analytics-dashboard.js — not reading Cannon Art Simple Analytics');
    } else if (dash.includes('paulcasso-website.netlify.app')) {
        fail('analytics-dashboard.js — still using old Netlify store URL');
    } else {
        pass('analytics-dashboard.js — Simple Analytics for cannon-art.uk.eu.org');
    }

    const panelJs = readFileSync(join(ROOT, 'control-panel.js'), 'utf8');
    if (panelJs.includes('function saveSimpleAnalyticsKeys') || panel.includes('saveSimpleAnalyticsKeys()')) {
        fail('Token Admin still has Simple Analytics API key controls');
    } else {
        pass('Token Admin — GitHub token only');
    }

    const archivePath = join(ROOT, 'scripts', 'archive-simple-analytics.mjs');
    const archiveCheck = spawnSync(process.execPath, ['--check', archivePath], { encoding: 'utf8' });
    if (archiveCheck.status !== 0) {
        fail('scripts/archive-simple-analytics.mjs — syntax error');
        if (archiveCheck.stderr) console.error(archiveCheck.stderr);
    } else {
        pass('scripts/archive-simple-analytics.mjs — syntax OK');
    }

    const workflow = readFileSync(join(ROOT, '.github', 'workflows', 'archive-simple-analytics.yml'), 'utf8');
    if (!dash.includes('simple-analytics-archive.json')) {
        fail('analytics-dashboard.js — missing archive figures');
    } else if (!workflow.includes('cannon-art.uk.eu.org') || !workflow.includes('cron:')) {
        fail('archive workflow — missing Cannon Art monthly schedule');
    } else {
        pass('Simple Analytics monthly archive is configured');
    }

    let hostnameOk = true;
    for (const name of publicPages) {
        const html = readFileSync(join(ROOT, name), 'utf8');
        if (!html.includes('data-hostname="cannon-art.uk.eu.org"')) {
            fail(`${name} — Simple Analytics missing cannon-art.uk.eu.org hostname`);
            hostnameOk = false;
        }
    }
    if (hostnameOk) {
        pass('public pages — Simple Analytics hostname is cannon-art.uk.eu.org');
    }

    const indexHtml = readFileSync(join(ROOT, 'index.html'), 'utf8');
    if (indexHtml.includes('Art_Examples/The_Joker.JPG')) {
        fail('index.html — DC Characters gallery card still uses The Joker image');
    } else if (!indexHtml.includes('Art_Examples/Marvel_Pic10.JPEG')) {
        fail('index.html — DC Characters gallery card missing Multiple Expressions image');
    } else {
        pass('index.html — DC Characters card uses Multiple Expressions');
    }

    const dcHtml = readFileSync(join(ROOT, 'dc-characters.html'), 'utf8');
    if (dcHtml.includes('The_Joker.JPG') || dcHtml.includes('The Joker (2026)')) {
        fail('dc-characters.html — The Joker artwork is still in the collection');
    } else if (!dcHtml.includes('The Joker - Multiple Expressions')) {
        fail('dc-characters.html — missing The Joker - Multiple Expressions');
    } else {
        pass('dc-characters.html — collection shows Multiple Expressions only');
    }
}

/**
 * Search-engine checks.
 *
 * cannon-art.github.io and the www subdomain both 301 to SITE_ORIGIN, so any
 * canonical, social or sitemap URL naming them points search engines at an
 * address that redirects. These checks exist because html-generator.js rebuilds
 * the gallery pages from the control panel, which would otherwise quietly
 * reintroduce the old host.
 */
const SITE_ORIGIN = 'https://cannon-art.uk.eu.org';

const INDEXABLE_PAGES = [
    'index.html',
    'dc-characters.html',
    'marvel-characters.html',
    'music-legends.html',
    'recovery-art.html',
    'miscellaneous.html',
    'batman.html',
    'the-who.html',
    'rolling-stones.html'
];

const NOINDEX_PAGES = ['control-panel.html', 'terms-of-use.html'];

function canonicalFor(name) {
    return name === 'index.html' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}/${name}`;
}

function checkSeo() {
    // Only real attribute values matter; explanatory comments may mention the old host.
    const staleHost = /(?:href|content)="https:\/\/cannon-art\.github\.io/;

    let canonicalsOk = true;
    let headingsOk = true;
    for (const name of INDEXABLE_PAGES) {
        const html = readFileSync(join(ROOT, name), 'utf8');

        const canonical = (html.match(/rel="canonical"\s+href="([^"]+)"/) || [])[1];
        if (canonical !== canonicalFor(name)) {
            fail(`${name} — canonical is "${canonical}", expected "${canonicalFor(name)}"`);
            canonicalsOk = false;
        }
        if (staleHost.test(html)) {
            fail(`${name} — still points at cannon-art.github.io, which redirects`);
            canonicalsOk = false;
        }
        if (!html.includes('<meta name="robots" content="index, follow">')) {
            fail(`${name} — missing an indexable robots tag`);
            canonicalsOk = false;
        }

        const h1Count = (html.match(/<h1[\s>]/g) || []).length;
        if (h1Count !== 1) {
            fail(`${name} — has ${h1Count} <h1> elements, expected exactly 1`);
            headingsOk = false;
        }
        if (/<h1[^>]*class="logo"/.test(html)) {
            fail(`${name} — the logo is the <h1>, so the page topic is not the heading`);
            headingsOk = false;
        }
    }
    if (canonicalsOk) pass(`public pages — canonical and social URLs use ${SITE_ORIGIN}`);
    if (headingsOk) pass('public pages — exactly one topic-describing <h1> each');

    let noindexOk = true;
    for (const name of NOINDEX_PAGES) {
        const html = readFileSync(join(ROOT, name), 'utf8');
        if (!/<meta name="robots" content="noindex/.test(html)) {
            fail(`${name} — should be noindex but is crawlable`);
            noindexOk = false;
        }
    }
    if (noindexOk) pass('control panel and terms pages — kept out of search results');

    const sitemap = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
    let sitemapOk = true;
    if (sitemap.charCodeAt(0) === 0xfeff || !sitemap.startsWith('<?xml')) {
        fail('sitemap.xml — must start with an XML declaration and have no BOM');
        sitemapOk = false;
    }
    if (sitemap.includes('<!--')) {
        fail('sitemap.xml — comments can make Google report Sitemap could not be read');
        sitemapOk = false;
    }
    if (!sitemap.includes('<urlset') || (sitemap.match(/<loc>/g) || []).length < INDEXABLE_PAGES.length) {
        fail('sitemap.xml — XML structure is incomplete');
        sitemapOk = false;
    }
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    for (const loc of locs) {
        if (!loc.startsWith(`${SITE_ORIGIN}/`)) {
            fail(`sitemap.xml — "${loc}" is not on ${SITE_ORIGIN}`);
            sitemapOk = false;
        }
    }
    for (const name of INDEXABLE_PAGES) {
        if (!locs.includes(canonicalFor(name))) {
            fail(`sitemap.xml — missing ${canonicalFor(name)}`);
            sitemapOk = false;
        }
    }
    for (const name of NOINDEX_PAGES) {
        if (locs.includes(canonicalFor(name))) {
            fail(`sitemap.xml — lists ${name}, which is noindex`);
            sitemapOk = false;
        }
    }
    if (sitemapOk) pass(`sitemap.xml — ${locs.length} canonical URLs, no noindex pages`);

    const robots = readFileSync(join(ROOT, 'robots.txt'), 'utf8');
    if (!robots.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`)) {
        fail('robots.txt — Sitemap line must use the canonical domain');
    } else {
        pass('robots.txt — points at the canonical sitemap');
    }
}

/**
 * Runs the generator the control panel uses and inspects what it produces, so a
 * regression is caught here rather than after the pages are republished.
 */
function checkGeneratedPages() {
    const src = readFileSync(join(ROOT, 'html-generator.js'), 'utf8');
    let api;
    try {
        api = new Function(
            'window',
            'document',
            `${src}\nreturn { generateGalleryHTML, SECTION_METADATA };`
        )({}, {});
    } catch (e) {
        fail(`html-generator.js — could not be evaluated: ${e.message}`);
        return;
    }

    const data = JSON.parse(readFileSync(join(ROOT, 'gallery-data.json'), 'utf8'));
    let ok = true;
    for (const id of REQUIRED_SECTIONS) {
        const pictures = (data.sections && data.sections[id]) || [];
        let html;
        try {
            html = api.generateGalleryHTML(id, pictures, api.SECTION_METADATA[id]);
        } catch (e) {
            fail(`html-generator.js — generating ${id} threw: ${e.message}`);
            ok = false;
            continue;
        }
        const canonical = (html.match(/rel="canonical"\s+href="([^"]+)"/) || [])[1];
        if (canonical !== `${SITE_ORIGIN}/${id}.html`) {
            fail(`html-generator.js — ${id} canonical is "${canonical}"`);
            ok = false;
        }
        if (!/<h1 class="hero-title">/.test(html)) {
            fail(`html-generator.js — ${id} does not use <h1> for the page topic`);
            ok = false;
        }
        if (!/aria-expanded="false" aria-controls="mainNav"/.test(html)) {
            fail(`html-generator.js — ${id} menu button is missing its ARIA state`);
            ok = false;
        }
        if (pictures.length > 0) {
            if (!/class="gallery-image" width="1600" height="1200" fetchpriority="high"/.test(html)) {
                fail(`html-generator.js — ${id} first artwork is not reserved and eagerly fetched`);
                ok = false;
            }
        }
        if (pictures.length > 1 && !/class="gallery-image" width="1600" height="1200" loading="lazy"/.test(html)) {
            fail(`html-generator.js — ${id} later artworks should lazy-load`);
            ok = false;
        }
    }
    if (ok) pass('html-generator.js — regenerated pages keep canonical, <h1>, ARIA and reserved image frames');
}

function checkImageLayout() {
    const indexHtml = readFileSync(join(ROOT, 'index.html'), 'utf8');
    const cards = [...indexHtml.matchAll(/<img[^>]*class="collection-image"[^>]*>/g)].map((m) => m[0]);
    let ok = true;
    if (cards.length === 0) {
        fail('index.html — no collection thumbnails found');
        return;
    }
    if (!cards[0].includes('fetchpriority="high"') || cards[0].includes('loading="lazy"')) {
        fail('index.html — first collection image should load immediately');
        ok = false;
    }
    cards.forEach((tag, i) => {
        if (!/width="1600"/.test(tag) || !/height="1200"/.test(tag)) {
            fail(`index.html — collection image ${i + 1} is missing a reserved 4:3 frame`);
            ok = false;
        }
        if (i > 0 && !tag.includes('loading="lazy"')) {
            fail(`index.html — collection image ${i + 1} should lazy-load`);
            ok = false;
        }
    });

    const galleryPages = [
        'dc-characters.html',
        'marvel-characters.html',
        'recovery-art.html',
        'miscellaneous.html',
        'batman.html',
        'the-who.html',
        'rolling-stones.html'
    ];
    for (const name of galleryPages) {
        const html = readFileSync(join(ROOT, name), 'utf8');
        const imgs = [...html.matchAll(/<img[^>]*class="gallery-image"[^>]*>/g)].map((m) => m[0]);
        if (imgs.length === 0) {
            fail(`${name} — no gallery images found`);
            ok = false;
            continue;
        }
        imgs.forEach((tag, i) => {
            if (!/width="1600"/.test(tag) || !/height="1200"/.test(tag)) {
                fail(`${name} — gallery image ${i + 1} is missing a reserved 4:3 frame`);
                ok = false;
            }
        });
        if (!imgs[0].includes('fetchpriority="high"') || imgs[0].includes('loading="lazy"')) {
            fail(`${name} — first artwork should load immediately`);
            ok = false;
        }
    }
    if (ok) pass('gallery thumbnails — reserved 4:3 frames, first image loads immediately');
}

console.log('Local verify (pre-push)\n');
checkJavaScriptSyntax();
console.log('');
checkGalleryData();
console.log('');
checkControlPanelUi();
console.log('');
checkFreeAnalytics();
console.log('');
checkSeo();
console.log('');
checkGeneratedPages();
console.log('');
checkImageLayout();

if (failures > 0) {
    console.error(`\n${failures} check(s) failed. Fix issues before pushing to GitHub.\n`);
    process.exit(1);
}
console.log('\nAll checks passed. Safe to commit and push.\n');
process.exit(0);
