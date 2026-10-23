import { readFileSync, writeFileSync, renameSync, unlinkSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { Canvas } from '../model/Canvas.js';
import type { FilePort } from '../application/FilePort.js';
import { SvgCodec } from './SvgCodec.js';
export class SvgFileStore implements FilePort {
  private readonly codec = new SvgCodec();
  read(path: string): { canvas: Canvas; warnings: string[] } {
    let source: string;
    try { source = readFileSync(path, 'utf8'); } catch { throw new Error(`cannot read file: ${path}`); }
    return this.codec.decode(source);
  }
  write(path: string, canvas: Canvas): void {
    const temporary = `${path}.${randomUUID()}.tmp`;
    try {
      const source = this.codec.encode(canvas);
      writeFileSync(temporary, source, { encoding: 'utf8', flag: 'wx' }); renameSync(temporary, path);
    } catch { throw new Error(`cannot write file: ${path}`); }
    finally { try { unlinkSync(temporary); } catch { /* No temporary remains after a successful rename. */ } }
  }
}
