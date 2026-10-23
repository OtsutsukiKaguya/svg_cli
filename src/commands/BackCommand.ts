import { EditCommand } from '../application/EditCommand.js';
import { Editor } from '../application/Editor.js';
export class BackCommand extends EditCommand {
  execute(editor: Editor, args: string[]): string[] {
    this.count(args, 1); const shape = editor.canvas.find(args[0]!), parent = editor.canvas.parent(shape);
    parent.remove(shape); parent.insert(shape, 0); return [`${shape.label} sent to back`];
  }
}
