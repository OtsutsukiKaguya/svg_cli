import { EditCommand } from '../application/EditCommand.js';
import { Editor } from '../application/Editor.js';
import { ShapeFactory } from '../model/ShapeFactory.js';
export class CreateCommand extends EditCommand {
  execute(editor: Editor, args: string[]): string[] {
    this.count(args, 2, 9);
    const [type, id, ...params] = args;
    const canvas = editor.canvas;
    canvas.available(id!);
    let parent = canvas.root;
    if (params.length >= 2 && params.at(-2) === 'in') {
      parent = canvas.container(params.pop()!); params.pop();
    }
    const shape = new ShapeFactory().create(type!, id!, params);
    parent.insert(shape);
    return [`${shape.label} created${parent === canvas.root ? '' : ` in ${parent.label}`}`];
  }
}
