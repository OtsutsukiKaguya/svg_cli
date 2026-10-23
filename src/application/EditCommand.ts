import { Command } from './Command.js';
export abstract class EditCommand extends Command { override readonly editing = true; }
