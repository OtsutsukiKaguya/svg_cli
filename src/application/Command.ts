import type { Editor } from './Editor.js';
export abstract class Command {
  readonly editing: boolean = false;
  protected count(args: string[], min: number, max = min): void {
    if (args.length < min || args.length > max) throw new Error('invalid arguments; use help');
  }
  abstract execute(editor: Editor, args: string[]): string[];
}
