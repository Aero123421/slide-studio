/** Structural CSS preflight, not a CSS grammar/selector/visual validator.
 * Browsers recover from incomplete stylesheets without raising a pageerror.
 * Preserve valid nesting, custom properties, escaped selectors, strings and URLs. */
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

export function checkCss(css) {
  if (typeof css !== 'string') throw new TypeError('CSS must be a string');
  const stack = [], issues = [];
  const issue = (at, message) => {
    const lines = css.slice(0, at).split('\n');
    issues.push({line: lines.length, column: lines.at(-1).length + 1, message});
  };
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === '\\') { i++; continue; }
    if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      if (end < 0) { issue(i, 'Unclosed CSS comment'); break; }
      i = end + 1; continue;
    }
    if (c === '"' || c === "'") {
      const start = i, quote = c; let closed = false;
      while (++i < css.length) {
        if (css[i] === '\\') { if (css[i + 1] === '\r' && css[i + 2] === '\n') i++; i++; }
        else if (css[i] === quote) { closed = true; break; }
        else if ('\r\n\f'.includes(css[i])) break;
      }
      if (!closed) issue(start, 'Unclosed CSS string');
      continue;
    }
    // Unquoted url() may legally contain braces, brackets and quote-like escapes.
    const url = css.slice(i).match(/^url\(\s*/i);
    if (url && !/[\w-]/.test(css[i - 1] || '') && !['"', "'"].includes(css[i + url[0].length])) {
      const start = i; i += url[0].length;
      while (i < css.length && css[i] !== ')') { if (css[i] === '\\') i++; i++; }
      if (i >= css.length) issue(start, 'Unclosed CSS url()');
      continue;
    }
    if ('{[('.includes(c)) stack.push({char: c, at: i});
    if ('}])'.includes(c)) {
      const expected = {'}':'{', ']':'[', ')':'('}[c];
      if (stack.at(-1)?.char !== expected) issue(i, `Unexpected CSS ${c}`);
      else stack.pop();
    }
  }
  for (const entry of stack) issue(entry.at, `Unclosed CSS ${entry.char}`);
  return {passed: issues.length === 0, issues};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const styles = JSON.parse(fs.readFileSync(0, 'utf8'));
    if (!Array.isArray(styles)) throw new Error('Expected a JSON array of stylesheet strings on stdin');
    const issues = styles.flatMap((css, sheet) => checkCss(css).issues.map(x => ({sheet: sheet + 1, ...x})));
    console.log(JSON.stringify({passed: !issues.length, issues}));
    process.exitCode = issues.length ? 2 : 0;
  } catch (e) { console.error('CSS preflight:', e.message); process.exitCode = 1; }
}
