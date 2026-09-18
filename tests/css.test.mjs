import test from 'node:test';
import assert from 'node:assert/strict';
import {checkCss} from '../scripts/css-check.mjs';
import {validateCraft} from '../scripts/craft-core.mjs';

test('missing closure before subsequent rules is a build error', () => {
  const css = '.alert{color:red;.grid{display:grid}';
  assert(!checkCss(css).passed);
  assert.throws(() => validateCraft({title:'Study', css, slides:[{id:'a', title:'A', content:'<h1>A</h1>'}]}), /CSS structure/);
});
test('valid modern nesting, at-rules and custom properties remain available', () => {
  assert(checkCss('@layer theme{.a{--x:{a:b};color:red;&:hover{color:blue}@media(width>600px){display:grid}}}').passed);
});
test('strings, escaped selectors, comments and URL contents do not count as blocks', () => {
  for (const css of [
    '.x::after{content:"a } [ \\\""} /* { */',
    '.foo\\{bar{background:url(data:image/svg+xml,%3Csvg%3E{}[]%3C/svg%3E)}',
    '.a{background:url("data:image/svg+xml,<svg>{}</svg>");content:"a\\\nb"}',
    '.a{background:url(abc\\)def)}',
  ]) assert(checkCss(css).passed, css);
});
test('incomplete comments strings functions and unmatched closing tokens fail', () => {
  for (const css of ['/*x', '.a{content:"x}', '.a{width:calc(2px}', '}', '.a{background:url(foo}']) {
    assert(!checkCss(css).passed, css);
  }
});
test('line and column point to the unmatched opener', () => {
  assert.deepEqual(checkCss('.a{}\n.b{color:red').issues[0], {line:2,column:3,message:'Unclosed CSS {'});
});
test('structural preflight deliberately does not certify valid selectors or properties', () => {
  assert(checkCss('.a{display:grdi}').passed);
});
