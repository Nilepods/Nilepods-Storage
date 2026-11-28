// Builds Claude Design boards from the live site, so the design always matches the website.
//
//   node tools/export-design.mjs
//
// Writes design-export/Main.dc.html and design-export/Mobile.dc.html:
//   - the page markup and CSS from design/Main.dc.html (what the site is built from), and
//   - the page logic from src/site/Logic.js, with the database, payments and sign-in
//     replaced by demo stand-ins so the prototype runs on the Claude Design canvas.
// Image paths are mapped back to the design's uploaded assets (/_blob/<id>).
// Publish both files to the "Nilepods Website v5" design as project/Main.dc.html and project/Mobile.dc.html.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// Site image -> design asset id. Images named by a 32-character id already exist in the design.
const ASSETS = {
  'nilepods-logo.svg': '492e0ee0de5869404bf0817d22c29750',
  'setup-1.jpg': 'add7295cc6f22248b24167de3a4b1bef', 'setup-2.jpg': 'ff023e6fde4241e50484abd05d52158b',
  'setup-3.jpg': 'fb8c920fe5fa7f06fdc6198a79c06bc4', 'setup-4.jpg': '4e03a775f384cb9dcef50b4b005548b4',
  'setup-5.jpg': '35e108debbfcbea002990a56e11d561f', 'setup-6.jpg': '91a183c978329d1709a49720ad369edf',
  'setup-7.jpg': '0bb445f7fe94a98fc246bdc1d064c45e', 'cyclorama.jpg': '907f3953dbcceff63a054d8213b42e78',
};

function mapImages(s) {
  // srcset lists are a website-only optimisation; the design uses the single image.
  s = s.replace(/ srcset="[^"]*"/g, '').replace(/ sizes="[^"]*"/g, '');
  s = s.replace(/\/images\/([0-9a-f]{32})\.jpg/g, '/_blob/$1');
  s = s.replace(/\/images\/([\w.-]+)/g, (m, f) => (ASSETS[f] ? '/_blob/' + ASSETS[f] : m));
  s = s.replace(/B \+ '(setup-\d\.jpg)'/g, (m, f) => "B + '" + ASSETS[f] + "'");
  s = s.replace(/B \+ '([0-9a-f]{32})\.jpg'/g, "B + '$1'");
  s = s.replace(/B = '\/images\/'/g, "B = '/_blob/'");
  return s;
}

// Demo stand-ins for the website's server calls.
const SHIMS = `// ---- Design preview: demo stand-ins for the website's database, payments and sign-in ----
var supabase = null;
var isoDate = function (d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
var loadBusySlots = function () { return Promise.resolve({}); };
var startCheckout = function () { return Promise.resolve({ ref: 'NP-DEMO0001', total: 0, cash: true }); };
var getPaymentStatus = function () { return Promise.resolve({ status: 'confirmed' }); };
var forwardPaymobResult = function () { return Promise.resolve(); };
var rescheduleBooking = function () { return Promise.resolve({ ok: true }); };
var sendSignInLink = function () { return Promise.resolve(); };
var watchSession = function () { return function () {}; };
var recordSignIn = function () {};
var authSignOut = function () { return Promise.resolve(); };
var signInWithPassword = function () { return Promise.resolve({}); };
var signUpWithPassword = function () { return Promise.resolve('created'); };
var sendPasswordReset = function () { return Promise.resolve(); };
var setPassword = function () { return Promise.resolve(); };
var saveProfile = function () { return Promise.resolve(); };
`;

function logicForDesign() {
  let s = read('src/site/Logic.js');
  s = s.replace(/^import[^\n]*\n/gm, '');
  s = s.replace('export default class Logic extends DCLogic', 'class Component extends DCLogic');
  // Setup photos: one image per setup in the design.
  s = s.replace(
    "return Object.assign(s, { srcset: base + '-1200.jpg 1200w, ' + base + '.jpg 2400w, ' + base + '-3600.jpg 3600w', bg: base + '-1200.jpg' });",
    'return Object.assign(s, { srcset: s.img, bg: s.img });');
  if (s.includes("'-1200.jpg")) throw new Error('srcset code changed: update export-design.mjs');
  return mapImages(SHIMS + s);
}

function board(width, height) {
  const tpl = read('design/Main.dc.html');
  const i = tpl.indexOf('<script type="text/x-dc"');
  if (i < 0) throw new Error('design script tag not found');
  const head = mapImages(tpl.slice(0, i));
  return head + `<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${width},"height":${height}}}'>\n` + logicForDesign() + '</script>\n</body>\n</html>\n';
}

fs.mkdirSync(path.join(ROOT, 'design-export'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'design-export/Main.dc.html'), board(1440, 900));
fs.writeFileSync(path.join(ROOT, 'design-export/Mobile.dc.html'), board(390, 844));
console.log('Wrote design-export/Main.dc.html and design-export/Mobile.dc.html');
