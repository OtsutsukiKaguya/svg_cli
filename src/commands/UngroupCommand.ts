import { EditCommand } from '../application/EditCommand.js';
import { Editor } from '../application/Editor.js';
export class UngroupCommand extends EditCommand {
  execute(editor: Editor, args: string[]): string[] {
    this.count(args, 1); const canvas = editor.canvas, group = canvas.container(args[0]!);
    const parent = canvas.parent(group);
    if (parent === canvas.root) throw new Error(`cannot ungroup top-level container: ${group.id}`);
    const index = parent.children.indexOf(group);
    // Preserve inherited presentation attributes when removing a group.
    for (const child of group.children) for (const [key, value] of group.attrs)
      if (!child.attrs.has(key)) child.set(key, value);
    parent.remove(group);
    group.children.forEach((child, offset) => parent.insert(child, index + offset));
    return [`${group.label} ungrouped`];
  }
}
