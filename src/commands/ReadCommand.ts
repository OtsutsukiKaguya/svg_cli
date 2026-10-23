import { Command } from '../application/Command.js';
import { Editor } from '../application/Editor.js';
export class ReadCommand extends Command {
  execute(editor: Editor, args: string[]): string[] { this.count(args, 1); return editor.read(args[0]!); }
}
