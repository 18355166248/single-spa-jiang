import Sandbox from 'src/sandbox/Sandbox';
import { AnyObj, ApplicationProp, AppStatus } from 'src/types';
import { triggerAppHook } from 'src/utils/application';
import { addStyles } from 'src/utils/dom';
import { validateFunction, isPromise, getProps } from 'src/utils/index';
import parseHTMLandLoadSources, {
  executeScripts,
} from 'src/utils/parseHTMLandLoadSources';

export default async function bootstrap(app: ApplicationProp) {
  triggerAppHook(app, 'beforeBootstrap', AppStatus.BEFORE_BOOTSTRAP);

  try {
    // TODO react-router6 存在初始化执行一次 replaceState 的情况 也就是会再次执行 bootstrap 这个时候 window 已经被上一个代理了 bootstrap 再次执行会报错 所以需要更新状态 表示 bootstrap 已经在执行了
    app.status = AppStatus.BEFORE_BOOTSTRAP_LOADING;
    // 加载 html js css
    await parseHTMLandLoadSources(app);
  } catch (error) {
    app.status = AppStatus.BOOTSTRAP_ERROR;
    throw error;
  }

  // 初始化沙箱
  app.sandbox = new Sandbox(app);
  app.sandbox.start();
  app.container.innerHTML = app.pageBody;

  // 加载样式和执行js
  addStyles(app.styles);
  executeScripts(app.scripts, app);

  const { bootstrap, mount, unmount } = await getLifeCycleFuncs(app);

  validateFunction('mount', mount);
  validateFunction('unmount', unmount);

  app.bootstrap = bootstrap || (() => {});
  app.mount = mount;
  app.unmount = unmount;

  try {
    app.props = getProps(app.props);
  } catch (e) {
    app.status = AppStatus.BOOTSTRAP_ERROR;
    throw e;
  }

  // 子应用首次加载的脚本执行完就不需要了
  app.scripts.length = 0;
  // 记录当前 window 快照 重新挂载子应用时恢复
  app.sandbox.recordMicroSnapshot();

  let result = (app as any).bootstrap(app.props);
  if (!isPromise(result)) {
    result = Promise.resolve(result);
  }

  return result
    .then(() => {
      triggerAppHook(app, 'bootstrap', AppStatus.BOOTSTRAPPED);
    })
    .catch((e: Error) => {
      app.status = AppStatus.BOOTSTRAP_ERROR;
      throw e;
    });
}

function getLifeCycleFuncs(app: ApplicationProp) {
  const result = app.sandbox.proxyWindow.__SINGLE_SPA__JIANG__;
  if (typeof result === 'function') {
    return result();
  }
  if (typeof result === 'object') {
    return result;
  }
  throw new Error(
    `The micro app must inject the lifecycle("bootstrap" "mount" "unmount") into window['single-spa-jiang-${app.name}']`,
  );
}
