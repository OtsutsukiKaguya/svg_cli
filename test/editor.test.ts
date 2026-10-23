import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Harness } from './Harness.js';
import { Editor } from '../src/application/Editor.js';
import { Cli } from '../src/cli/Cli.js';
import { SvgFileStore } from '../src/infrastructure/SvgFileStore.js';
import { SvgCodec } from '../src/infrastructure/SvgCodec.js';
import { Tokenizer } from '../src/cli/Tokenizer.js';

test('no document, comments, help and malformed tokens', () => {
  const cli = new Cli(new Editor(new SvgFileStore()));
  for (const command of ['tree', 'canvas', 'show r', 'create g g', 'undo', 'redo', 'save'])
    assert.deepEqual(cli.runLine(command), ["error: no document. use 'init' or 'read' first"]);
  assert.ok(cli.runLine('help').includes('undo'));
  assert.deepEqual(cli.runLine(' # ignored'), []);
  assert.deepEqual(cli.runLine('create text t 1 2 "bad'), ['error: unterminated double quote']);
  assert.deepEqual(cli.runLine('unknown'), ['error: unknown command: unknown']);
});

test('tokenizer preserves Unicode, empty text, color, Windows paths and escaped quotes', () => {
  const tokenizer = new Tokenizer();
  assert.deepEqual(tokenizer.parse('set t text "你好 \\"world\\""'), ['set', 't', 'text', '你好 "world"']);
  assert.deepEqual(tokenizer.parse('create text t 0 0 ""'), ['create', 'text', 't', '0', '0', '']);
  assert.deepEqual(tokenizer.parse('read "C:\\data\\my file.svg"'), ['read', 'C:\\data\\my file.svg']);
  assert.deepEqual(tokenizer.parse('set r fill #fff'), ['set', 'r', 'fill', '#fff']);
});

test('six types, defaults, decimal geometry, case sensitive IDs', () => {
  const h = new Harness();
  h.ok('create rect r -1.5 2 3 4'); h.ok('create circle R 1 2 3 red');
  h.ok('create ellipse e 1 2 3 4'); h.ok('create line l 0 0 10 20 black');
  h.ok('create text t 2 4 "你好 world"'); h.ok('create g g');
  assert.equal(h.editor.canvas.all().length, 6);
  assert.equal(h.attr('r', 'fill'), undefined); assert.equal(h.attr('r', 'x'), '-1.5');
  assert.equal(h.editor.canvas.find('t').content, '你好 world');
  h.fail('create box b 0 0 1 1 title', 'unknown shape type: box (is the plugin loaded?)');
  h.fail('create rect r 0 0 1 1', 'id already exists: r');
  h.fail('move missing 1 2', 'no such shape: missing');
});

test('in clause works for every type and rejects missing or leaf parents atomically', () => {
  const h = new Harness(); h.ok('create g scene');
  for (const command of ['g inner', 'rect r 0 0 1 2', 'circle c 1 2 3', 'ellipse e 1 2 3 4', 'line l 0 0 2 3', 'text t 1 2 "in"'])
    h.ok(`create ${command} in scene`);
  assert.deepEqual(h.ids('scene'), ['inner', 'r', 'c', 'e', 'l', 't']);
  h.fail('create g bad in none', 'no such container: none');
  h.fail('create g bad in r', 'not a container: r');
});

test('nested Composite movement and scaling update positions and sizes exactly once', () => {
  const h = new Harness(); h.ok('create g outer'); h.ok('create g inner in outer');
  h.ok('create rect r 10 20 30 40 in inner'); h.ok('create line l 1 2 3 4 in outer');
  h.ok('move outer 5 -2'); h.ok('scale outer 2');
  assert.equal(h.attr('r', 'x'), '30'); assert.equal(h.attr('r', 'y'), '36');
  assert.equal(h.attr('r', 'width'), '60'); assert.equal(h.attr('l', 'x2'), '16');
  h.ok('undo'); assert.equal(h.attr('r', 'x'), '15');
  h.ok('undo'); assert.equal(h.attr('r', 'x'), '10');
  h.ok('redo'); h.ok('redo'); assert.equal(h.attr('r', 'x'), '30');
});

test('set whitelist and invalid numeric input do not change state', () => {
  const h = new Harness(); h.ok('create rect r 0 0 1 1'); h.ok('create g g');
  h.ok('set r stroke-width 1.5'); h.ok('set g fill blue');
  h.fail('set r id other', 'unknown attribute: id');
  h.fail('set g x 2', 'unknown attribute: x');
  h.fail('set r width -1', 'width must be non-negative');
  h.fail('set r x NaN', 'invalid number: NaN');
  h.fail('move r 1 Infinity', 'invalid number: Infinity');
  h.fail('scale r 0', 'scale factor must be positive');
  h.fail('scale r -2', 'scale factor must be positive');
  h.fail('create circle c 0 0 -1', 'r must be non-negative');
});

test('overflow during recursive edits rolls back already modified siblings', () => {
  const h = new Harness(); h.ok('create g g'); h.ok('create rect a 1 2 3 4 in g');
  h.ok('create rect b 1e308 0 1 1 in g');
  h.fail('scale g 2', 'invalid number: Infinity');
  assert.equal(h.attr('a', 'x'), '1');
  h.ok('undo'); assert.deepEqual(h.ids('g'), ['a']);
});

test('group maintains document order, rejects cycles and is a single undo unit', () => {
  const h = new Harness(); for (const id of ['a', 'b', 'c']) h.ok(`create g ${id}`);
  h.ok('group cluster c a'); assert.deepEqual(h.ids('cluster'), ['a', 'c']);
  assert.deepEqual(h.ids(), ['cluster', 'b']);
  h.fail('group bad a cluster', 'cannot group a container into its own descendant: cluster');
  h.fail('addto a cluster', 'cannot group a container into its own descendant: cluster');
  h.fail('addto cluster cluster', 'cannot group a container into its own descendant: cluster');
  h.ok('undo'); assert.deepEqual(h.ids(), ['a', 'b', 'c']);
  h.ok('redo'); assert.deepEqual(h.ids('cluster'), ['a', 'c']);
});

test('group members from different parents preserve preorder and parent restoration', () => {
  const h = new Harness(); h.ok('create g p'); h.ok('create g q');
  h.ok('create g a in p'); h.ok('create g b in q');
  h.ok('group mix b a'); assert.deepEqual(h.ids('mix'), ['a', 'b']);
  h.ok('undo'); assert.deepEqual(h.ids('p'), ['a']); assert.deepEqual(h.ids('q'), ['b']);
  h.fail('group bad a a', 'duplicate group member');
});

test('ungroup preserves insertion position and inherited style; top-level is rejected', () => {
  const h = new Harness(); h.ok('create g outer');
  for (const id of ['a', 'inner', 'z']) h.ok(`create g ${id} in outer`);
  h.ok('create rect r 0 0 1 1 in inner'); h.ok('set inner fill red');
  h.fail('ungroup outer', 'cannot ungroup top-level container: outer');
  h.ok('ungroup inner'); assert.deepEqual(h.ids('outer'), ['a', 'r', 'z']);
  assert.equal(h.attr('r', 'fill'), 'red');
  h.ok('undo'); assert.deepEqual(h.ids('outer'), ['a', 'inner', 'z']);
  assert.equal(h.attr('r', 'fill'), undefined);
});

test('addto, front, back, subtree deletion and undo restore exact sibling order', () => {
  const h = new Harness(); h.ok('create g p'); h.ok('create g q');
  h.ok('create g a in p'); h.ok('create g b in p');
  h.ok('front a'); assert.deepEqual(h.ids('p'), ['b', 'a']);
  h.ok('back a'); assert.deepEqual(h.ids('p'), ['a', 'b']);
  h.ok('addto q a'); assert.deepEqual(h.ids('q'), ['a']);
  h.ok('undo'); assert.deepEqual(h.ids('p'), ['a', 'b']);
  h.ok('delete p'); assert.deepEqual(h.ids(), ['q']);
  h.ok('undo'); assert.deepEqual(h.ids(), ['p', 'q']); assert.deepEqual(h.ids('p'), ['a', 'b']);
});

test('new successful edits clear redo, failures and displays do not', () => {
  const h = new Harness(); h.ok('create g a'); h.ok('create g b'); h.ok('undo');
  h.ok('tree'); h.ok('show a'); h.ok('help'); h.ok('canvas');
  h.fail('create g a', 'id already exists: a'); h.ok('redo');
  h.ok('undo'); h.ok('create g c'); h.fail('redo', 'nothing to redo');
});

test('successful init and canvas resize block both history directions', () => {
  const h = new Harness(); h.ok('create g a'); h.ok('canvas 100 200');
  for (const op of ['undo', 'redo']) h.fail(op, 'undo not allowed after io command');
  h.ok('create g b'); h.ok('undo'); assert.deepEqual(h.ids(), ['a']);
  h.fail('undo', 'nothing to undo');
  h.ok('init 300'); assert.equal(h.editor.canvas.width, 300); assert.equal(h.editor.canvas.height, 600);
  h.fail('redo', 'undo not allowed after io command');
});

test('failed canvas/init/save/read preserve current document and history', () => {
  const h = new Harness(); h.ok('create g a');
  h.fail('canvas -1 2', 'canvas dimensions must be positive');
  h.fail('init 0 3', 'canvas dimensions must be positive');
  h.fail('save', 'no file path; use save <file.svg>');
  h.fail('read __missing_lab1__.svg', 'cannot read file: __missing_lab1__.svg');
  h.fail('save __missing_lab1__/a.svg', 'cannot write file: __missing_lab1__/a.svg');
  h.ok('undo'); assert.deepEqual(h.ids(), []);
});

test('read/save roundtrip with entities, Chinese, paths with spaces and history barriers', () => {
  const directory = mkdtempSync(join(tmpdir(), 'svg-lab1-'));
  try {
    const path = join(directory, 'my drawing.svg'); const h = new Harness();
    h.ok('create g scene'); h.ok('set scene fill blue'); h.ok('create text t 1 2 "中文 < & >" in scene');
    const tree = h.ok('tree'); h.ok(`save "${path}"`);
    assert.match(readFileSync(path, 'utf8'), /&lt; &amp; &gt;/);
    h.fail('undo', 'undo not allowed after io command');
    h.ok('init'); h.ok(`read "${path}"`); assert.deepEqual(h.ok('tree'), tree);
    h.fail('redo', 'undo not allowed after io command');
    h.ok('set t text "updated"'); h.ok('save'); h.ok(`read "${path}"`);
    assert.equal(h.editor.canvas.find('t').content, 'updated');
    writeFileSync(path, '<svg><g></svg>');
    h.fail(`read "${path}"`, 'invalid SVG XML');
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('missing IDs avoid every explicit ID including ones appearing later', () => {
  const codec = new SvgCodec();
  const result = codec.decode('<svg width="10" height="20"><rect/><rect id="rect1"/><g><circle/></g></svg>');
  assert.deepEqual(result.canvas.all().map(shape => shape.id), ['rect2', 'rect1', 'g1', 'circle1']);
  assert.deepEqual(result.warnings, ['warning: assigned id rect2 to unnamed <rect>', 'warning: assigned id g1 to unnamed <g>', 'warning: assigned id circle1 to unnamed <circle>']);
});

test('invalid SVG, duplicate IDs, unknown types and unsupported attributes reject explicitly', () => {
  const codec = new SvgCodec();
  for (const xml of ['<html/>', '<svg><rect id="a"/><g id="a"/></svg>', '<svg><path/></svg>',
    '<svg><rect width="-1"/></svg>', '<svg><rect transform="rotate(5)"/></svg>',
    '<svg><text><g/></text></svg>', '<!DOCTYPE svg><svg/>', '<svg viewBox="1 1 10 10"/>'])
    assert.throws(() => codec.decode(xml), Error, xml);
});

test('external sample imports exactly seven shapes with one warning', () => {
  const h = new Harness(); const output = h.ok('read examples/other.svg');
  assert.equal(h.editor.canvas.all().length, 7);
  assert.equal(output[0], 'warning: assigned id rect1 to unnamed <rect>');
  assert.equal(h.editor.canvas.width, 400); assert.equal(h.editor.canvas.height, 300);
});

test('tree subtree and show expose geometry, text and parent', () => {
  const h = new Harness(); h.ok('create g g'); h.ok('create circle c 1 2 3 red in g');
  assert.deepEqual(h.ok('tree g'), ['g#g', '└── circle#c  cx=1 cy=2 r=3 fill=red']);
  assert.deepEqual(h.ok('show c'), ['circle#c  parent=g#g', '  cx=1', '  cy=2', '  r=3', '  fill=red']);
});
