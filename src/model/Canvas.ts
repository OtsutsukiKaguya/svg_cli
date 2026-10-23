import { Group } from './Group.js';
import { Shape } from './Shape.js';
export class Canvas {
  private rootGroup = new Group('__root__');
  private w: number;
  private h: number;
  constructor(width = 800, height = 600) { this.w = width; this.h = height; this.resize(width, height); }
  get width(): number { return this.w; }
  get height(): number { return this.h; }
  get root(): Group { return this.rootGroup; }
  resize(w: number, h: number): void {
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) throw new Error('canvas dimensions must be positive');
    this.w = w; this.h = h;
  }
  all(): Shape[] {
    const result: Shape[] = [];
    const visit = (shape: Shape): void => { result.push(shape); shape.children.forEach(visit); };
    this.root.children.forEach(visit); return result;
  }
  find(id: string): Shape {
    const found = this.all().find(shape => shape.id === id);
    if (!found) throw new Error(`no such shape: ${id}`);
    return found;
  }
  available(id: string): void { if (this.all().some(shape => shape.id === id)) throw new Error(`id already exists: ${id}`); }
  container(id: string): Group {
    const shape = this.all().find(item => item.id === id);
    if (!shape) throw new Error(`no such container: ${id}`);
    if (!(shape instanceof Group)) throw new Error(`not a container: ${id}`);
    return shape;
  }
  parent(shape: Shape): Group {
    const parent = [this.root, ...this.all()].find(item => item instanceof Group && item.children.includes(shape));
    if (!(parent instanceof Group)) throw new Error('shape has no parent');
    return parent;
  }
  clone(): Canvas { const copy = new Canvas(this.w, this.h); copy.rootGroup = this.root.clone(); return copy; }
}
