import { EditCommand } from '../application/EditCommand.js';
import { Editor } from '../application/Editor.js';
import { Group } from '../model/Group.js';
export class GroupCommand extends EditCommand {
  execute(editor: Editor, args: string[]): string[] {
    this.count(args, 2, Number.MAX_SAFE_INTEGER); const canvas = editor.canvas;
    canvas.available(args[0]!);
    const ids = args.slice(1);
    if (new Set(ids).size !== ids.length) throw new Error('duplicate group member');
    const requested = ids.map(id => canvas.find(id));
    for (const shape of requested) if (shape instanceof Group && requested.some(other => other !== shape && shape.contains(other)))
      throw new Error(`cannot group a container into its own descendant: ${shape.id}`);
    const shapes = canvas.all().filter(shape => requested.includes(shape));
    const firstParent = canvas.parent(shapes[0]!);
    const parent = shapes.every(shape => canvas.parent(shape) === firstParent) ? firstParent : canvas.root;
    const position = parent.children.indexOf(shapes[0]!);
    const group = new Group(args[0]!);
    for (const shape of shapes) { canvas.parent(shape).remove(shape); group.insert(shape); }
    parent.insert(group, position < 0 ? parent.children.length : position);
    return [`${group.label} created with ${shapes.length} children`];
  }
}
