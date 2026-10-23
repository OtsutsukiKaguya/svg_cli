import { Command } from '../application/Command.js';
import { Editor } from '../application/Editor.js';
import { Shape } from '../model/Shape.js';
export class CanvasCommand extends Command {
  execute(editor: Editor, args: string[]): string[] {
    const canvas = editor.canvas;
    if (args.length !== 0 && args.length !== 2) throw new Error('usage: canvas [w h]');
    if (args.length) editor.resize(Shape.number(args[0]!), Shape.number(args[1]!));
    return [`canvas ${canvas.width}x${canvas.height}`];
  }
}
