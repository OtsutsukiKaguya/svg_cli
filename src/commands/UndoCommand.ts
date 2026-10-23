import { Command } from '../application/Command.js';
import { Editor } from '../application/Editor.js';
export class UndoCommand extends Command {
  execute(editor: Editor, args: string[]): string[] { this.count(args, 0); return editor.undo(); }
}
