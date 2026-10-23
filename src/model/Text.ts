import { Shape } from './Shape.js';
export class Text extends Shape {
  private value = '';
  constructor(id: string) { super(id, 'text', ['x', 'y'], ['x'], ['y']); }
  override get content(): string { return this.value; }
  override set(attr: string, value: string): void {
    if (attr === 'text') this.value = value;
    else super.set(attr, value);
  }
  clone(): Shape { const copy = new Text(this.id); copy.value = this.value; return this.copyTo(copy); }
  override summary(): string { return `${this.label}  (${this.attrs.get('x')},${this.attrs.get('y')}) ${JSON.stringify(this.value)}${this.attrs.has('fill') ? ` fill=${this.attrs.get('fill')}` : ''}`; }
}
