import { Command } from '../application/Command.js';
import { Editor } from '../application/Editor.js';
import { Shape } from '../model/Shape.js';
export class TreeCommand extends Command {
  execute(editor: Editor, args: string[]): string[] {
    this.count(args, 0, 1); const canvas = editor.canvas;
    const root = args.length ? canvas.find(args[0]!) : canvas.root;
    const lines = [args.length ? root.summary() : `svg (${canvas.width}x${canvas.height})`];
    const visit = (shape: Shape, prefix: string, last: boolean): void => {
      lines.push(`${prefix}${last ? '└── ' : '├── '}${shape.summary()}`);
      shape.children.forEach((child, i, children) => visit(child, prefix + (last ? '    ' : '│   '), i === children.length - 1));
    };
    root.children.forEach((child, i, children) => visit(child, '', i === children.length - 1)); return lines;
  }
}
