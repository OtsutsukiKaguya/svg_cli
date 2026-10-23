import { EditCommand } from '../application/EditCommand.js';
import { Editor } from '../application/Editor.js';
import { Group } from '../model/Group.js';
export class AddToCommand extends EditCommand {
  execute(editor: Editor, args: string[]): string[] {
    this.count(args, 2); const canvas = editor.canvas;
    const group = canvas.container(args[0]!), shape = canvas.find(args[1]!);
    if (shape instanceof Group && shape.contains(group)) throw new Error(`cannot group a container into its own descendant: ${shape.id}`);
    canvas.parent(shape).remove(shape); group.insert(shape);
    return [`${shape.label} moved into ${group.label}`];
  }
}
