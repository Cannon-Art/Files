/**
 * Local pre-push checks (no GitHub, no extra npm dependencies).
 * Run: npm test   or   node scripts/verify.mjs
 */
import { readFileSync, readdirSync } from 'fs';
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

console.log('Local verify (pre-push)\n');
checkJavaScriptSyntax();
console.log('');
checkGalleryData();
console.log('');
checkControlPanelUi();

if (failures > 0) {
    console.error(`\n${failures} check(s) failed. Fix issues before pushing to GitHub.\n`);
    process.exit(1);
}
console.log('\nAll checks passed. Safe to commit and push.\n');
process.exit(0);
