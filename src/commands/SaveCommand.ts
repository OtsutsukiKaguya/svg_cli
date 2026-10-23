import { Command } from '../application/Command.js';
import { Editor } from '../application/Editor.js';
export class SaveCommand extends Command {
  execute(editor: Editor, args: string[]): string[] { this.count(args, 0, 1); return editor.save(args[0]); }
}
