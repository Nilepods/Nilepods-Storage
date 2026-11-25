// Converts a Claude Design (".dc.html") board into plain React source files.
//
//   npm run convert
//
// For each entry in JOBS it writes, under src/<dir>/:
//   View.jsx   - the page markup as JSX (generated - do not hand-edit, re-run instead)
//   Logic.js   - the page's state and behaviour class (generated on first run only,
//                so your own edits to it are kept; delete it to regenerate)
//   styles.css - the page's CSS (generated)
//
// Template rules handled: {{ path }} bindings, <sc-if value>, <sc-for list as>,
// ref callbacks, and inline style strings.

import { parseDocument } from 'htmlparser2';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const JOBS = [
  { src: 'design/Main.dc.html', dir: 'src/site' },
  { src: 'design/Admin.dc.html', dir: 'src/admin' },
];

// Design images are served from /_blob/<id>; in this project they live in public/images.
const fixBlobs = (s) => s.replace(/\/_blob\/([0-9a-f]{32})/g, '/images/$1.jpg').replace(/B \+ '([0-9a-f]{32})'/g, "B + '$1.jpg'").replace(/B = '\/_blob\/'/g, "B = '/images/'");

const ATTR_MAP = {
  class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength',
  minlength: 'minLength', autocomplete: 'autoComplete', autofocus: 'autoFocus', inputmode: 'inputMode',
  colspan: 'colSpan', rowspan: 'rowSpan', enterkeyhint: 'enterKeyHint', spellcheck: 'spellCheck',
  srcset: 'srcSet', crossorigin: 'crossOrigin', datetime: 'dateTime', novalidate: 'noValidate',
};
const BOOL_ATTRS = new Set(['disabled', 'checked', 'required', 'readonly', 'hidden', 'autofocus', 'multiple', 'selected', 'open', 'novalidate', 'playsinline', 'muted', 'loop', 'autoplay', 'controls']);
const NO_WS_PARENTS = new Set(['table', 'thead', 'tbody', 'tfoot', 'tr', 'colgroup', 'select']);
const BIND = /\{\{\s*([^}]*?)\s*\}\}/g;

function attrName(n) {
  if (ATTR_MAP[n]) return ATTR_MAP[n];
  if (/^(aria|data)-/.test(n)) return n;
  return n.replace(/[-:]([a-z])/g, (_, c) => c.toUpperCase());
}

function makeExpr(scope) {
  return (p) => {
    if (p === 'true' || p === 'false') return p;
    const root = p.split('.')[0];
    return scope.has(root) ? p : 'v.' + p;
  };
}

// "text {{ a.b }} more" -> JS expression
function interp(str, expr) {
  const parts = [];
  let last = 0, m;
  BIND.lastIndex = 0;
  while ((m = BIND.exec(str))) {
    if (m.index > last) parts.push({ lit: str.slice(last, m.index) });
    parts.push({ ex: expr(m[1]) });
    last = m.index + m[0].length;
  }
  if (last < str.length) parts.push({ lit: str.slice(last) });
  if (parts.length === 1 && parts[0].ex) return parts[0].ex;
  if (!parts.some((x) => x.ex)) return JSON.stringify(str);
  return '`' + parts.map((x) => (x.ex ? '${' + x.ex + '}' : x.lit.replace(/[`\\$]/g, '\\$&'))).join('') + '`';
}

function styleObj(str, expr) {
  const decls = str.split(';').map((d) => d.trim()).filter(Boolean);
  const props = decls.map((d) => {
    const i = d.indexOf(':');
    const k = d.slice(0, i).trim(), val = d.slice(i + 1).trim();
    const key = k.startsWith('--') ? JSON.stringify(k) : k.replace(/^-ms-/, 'ms-').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return `${key}: ${interp(val, expr)}`;
  });
  return '{{ ' + props.join(', ') + ' }}';
}

let loopId = 0;
function node2jsx(node, scope, parentName, ind) {
  const pad = '  '.repeat(ind);
  const expr = makeExpr(scope);
  if (node.type === 'comment') return '';
  if (node.type === 'text') {
    let t = node.data.replace(/\s+/g, ' ');
    // Whitespace-only text that spans a line break is just source indentation.
    if (t === ' ' && (NO_WS_PARENTS.has(parentName) || node.data.includes('\n'))) return '';
    if (!t) return '';
    const out = [];
    let last = 0, m;
    BIND.lastIndex = 0;
    while ((m = BIND.exec(t))) {
      if (m.index > last) out.push('{' + JSON.stringify(t.slice(last, m.index)) + '}');
      out.push('{' + expr(m[1]) + '}');
      last = m.index + m[0].length;
    }
    if (last < t.length) out.push('{' + JSON.stringify(t.slice(last)) + '}');
    return pad + out.join('') + '\n';
  }
  if (node.type !== 'tag' && node.type !== 'script' && node.type !== 'style') return '';
  const name = node.name;
  const kids = (s, n) => node.children.map((c) => node2jsx(c, s, name, n)).join('');

  if (name === 'sc-if') {
    const cond = expr(node.attribs.value.replace(BIND, '$1').trim());
    return `${pad}{${cond} ? (<>\n${kids(scope, ind + 1)}${pad}</>) : null}\n`;
  }
  if (name === 'sc-for') {
    const list = expr(node.attribs.list.replace(BIND, '$1').trim());
    const as = node.attribs.as;
    const idx = `${as}_i${loopId++}`;
    const s2 = new Set(scope); s2.add(as);
    return `${pad}{(${list} || []).map((${as}, ${idx}) => (<Fragment key={${idx}}>\n${kids(s2, ind + 1)}${pad}</Fragment>))}\n`;
  }

  const attrs = [];
  for (const [k, raw] of Object.entries(node.attribs)) {
    if (k.startsWith('hint-')) continue;
    const n = attrName(k);
    if (k === 'style') { attrs.push(`style=${styleObj(raw, expr)}`); continue; }
    if (raw === '') { attrs.push(BOOL_ATTRS.has(k) ? n : `${n}=""`); continue; }
    const e = interp(raw, expr);
    attrs.push(e.startsWith('"') ? `${n}=${e}` : `${n}={${e}}`);
  }
  const open = `<${name}${attrs.length ? ' ' + attrs.join(' ') : ''}`;
  if (!node.children.length) return `${pad}${open} />\n`;
  return `${pad}${open}>\n${kids(scope, ind + 1)}${pad}</${name}>\n`;
}

function find(node, pred) {
  if (pred(node)) return node;
  for (const c of node.children || []) { const r = find(c, pred); if (r) return r; }
  return null;
}

for (const job of JOBS) {
  const html = fixBlobs(fs.readFileSync(path.join(ROOT, job.src), 'utf8'));
  const doc = parseDocument(html, { lowerCaseAttributeNames: false, lowerCaseTags: true, recognizeSelfClosing: true });
  const xdc = find(doc, (n) => n.name === 'x-dc');
  const helmet = find(xdc, (n) => n.name === 'helmet');
  const style = find(helmet, (n) => n.name === 'style');
  const script = find(doc, (n) => n.name === 'script' && n.attribs['data-dc-script'] !== undefined);
  const body = xdc.children.filter((c) => c !== helmet && c.type !== 'text' || (c.type === 'text' && c.data.trim()));
  const roots = body.filter((c) => c.type === 'tag');
  if (roots.length !== 1) throw new Error(`${job.src}: expected one root element, found ${roots.length}`);

  const outDir = path.join(ROOT, job.dir);
  fs.mkdirSync(outDir, { recursive: true });

  const css = style.children.map((c) => c.data).join('');
  fs.writeFileSync(path.join(outDir, 'styles.css'), `/* Generated from ${job.src} by tools/convert-design.mjs */\n${css.trim()}\n`);

  const jsx = node2jsx(roots[0], new Set(), 'x-dc', 2);
  fs.writeFileSync(path.join(outDir, 'View.jsx'),
    `// Generated from ${job.src} by tools/convert-design.mjs - edit the design or the converter, not this file.\n` +
    `import { Fragment } from 'react';\n\nexport default function View(v) {\n  return (\n${jsx}  );\n}\n`);

  const logicPath = path.join(outDir, 'Logic.js');
  if (!fs.existsSync(logicPath)) {
    let code = script.children.map((c) => c.data).join('').trim();
    code = code.replace(/^class Component extends DCLogic/m, 'export default class Logic extends DCLogic');
    fs.writeFileSync(logicPath, `// State and behaviour for this page. Converted from ${job.src}; safe to edit.\nimport DCLogic from '../lib/DCLogic.jsx';\n\n${code}\n`);
  }
  console.log(`${job.src} -> ${job.dir}/ (View.jsx, styles.css${fs.existsSync(logicPath) ? ', Logic.js' : ''})`);
}
