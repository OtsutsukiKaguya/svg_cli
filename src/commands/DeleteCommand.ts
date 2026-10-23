import { EditCommand } from '../application/EditCommand.js';
import { Editor } from '../application/Editor.js';
export class DeleteCommand extends EditCommand {
  execute(editor: Editor, args: string[]): string[] {
    this.count(args, 1); const shape = editor.canvas.find(args[0]!);
    editor.canvas.parent(shape).remove(shape); return [`${shape.label} deleted`];
  }
}
