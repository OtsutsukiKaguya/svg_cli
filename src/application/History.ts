import { Canvas } from '../model/Canvas.js';
export class History {
  private past: { before: Canvas; after: Canvas; message: string }[] = [];
  private future: { before: Canvas; after: Canvas; message: string }[] = [];
  private blocked = true;
  barrier(): void { this.past = []; this.future = []; this.blocked = true; }
  record(before: Canvas, after: Canvas, message: string): void {
    this.past.push({ before, after, message }); this.future = []; this.blocked = false;
  }
  undo(): { canvas: Canvas; message: string } {
    if (this.blocked) throw new Error('undo not allowed after io command');
    const entry = this.past.pop();
    if (!entry) throw new Error('nothing to undo');
    this.future.push(entry); return { canvas: entry.before.clone(), message: `undone: ${entry.message}` };
  }
  redo(): { canvas: Canvas; message: string } {
    if (this.blocked) throw new Error('undo not allowed after io command');
    const entry = this.future.pop();
    if (!entry) throw new Error('nothing to redo');
    this.past.push(entry); return { canvas: entry.after.clone(), message: `redone: ${entry.message}` };
  }
}
