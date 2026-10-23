import { DOMParser, XMLSerializer, DOMImplementation } from '@xmldom/xmldom';
import { Canvas } from '../model/Canvas.js';
import { Shape } from '../model/Shape.js';
import { Group } from '../model/Group.js';
import { Text } from '../model/Text.js';
import { ShapeFactory } from '../model/ShapeFactory.js';
export class SvgCodec {
  private readonly namespace = 'http://www.w3.org/2000/svg';
  decode(source: string): { canvas: Canvas; warnings: string[] } {
    if (/<!DOCTYPE|<!ENTITY/i.test(source)) throw new Error('DTD and entities are not supported');
    const errors: string[] = [];
    const document = new DOMParser({ errorHandler: {
      warning: message => errors.push(message), error: message => errors.push(message), fatalError: message => errors.push(message)
    } }).parseFromString(source, 'image/svg+xml');
    if (errors.length) throw new Error('invalid SVG XML');
    const root = document.documentElement;
    if (!root || root.localName !== 'svg' || (root.namespaceURI && root.namespaceURI !== this.namespace)) throw new Error('expected SVG root');
    if (Array.from({ length: document.childNodes.length }, (_, i) => document.childNodes.item(i)).filter(n => n?.nodeType === 1).length !== 1)
      throw new Error('expected one SVG root');
    const dimension = (key: string, fallback: string): number => Shape.number((root.getAttribute(key) || fallback).replace(/px$/, ''));
    const canvas = new Canvas(dimension('width', '800'), dimension('height', '600'));
    const viewBox = root.getAttribute('viewBox');
    if (viewBox && viewBox.trim().split(/[\s,]+/).map(Number).join(' ') !== `0 0 ${canvas.width} ${canvas.height}`)
      throw new Error('unsupported viewBox: expected 0 0 width height');
    const elements = Array.from({ length: root.getElementsByTagName('*').length }, (_, i) => root.getElementsByTagName('*').item(i)!);
    const ids = new Set<string>();
    for (const element of elements) {
      const id = element.getAttribute('id');
      if (id) { if (ids.has(id)) throw new Error(`id already exists: ${id}`); ids.add(id); }
    }
    const warnings: string[] = [], factory = new ShapeFactory();
    const parse = (element: Element): Shape => {
      if (element.namespaceURI && element.namespaceURI !== this.namespace) throw new Error('unsupported element namespace');
      const tag = element.localName || element.tagName;
      let id = element.getAttribute('id');
      if (!id) {
        let index = 1; while (ids.has(`${tag}${index}`)) index++;
        id = `${tag}${index}`; ids.add(id);
        warnings.push(`warning: assigned id ${id} to unnamed <${tag}>`);
      }
      const shape = factory.empty(tag, id);
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes.item(i)!;
        if (attr.name === 'id' || attr.name === 'xmlns' || attr.name.startsWith('data-')) continue;
        shape.set(attr.name, attr.value);
      }
      for (let i = 0; i < element.childNodes.length; i++) {
        const child = element.childNodes.item(i)!;
        if (child.nodeType === 1) {
          if (!(shape instanceof Group)) throw new Error(`unexpected child of ${shape.label}`);
          shape.insert(parse(child as Element));
        } else if ((child.nodeType === 3 || child.nodeType === 4) && child.nodeValue?.trim() && !(shape instanceof Text))
          throw new Error(`unexpected text in ${shape.label}`);
      }
      if (shape instanceof Text) shape.set('text', element.textContent ?? '');
      return shape;
    };
    // Root presentation attributes inherit through the otherwise invisible root group.
    for (let i = 0; i < root.attributes.length; i++) {
      const attr = root.attributes.item(i)!;
      if (['xmlns', 'width', 'height', 'viewBox', 'id', 'version'].includes(attr.name)) continue;
      canvas.root.set(attr.name, attr.value);
    }
    for (let i = 0; i < root.childNodes.length; i++) {
      const child = root.childNodes.item(i)!;
      if (child.nodeType === 1) canvas.root.insert(parse(child as unknown as Element));
      else if ((child.nodeType === 3 || child.nodeType === 4) && child.nodeValue?.trim()) throw new Error('unexpected text in svg');
    }
    return { canvas, warnings };
  }
  encode(canvas: Canvas): string {
    const document = new DOMImplementation().createDocument(this.namespace, 'svg', null);
    const root = document.documentElement;
    root.setAttribute('xmlns', this.namespace);
    root.setAttribute('width', String(canvas.width)); root.setAttribute('height', String(canvas.height));
    root.setAttribute('viewBox', `0 0 ${canvas.width} ${canvas.height}`);
    for (const [key, value] of canvas.root.attrs) root.setAttribute(key, value);
    const append = (shape: Shape, parent: Element): void => {
      const element = document.createElementNS(this.namespace, shape.tag);
      element.setAttribute('id', shape.id);
      for (const [key, value] of shape.attrs) element.setAttribute(key, value);
      if (shape instanceof Text) element.appendChild(document.createTextNode(shape.content));
      shape.children.forEach(child => append(child, element)); parent.appendChild(element);
    };
    canvas.root.children.forEach(shape => append(shape, root));
    return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(document)}\n`;
  }
}
