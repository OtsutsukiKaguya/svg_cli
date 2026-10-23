import { createInterface } from 'node:readline';
import { Editor } from '../application/Editor.js';
import { CommandRegistry } from './CommandRegistry.js';
import { Tokenizer } from './Tokenizer.js';
export class Cli {
  private readonly tokenizer = new Tokenizer();
  private readonly commands = new CommandRegistry();
  constructor(private readonly editor: Editor) {}
  runLine(line: string): string[] {
    try {
      const tokens = this.tokenizer.parse(line);
      if (!tokens.length) return [];
      return this.editor.execute(this.commands.get(tokens[0]!), tokens.slice(1));
    } catch (error) { return [`error: ${String(error instanceof Error ? error.message : error).replace(/[\r\n]+/g, ' ')}`]; }
  }
  run(): void {
    console.log("svg-editor 0.1 — type 'help' for commands");
    const terminal = Boolean(process.stdin.isTTY);
    const input = createInterface({ input: process.stdin, output: process.stdout, terminal, prompt: 'svg> ' });
    input.prompt();
    input.on('line', line => {
      if (!terminal) console.log(line);
      this.runLine(line).forEach(message => console.log(message)); input.prompt();
    });
    input.on('close', () => console.log());
  }
}
