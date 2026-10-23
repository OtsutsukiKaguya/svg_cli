import type { Canvas } from '../model/Canvas.js';
export interface FilePort {
  read(path: string): { canvas: Canvas; warnings: string[] };
  write(path: string, canvas: Canvas): void;
}
