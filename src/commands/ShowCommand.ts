import { Command } from '../application/Command.js';
import { Editor } from '../application/Editor.js';
import { Text } from '../model/Text.js';
export class ShowCommand extends Command {
  execute(editor: Editor, args: string[]): string[] {
    this.count(args, 1); const canvas = editor.canvas, shape = canvas.find(args[0]!), parent = canvas.parent(shape);
    return [`${shape.label}  parent=${parent === canvas.root ? 'svg' : parent.label}`,
      ...[...shape.attrs].map(([key, value]) => `  ${key}=${value}`),
      ...(shape instanceof Text ? [`  text=${JSON.stringify(shape.content)}`] : [])];
  }
}
