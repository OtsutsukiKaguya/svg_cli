import { Shape } from './Shape.js';
export class Rect extends Shape {
  constructor(id: string) { super(id, 'rect', ['x', 'y', 'width', 'height'], ['x'], ['y'], ['width', 'height']); }
  clone(): Shape { return this.copyTo(new Rect(this.id)); }
}
