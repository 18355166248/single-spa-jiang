import { addCssScoped } from 'src/sandbox/addCssScoped';
import { ApplicationProp, SourceProps } from 'src/types';
import { addStyles, createElement, removeNode } from './dom';
import { isFunction, isURl } from './index';

const head = document.head;

export default function parseHTMLandLoadSources(app: ApplicationProp) {
  return new Promise<void>(async (resolve, reject) => {
    const entry = app.entry;
    if (!isURl(entry)) {
      return reject(Error(`${entry} 不是一个合法的 url`));
    }

    // 加载 html
    let html = '';
    try {
      html = await loadSourceHTML(entry);
    } catch (error) {
      reject(error);
    }
    const domParser = new DOMParser();
    const doc = domParser.parseFromString(html, 'text/html');

    const { styles, scripts } = extractScriptsAndStyle(
      doc as unknown as Element,
      app,
    );

    // 提取了 style 和 script 之后的 html
    app.pageBody = doc.body.innerHTML;

    let loadStylesSuccess = false;
    let loadScriptsSuccess = false;
    Promise.all(loadStyles(styles))
      .then((data) => {
        loadStylesSuccess = true;

        const list = data.filter((v) => v) as string[];
        app.styles = list;
        if (loadStylesSuccess && loadScriptsSuccess) resolve();
      })
      .catch((error) => {
        reject(error);
      });

    Promise.all(loadScripts(scripts))
      .then((data) => {
        loadScriptsSuccess = true;

        const list = data.filter((v) => v) as string[];
        app.scripts = list;
        if (loadStylesSuccess && loadScriptsSuccess) resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export const globalLoadedURLs: string[] = [];
// 递归解析出 scripts 和 style
function extractScriptsAndStyle(node: Element, app: ApplicationProp) {
  if (!node.children.length) return { scripts: [], styles: [] };

  let styles: SourceProps[] = [];
  let scripts: SourceProps[] = [];
  for (const child of Array.from(node.children)) {
    const isGlobal = Boolean(child.getAttribute('global'));
    const tagName = child.tagName;
    if (tagName === 'STYLE') {
      removeNode(child);
      styles.push({
        isGlobal,
        value: child.textContent || '',
      });
    } else if (tagName === 'LINK') {
      removeNode(child);
      const href = child.getAttribute('href') || '';
      if (app.loadURLs.includes(href) || globalLoadedURLs.includes(href)) {
        continue;
      }

      if (child.getAttribute('rel') === 'stylesheet' && href) {
        styles.push({
          url: href,
          isGlobal,
          value: '',
        });
        if (isGlobal) {
          globalLoadedURLs.push(href);
        } else {
          app.loadURLs.push(href);
        }
      }
    } else if (tagName === 'SCRIPT') {
      removeNode(child);
      removeNode(child);
      const src = child.getAttribute('src') || '';
      if (app.loadURLs.includes(src) || globalLoadedURLs.includes(src)) {
        continue;
      }

      const config: SourceProps = {
        isGlobal,
        type: child.getAttribute('type'),
        value: child.textContent || '',
      };
      if (src) {
        config.url = src;
        if (isGlobal) {
          globalLoadedURLs.push(src);
        } else {
          app.loadURLs.push(src);
        }
      }

      scripts.push(config);
    } else {
      const result = extractScriptsAndStyle(child, app);
      styles = styles.concat(result.styles);
      scripts = scripts.concat(result.scripts);
    }
  }

  return {
    styles,
    scripts,
  };
}

function loadSourceHTML(url: string) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = (res: any) => {
      resolve(res.target.response);
    };
    xhr.onerror = reject;
    xhr.onabort = reject;
    xhr.open('get', url);
    xhr.send();
  });
}

// 生成 link 或者 style 标签
function loadStyles(styles: SourceProps[]) {
  if (!styles.length) return [];
  return styles.map((item) => {
    if (item.isGlobal) {
      if (item.url) {
        const link = createElement('link', {
          global: item.isGlobal,
          type: 'stylesheet',
          textContent: item.url,
        });
        head.appendChild(link);
      } else {
        const style = createElement('style', {
          global: item.isGlobal,
          type: 'text/css',
          textContent: item.value,
        });
        head.appendChild(style);
      }
      return;
    }

    if (item.url) return loadSourceHTML(item.url);
    return Promise.resolve(item.value);
  });
}

// 加载 scripts 代码
function loadScripts(scripts: SourceProps[]) {
  if (!scripts.length) return [];

  return scripts.map((item) => {
    const type = item.type || 'text/javascript';
    if (item.isGlobal) {
      const script = createElement('script', {
        type,
        global: item.isGlobal,
      });
      if (item.url) {
        script.setAttribute('src', item.url);
      } else {
        script.textContent = item.value;
      }
      head.appendChild(script);
      return;
    }

    if (item.url) return loadSourceHTML(item.url);
    return Promise.resolve(item.value);
  });
}

// 执行 javascript
export function executeScripts(scripts: string[], app: ApplicationProp) {
  try {
    scripts.forEach((code) => {
      if (isFunction(app.loader)) {
        // @ts-ignore
        code = app.loader(code);
      }
      // ts使用 with 会报错 需要处理下
      // 将子应用的 js 代码全局 window 环境指向代理 proxyWindow
      const wrapUpCode = `
        ;(function(proxyWindow) {
          with (proxyWindow) {
            (function(window){${code}\n}).call(proxyWindow, proxyWindow)
          }
        })(this)
      `;
      new Function('window', wrapUpCode).call(app.sandbox.proxyWindow);
    });
  } catch (error) {
    throw error;
  }
}

// 远程获取js 并执行
export async function fetchScriptAndExecute(src: string, app: ApplicationProp) {
  try {
    const code = await loadSourceHTML(src);
    executeScripts([code], app);
  } catch (error) {
    throw error;
  }
}

// 远程获取style并替换
export async function fetchStyleAndReplaceStyleContent(
  style: HTMLStyleElement,
  src: string,
  app: ApplicationProp,
) {
  try {
    const css = await loadSourceHTML(src);
    style.textContent = css;
    if (app.sandboxConfig.css) {
      addCssScoped(style, app);
    }
  } catch (error) {
    throw error;
  }
}
