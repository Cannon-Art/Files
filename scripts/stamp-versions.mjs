/**
 * Version the control panel's scripts by their content.
 *
 * control-panel.html loads html-generator.js and control-panel.js with a
 * ?v= value. Browsers keep the old file until that value changes, and the
 * control panel then rebuilds gallery pages with an out-of-date generator,
 * quietly undoing recent changes (this happened in November 2026). Using a
 * short hash of each file's content means the value changes whenever the
 * file does, so a browser can never use a stale copy.
 *
 * Run: npm run stamp      (updates control-panel.html)
 * scripts/verify.mjs checks the values are current.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export const STAMPED_SCRIPTS = ['html-generator.js', 'control-panel.js'];

export function contentVersion(name) {
    // Line endings differ between Windows checkouts and GitHub, so hash the
    // text with them normalised.
    const text = readFileSync(join(ROOT, name), 'utf8').replace(/\r\n/g, '\n');
    return createHash('sha256').update(text).digest('hex').slice(0, 10);
}

export function scriptPattern(name) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(<script src="${escaped})(\\?v=[^"]*)?(")`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    const panelPath = join(ROOT, 'control-panel.html');
    let html = readFileSync(panelPath, 'utf8');
    for (const name of STAMPED_SCRIPTS) {
        const pattern = scriptPattern(name);
        if (!pattern.test(html)) {
            console.error(`control-panel.html does not load ${name}`);
            process.exit(1);
        }
        const version = contentVersion(name);
        html = html.replace(pattern, `$1?v=${version}$3`);
        console.log(`${name} -> ?v=${version}`);
    }
    writeFileSync(panelPath, html);
}
