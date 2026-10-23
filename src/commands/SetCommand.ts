import { EditCommand } from '../application/EditCommand.js';
import { Editor } from '../application/Editor.js';
export class SetCommand extends EditCommand {
  execute(editor: Editor, args: string[]): string[] {
    this.count(args, 3); const shape = editor.canvas.find(args[0]!);
    shape.set(args[1]!, args[2]!); return [`${shape.label} updated: ${args[1]}=${JSON.stringify(args[2])}`];
  }
}
