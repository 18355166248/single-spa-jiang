import {
  originalAppendChild,
  originalInsertBefore,
} from 'src/utils/originalEnv';

export function patchDocument() {
  Element.prototype.appendChild = function <T extends Node>(node: T): any {
    return patchAddChild(this, node, null, 'append');
  };
  Element.prototype.insertBefore = function <T extends Node>(
    node: T,
    referenceNode: Node | null,
  ): any {
    return patchAddChild(this, node, referenceNode, 'insert');
  };
}

const tags = ['LINK', 'SCRIPT', 'STYLE'];
function patchAddChild(
  parent: Node,
  child: any,
  referenceNode: Node | null,
  type: 'append' | 'insert',
) {
  const tagName = child.tagName;
  if (!tags.includes(tagName)) {
    return addChild(parent, child, referenceNode, type);
  }
}

function addChild(
  parent: Node,
  child: any,
  referenceNode: Node | null,
  type: 'append' | 'insert',
) {
  if (type === 'append') {
    return originalAppendChild.call(parent, child);
  }

  return originalInsertBefore.call(parent, child, referenceNode);
}
