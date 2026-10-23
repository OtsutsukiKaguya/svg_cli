import { Shape } from './Shape.js';
export class Group extends Shape {
  private readonly items: Shape[] = [];
  constructor(id: string) { super(id, 'g', [], [], []); }
  override get children(): readonly Shape[] { return [...this.items]; }
  insert(shape: Shape, index = this.items.length): void { this.items.splice(index, 0, shape); }
  remove(shape: Shape): void {
    const index = this.items.indexOf(shape);
    if (index < 0) throw new Error('shape is not a child');
    this.items.splice(index, 1);
  }
  contains(shape: Shape): boolean { return this === shape || this.items.some(child => child === shape || child instanceof Group && child.contains(shape)); }
  override move(dx: number, dy: number): void { this.items.forEach(child => child.move(dx, dy)); }
  override scale(factor: number): void { this.items.forEach(child => child.scale(factor)); }
  clone(): Group { const copy = new Group(this.id); this.copyTo(copy); this.items.forEach(child => copy.insert(child.clone())); return copy; }
}
