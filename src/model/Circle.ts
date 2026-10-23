import { Shape } from './Shape.js';
export class Circle extends Shape {
  constructor(id: string) { super(id, 'circle', ['cx', 'cy', 'r'], ['cx'], ['cy'], ['r']); }
  clone(): Shape { return this.copyTo(new Circle(this.id)); }
}
