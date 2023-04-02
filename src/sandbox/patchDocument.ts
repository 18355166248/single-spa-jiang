import { singleSpaJiang } from 'src/config';
import {
  getApp,
  getCurrentApp,
  getCurrentAppName,
  setCurrentAppName,
} from 'src/utils/application';
import { isUniqueElement } from 'src/utils/dom';
import {
  originalAppendChild,
  originalCreateElement,
  originalDocument,
  originalGetElementById,
  originalGetElementsByClassName,
  originalGetElementsByName,
  originalGetElementsByTagName,
  originalInsertBefore,
  originalQuerySelector,
  originalQuerySelectorAll,
} from 'src/utils/originalEnv';
import {
  executeScripts,
  fetchScriptAndExecute,
  fetchStyleAndReplaceStyleContent,
  globalLoadedURLs,
} from 'src/utils/parseHTMLandLoadSources';
import { addCssScoped } from './addCssScoped';

const head = originalDocument.head;

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
  Document.prototype.createElement = function (
    tag: string,
    options: ElementCreationOptions,
  ): HTMLElement {
    const appName = getCurrentAppName();
    const element = originalCreateElement.call(this, tag, options);
    // 给子应用创建的节点打上子应用的标志
    appName && element.setAttribute(`${singleSpaJiang}-name`, appName);
    return element;
  };

  // 将所有查询 dom 的范围限制在子应用的节点范围内
  Document.prototype.querySelector = function (
    this: Document,
    selector: string,
  ) {
    const app = getCurrentApp();
    if (!app || !selector || isUniqueElement(selector)) {
      return originalQuerySelector.call(this, selector);
    }

    return app.container.querySelector(selector);
  };
  Document.prototype.querySelectorAll = function (
    this: Document,
    selector: string,
  ) {
    const app = getCurrentApp();
    if (!app || !selector || isUniqueElement(selector)) {
      return originalQuerySelectorAll.call(this, selector);
    }

    return app.container.querySelectorAll(selector);
  };

  Document.prototype.getElementById = function (id: string) {
    return getElementHelper(
      this,
      originalGetElementById,
      'querySelector',
      'id',
      '#id',
    );
  };
  Document.prototype.getElementsByClassName = function getElementsByClassName(
    className: string,
  ) {
    return getElementHelper(
      this,
      originalGetElementsByClassName,
      'getElementsByClassName',
      className,
      className,
    );
  };
  Document.prototype.getElementsByName = function getElementsByName(
    elementName: string,
  ) {
    return getElementHelper(
      this,
      originalGetElementsByName,
      'querySelectorAll',
      elementName,
      `[name=${elementName}]`,
    );
  };
  Document.prototype.getElementsByTagName = function getElementsByTagName(
    tagName: string,
  ) {
    return getElementHelper(
      this,
      originalGetElementsByTagName,
      'getElementsByTagName',
      tagName,
      tagName,
    );
  };
}

// 重置
export function releaseDocument() {
  setCurrentAppName(null);
  Element.prototype.appendChild = originalAppendChild;
  Element.prototype.insertBefore = originalInsertBefore;
  Document.prototype.createElement = originalCreateElement;
  Document.prototype.querySelector = originalQuerySelector;
  Document.prototype.querySelectorAll = originalQuerySelectorAll;
  Document.prototype.getElementById = originalGetElementById;
  Document.prototype.getElementsByClassName = originalGetElementsByClassName;
  Document.prototype.getElementsByName = originalGetElementsByName;
  Document.prototype.getElementsByTagName = originalGetElementsByTagName;
}

function getElementHelper(
  parent: Document,
  originalFunc: Function,
  funName: string,
  originalSelector: string,
  selector: string,
) {
  const app = getCurrentApp();
  if (!app || !originalSelector) {
    return originalFunc.call(parent, originalSelector);
  }

  return (app.container as any)[funName](selector);
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

  const appName = child.getAttribute(`${singleSpaJiang}-name`);
  const app = getApp(appName);
  if (!appName || !app) return addChild(parent, child, referenceNode, type);

  // 所有的 style 放到 head 下
  if (tagName === 'STYLE') {
    if (app.sandboxConfig.css) {
      addCssScoped(child, app);
    }
    return addChild(head, child, referenceNode, type);
  }
  if (tagName === 'SCRIPT') {
    const src = child.src;
    if (src && !globalLoadedURLs.includes(src) && !app.loadURLs.includes(src)) {
      if (child.getAttribute('global')) {
        globalLoadedURLs.push(src);
      } else {
        app.loadURLs.push(src);
      }
      fetchScriptAndExecute(src, app);
      return;
    }

    executeScripts([child.textContent as string], app);
    return;
  }

  if (
    child.rel === 'stylesheet' &&
    child.href &&
    !globalLoadedURLs.includes(child.href) &&
    !app.loadURLs.includes(child.href)
  ) {
    const href = child.href;
    if (child.getAttribute('global')) {
      globalLoadedURLs.push(href);
    } else {
      app.loadURLs.push(href);
    }

    const style = document.createElement('style');
    style.setAttribute('type', 'text/css');

    fetchStyleAndReplaceStyleContent(style, href, app);
    return addChild(head, child, referenceNode, type);
  }

  return addChild(parent, child, referenceNode, type);
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
