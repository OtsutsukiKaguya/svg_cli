import { Command } from '../application/Command.js';
import { Editor } from '../application/Editor.js';
export class HelpCommand extends Command {
  execute(_editor: Editor, args: string[]): string[] {
    this.count(args, 0);
    return ['init [w] [h]', 'read <file.svg>', 'save [file.svg]', 'canvas [w h]',
      'create rect <id> <x> <y> <w> <h> [fill] [in <containerId>]',
      'create circle <id> <cx> <cy> <r> [fill] [in <containerId>]',
      'create ellipse <id> <cx> <cy> <rx> <ry> [fill] [in <containerId>]',
      'create line <id> <x1> <y1> <x2> <y2> [stroke] [in <containerId>]',
      'create text <id> <x> <y> "content" [in <containerId>]', 'create g <id> [in <containerId>]',
      'delete <id>', 'move <id> <dx> <dy>', 'scale <id> <factor>', 'set <id> <attr> <value>',
      'group <newGid> <id1> <id2>…', 'ungroup <gid>', 'addto <gid> <id>',
      'front <id>', 'back <id>', 'tree [id]', 'show <id>', 'help', 'undo', 'redo',
      'EOF (Ctrl+D / Windows Ctrl+Z then Enter) exits. Lines beginning with # are comments.'];
  }
}
