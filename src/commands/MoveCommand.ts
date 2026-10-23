import { EditCommand } from '../application/EditCommand.js';
import { Editor } from '../application/Editor.js';
import { Shape } from '../model/Shape.js';
export class MoveCommand extends EditCommand {
  execute(editor: Editor, args: string[]): string[] {
    this.count(args, 3); const shape = editor.canvas.find(args[0]!);
    const dx = Shape.number(args[1]!), dy = Shape.number(args[2]!);
    shape.move(dx, dy); return [`${shape.label} moved by (${dx},${dy})`];
  }
}
