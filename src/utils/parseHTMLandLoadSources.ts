import { ApplicationProp, SourceProps } from 'src/types';

export default function parseHTMLandLoadSources(app: ApplicationProp) {
  return new Promise<void>(async (resolve, reject) => {
    const entry = app.entry;
    // 加载 html
    const html = await loadSourceHTML(entry);
    const domParser = new DOMParser();
    const doc = domParser.parseFromString(html, 'text/html');
    extractScriptsAndStyle(doc as unknown as Element, app);
  });
}

// 递归解析出 scripts 和 style
function extractScriptsAndStyle(node: Element, app: ApplicationProp) {
  if (!node.children.length) return { scripts: [], styles: [] };

  console.log(node.children);
  const styles: SourceProps[] = [];
  const scripts: SourceProps[] = [];
  for (const child of Array.from(node.children)) {
  }
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
function loadStyle(url: string) {}
function loadScript(url: string) {}
