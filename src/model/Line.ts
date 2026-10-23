import { Shape } from './Shape.js';
export class Line extends Shape {
  constructor(id: string) { super(id, 'line', ['x1', 'y1', 'x2', 'y2'], ['x1', 'x2'], ['y1', 'y2']); }
  clone(): Shape { return this.copyTo(new Line(this.id)); }
  override summary(): string { return `${this.label}  (${this.attrs.get('x1')},${this.attrs.get('y1')}) -> (${this.attrs.get('x2')},${this.attrs.get('y2')})${this.attrs.has('stroke') ? ` stroke=${this.attrs.get('stroke')}` : ''}`; }
}
