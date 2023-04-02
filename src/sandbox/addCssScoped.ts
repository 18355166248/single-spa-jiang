import { singleSpaJiang, singleSpaJiangName } from 'src/config';
import { ApplicationProp } from 'src/types';
import { nextTick } from 'src/utils/index';

/**
 * 给每一条 css 选择符添加对应的子应用作用域
 * 1. a {} -> a[single-spa-name=${app.name}] {}
 * 2. a b c {} -> a[single-spa-name=${app.name}] b c {}
 * 3. a, b {} -> a[single-spa-name=${app.name}], b[single-spa-name=${app.name}] {}
 * 4. body {} -> #${子应用挂载容器的 id}[single-spa-name=${app.name}] {}
 * 5. @media @supports 特殊处理，其他规则直接返回 cssText
 */
export function addCssScoped(style: HTMLStyleElement, app: ApplicationProp) {
  // 等 style 挂载带页面上, 给子应用的 style 内容添加作用域
  nextTick(() => {
    // 禁止 style 生效
    style.disabled = true;
    if (style.sheet?.cssRules) {
      style.textContent = handleCssRules(style.sheet?.cssRules, app);
    }
  });
}

function handleCssRules(cssRules: CSSRuleList, app: ApplicationProp) {
  let result = '';

  Array.from(cssRules).forEach((cssRule) => {
    result += handleCssRuleHelper(cssRule, app);
  });

  return result;
}

function handleCssRuleHelper(cssRule: CSSRule, app: ApplicationProp) {
  let result = '';
  const cssText = cssRule.cssText;
  const selectorText = (cssRule as CSSStyleRule).selectorText;
  if (selectorText) {
    result += modifyCSSText(cssRule, app);
  } else if (cssText.startsWith('@media')) {
    result += `
      @media ${(cssRule as CSSMediaRule).conditionText} {
        ${handleCssRules((cssRule as CSSMediaRule).cssRules, app)}
      }
    `;
  } else if (cssText.startsWith('@supports')) {
    result += `
      @supports ${(cssRule as CSSMediaRule).conditionText} {
        ${handleCssRules((cssRule as CSSMediaRule).cssRules, app)}
      }
    `;
  } else {
    result += cssText;
  }

  return result;
}

// 替换原有的 css 选择符
function modifyCSSText(cssRule: CSSRule, app: ApplicationProp) {
  const selectorText = (cssRule as any).selectorText;
  return cssRule.cssText.replace(
    selectorText,
    gerNewSelectorText(selectorText, app),
  );
}

let count = 0;
const reg = /^(\s|,)?(body|html)\b/g;
function gerNewSelectorText(selectorText: string, app: ApplicationProp) {
  const { name, container } = app;
  const arr = selectorText.split(',').map((txt) => {
    const items = txt.trim().split(' ');
    items[0] = `${items[0]}[${singleSpaJiangName}=${name}]`;
    return items.join(' ');
  });

  // 如果子应用没有挂载 id, 自动生成一个 id
  let id = container.id;
  if (!id) {
    id = `${singleSpaJiang}-id-${count++}`;
    container.id = id;
  }

  // 将 body html 替换成子应用的挂载容器id
  return arr.join(',').replace(reg, `#${id}`);
}
