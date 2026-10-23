export abstract class Shape {
  private readonly attributes = new Map<string, string>();
  protected constructor(public readonly id: string, public readonly tag: string,
    private readonly geometry: readonly string[], private readonly xFields: readonly string[],
    private readonly yFields: readonly string[], private readonly sizes: readonly string[] = []) {
    if (!id || /\s/.test(id)) throw new Error('invalid id');
    for (const key of geometry) this.attributes.set(key, '0');
  }
  get label(): string { return `${this.tag}#${this.id}`; }
  get children(): readonly Shape[] { return []; }
  get attrs(): ReadonlyMap<string, string> { return new Map(this.attributes); }
  get content(): string { return ''; }
  set(attr: string, value: string): void {
    if (!this.geometry.includes(attr) && !['fill', 'stroke', 'stroke-width'].includes(attr))
      throw new Error(`unknown attribute: ${attr}`);
    if (this.geometry.includes(attr) || attr === 'stroke-width') {
      const n = Shape.number(value);
      if ((this.sizes.includes(attr) || attr === 'stroke-width') && n < 0)
        throw new Error(`${attr} must be non-negative`);
      value = String(n);
    }
    this.attributes.set(attr, value);
  }
  static number(value: string): number {
    if (!value.trim() || !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value) || !Number.isFinite(Number(value)))
      throw new Error(`invalid number: ${value}`);
    return Number(value);
  }
  move(dx: number, dy: number): void {
    for (const key of this.xFields) this.set(key, String(Number(this.attributes.get(key)) + dx));
    for (const key of this.yFields) this.set(key, String(Number(this.attributes.get(key)) + dy));
  }
  scale(factor: number): void {
    for (const key of this.geometry) this.set(key, String(Number(this.attributes.get(key)) * factor));
  }
  protected copyTo(target: Shape): Shape {
    for (const [key, value] of this.attributes) target.set(key, value);
    return target;
  }
  summary(): string {
    return `${this.label}  ${[...this.attributes].map(([k, v]) => `${k === 'width' ? 'w' : k === 'height' ? 'h' : k}=${v}`).join(' ')}`.trimEnd();
  }
  abstract clone(): Shape;
}
