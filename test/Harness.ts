import assert from 'node:assert/strict';
import { Editor } from '../src/application/Editor.js';
import { Cli } from '../src/cli/Cli.js';
import { SvgFileStore } from '../src/infrastructure/SvgFileStore.js';
export class Harness {
  readonly editor = new Editor(new SvgFileStore());
  readonly cli = new Cli(this.editor);
  constructor() { this.ok('init'); }
  ok(line: string): string[] {
    const messages = this.cli.runLine(line);
    assert.ok(!messages.some(message => message.startsWith('error:')), messages.join('\n'));
    return messages;
  }
  fail(line: string, expected: string): void {
    const before = this.ok('tree');
    assert.deepEqual(this.cli.runLine(line), [`error: ${expected}`]);
    assert.deepEqual(this.ok('tree'), before);
  }
  attr(id: string, key: string): string | undefined { return this.editor.canvas.find(id).attrs.get(key); }
  ids(parent?: string): string[] {
    return (parent ? this.editor.canvas.container(parent) : this.editor.canvas.root).children.map(shape => shape.id);
  }
}
