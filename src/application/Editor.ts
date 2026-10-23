import { Canvas } from '../model/Canvas.js';
import { Command } from './Command.js';
import { History } from './History.js';
import type { FilePort } from './FilePort.js';
export class Editor {
  private document?: Canvas;
  private path?: string;
  private readonly history = new History();
  constructor(private readonly files: FilePort) {}
  get canvas(): Canvas {
    if (!this.document) throw new Error("no document. use 'init' or 'read' first");
    return this.document;
  }
  execute(command: Command, args: string[]): string[] {
    const before = command.editing ? this.canvas.clone() : undefined;
    try {
      const messages = command.execute(this, args);
      if (before) this.history.record(before, this.canvas.clone(), messages.join('; '));
      return messages;
    } catch (error) { if (before) this.document = before; throw error; }
  }
  init(w: number, h: number): void { this.document = new Canvas(w, h); this.path = undefined; this.history.barrier(); }
  read(path: string): string[] {
    const result = this.files.read(path);
    this.document = result.canvas; this.path = path; this.history.barrier();
    return [...result.warnings, `read ${path} (${this.canvas.all().length} elements)`];
  }
  save(path = this.path): string[] {
    const canvas = this.canvas;
    if (!path) throw new Error('no file path; use save <file.svg>');
    this.files.write(path, canvas); this.path = path; this.history.barrier();
    return [`saved to ${path} (${canvas.all().length} elements)`];
  }
  resize(w: number, h: number): void { this.canvas.resize(w, h); this.history.barrier(); }
  undo(): string[] { void this.canvas; const result = this.history.undo(); this.document = result.canvas; return [result.message]; }
  redo(): string[] { void this.canvas; const result = this.history.redo(); this.document = result.canvas; return [result.message]; }
}
