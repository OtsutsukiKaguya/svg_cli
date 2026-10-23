import { Shape } from './Shape.js';
import { Rect } from './Rect.js';
import { Circle } from './Circle.js';
import { Ellipse } from './Ellipse.js';
import { Line } from './Line.js';
import { Text } from './Text.js';
import { Group } from './Group.js';
export class ShapeFactory {
  private readonly types = new Map<string, { make: (id: string) => Shape; params: string[]; style?: string }>([
    ['rect', { make: id => new Rect(id), params: ['x', 'y', 'width', 'height'], style: 'fill' }],
    ['circle', { make: id => new Circle(id), params: ['cx', 'cy', 'r'], style: 'fill' }],
    ['ellipse', { make: id => new Ellipse(id), params: ['cx', 'cy', 'rx', 'ry'], style: 'fill' }],
    ['line', { make: id => new Line(id), params: ['x1', 'y1', 'x2', 'y2'], style: 'stroke' }],
    ['text', { make: id => new Text(id), params: ['x', 'y', 'text'] }],
    ['g', { make: id => new Group(id), params: [] }]
  ]);
  private definition(type: string) {
    const definition = this.types.get(type);
    if (!definition) throw new Error(`unknown shape type: ${type} (is the plugin loaded?)`);
    return definition;
  }
  empty(type: string, id: string): Shape { return this.definition(type).make(id); }
  create(type: string, id: string, args: string[]): Shape {
    const definition = this.definition(type);
    if (args.length < definition.params.length || args.length > definition.params.length + (definition.style ? 1 : 0))
      throw new Error(`invalid parameters for ${type}`);
    const shape = definition.make(id);
    definition.params.forEach((key, i) => shape.set(key, args[i]!));
    if (definition.style && args.length > definition.params.length) shape.set(definition.style, args.at(-1)!);
    return shape;
  }
}
