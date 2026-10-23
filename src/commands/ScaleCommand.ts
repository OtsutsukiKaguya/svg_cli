import { EditCommand } from '../application/EditCommand.js';
import { Editor } from '../application/Editor.js';
import { Shape } from '../model/Shape.js';
export class ScaleCommand extends EditCommand {
  execute(editor: Editor, args: string[]): string[] {
    this.count(args, 2); const shape = editor.canvas.find(args[0]!);
    const factor = Shape.number(args[1]!);
    if (factor <= 0) throw new Error('scale factor must be positive');
    shape.scale(factor); return [`${shape.label} scaled by ${factor}`];
  }
}
