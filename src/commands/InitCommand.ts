import { Command } from '../application/Command.js';
import { Editor } from '../application/Editor.js';
import { Shape } from '../model/Shape.js';
export class InitCommand extends Command {
  execute(editor: Editor, args: string[]): string[] {
    this.count(args, 0, 2); editor.init(Shape.number(args[0] ?? '800'), Shape.number(args[1] ?? '600'));
    return [`canvas ${editor.canvas.width}x${editor.canvas.height} created`];
  }
}
