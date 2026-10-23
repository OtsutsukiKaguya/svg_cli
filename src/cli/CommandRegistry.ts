import { Command } from '../application/Command.js';
import { InitCommand } from '../commands/InitCommand.js';
import { ReadCommand } from '../commands/ReadCommand.js';
import { SaveCommand } from '../commands/SaveCommand.js';
import { CanvasCommand } from '../commands/CanvasCommand.js';
import { CreateCommand } from '../commands/CreateCommand.js';
import { DeleteCommand } from '../commands/DeleteCommand.js';
import { MoveCommand } from '../commands/MoveCommand.js';
import { ScaleCommand } from '../commands/ScaleCommand.js';
import { SetCommand } from '../commands/SetCommand.js';
import { GroupCommand } from '../commands/GroupCommand.js';
import { UngroupCommand } from '../commands/UngroupCommand.js';
import { AddToCommand } from '../commands/AddToCommand.js';
import { FrontCommand } from '../commands/FrontCommand.js';
import { BackCommand } from '../commands/BackCommand.js';
import { TreeCommand } from '../commands/TreeCommand.js';
import { ShowCommand } from '../commands/ShowCommand.js';
import { HelpCommand } from '../commands/HelpCommand.js';
import { UndoCommand } from '../commands/UndoCommand.js';
import { RedoCommand } from '../commands/RedoCommand.js';
export class CommandRegistry {
  private readonly commands = new Map<string, Command>([
    ['init', new InitCommand()], ['read', new ReadCommand()], ['save', new SaveCommand()],
    ['canvas', new CanvasCommand()], ['create', new CreateCommand()], ['delete', new DeleteCommand()],
    ['move', new MoveCommand()], ['scale', new ScaleCommand()], ['set', new SetCommand()],
    ['group', new GroupCommand()], ['ungroup', new UngroupCommand()], ['addto', new AddToCommand()],
    ['front', new FrontCommand()], ['back', new BackCommand()], ['tree', new TreeCommand()],
    ['show', new ShowCommand()], ['help', new HelpCommand()], ['undo', new UndoCommand()], ['redo', new RedoCommand()]
  ]);
  get(name: string): Command {
    const command = this.commands.get(name);
    if (!command) throw new Error(`unknown command: ${name}`);
    return command;
  }
}
