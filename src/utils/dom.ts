import { AnyObj } from 'src/types';

export function removeNode(node: Node) {
  node.parentNode?.removeChild(node);
}

export function createElement(tag: string, attrs?: AnyObj) {
  const node = document.createElement(tag);
  attrs &&
    Object.keys(attrs).forEach((key) => {
      node.setAttribute(key, attrs[key]);
    });
  return node;
}
