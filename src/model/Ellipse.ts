import { Shape } from './Shape.js';
export class Ellipse extends Shape {
  constructor(id: string) { super(id, 'ellipse', ['cx', 'cy', 'rx', 'ry'], ['cx'], ['cy'], ['rx', 'ry']); }
  clone(): Shape { return this.copyTo(new Ellipse(this.id)); }
}
