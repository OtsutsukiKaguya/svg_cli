import { Editor } from './application/Editor.js';
import { Cli } from './cli/Cli.js';
import { SvgFileStore } from './infrastructure/SvgFileStore.js';
new Cli(new Editor(new SvgFileStore())).run();
