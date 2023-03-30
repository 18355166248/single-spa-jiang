import { singleSpaJiang } from 'src/config';
import { AnyObj } from 'src/types';
import { originalWindow } from './originalEnv';

const head = document.head;

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

export function addStyles(styles: (string | HTMLStyleElement)[]) {
  styles.forEach((item) => {
    if (typeof item === 'string') {
      const style = createElement('style', {
        type: 'text/css',
        textContent: item,
      });
      head.appendChild(style);
    } else {
      head.appendChild(item);
    }
  });
}

const windowEventNames: string[] = [];
export function getWindowEventNames() {
  if (windowEventNames.length) return windowEventNames;

  for (const key of Object.keys(originalWindow)) {
    if (typeof key === 'string' && key.startsWith('on')) {
      windowEventNames.push(key.slice(2));
    }
  }

  return windowEventNames;
}

// 判断是否是唯一的 dom
export function isUniqueElement(selector: string) {
  return (
    /^body$/i.test(selector) ||
    /^head$/i.test(selector) ||
    /^html$/i.test(selector)
  );
}

// 删除子应用的style标签
export function removeMicroStyles(appName: string) {
  const styles = document.querySelectorAll(
    `style[${singleSpaJiang}-name=${appName}]`,
  );
  styles.forEach((style) => {
    removeNode(style);
  });
  return styles as unknown as (string | HTMLStyleElement)[];
}
