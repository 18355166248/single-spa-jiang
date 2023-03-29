import Sandbox from 'src/sandbox/Sandbox';
import { AnyObj, ApplicationProp, AppStatus } from 'src/types';
import { triggerAppHook } from 'src/utils/application';
import { addStyles } from 'src/utils/dom';
import { validateFunction, isPromise, getProps } from 'src/utils/index';
import parseHTMLandLoadSources, {
  executeScripts,
} from 'src/utils/parseHTMLandLoadSources';

declare const window: any;

export default async function bootstrap(app: ApplicationProp) {
  triggerAppHook(app, 'beforeBootstrap', AppStatus.BEFORE_BOOTSTRAP);

  try {
    // 加载 html js css
    await parseHTMLandLoadSources(app);
  } catch (error) {
    app.status = AppStatus.BOOTSTRAP_ERROR;
    throw error;
  }

  // 初始化沙箱
  app.sandbox = new Sandbox(app);

  // 加载样式和执行js
  addStyles(app.styles);
  executeScripts(app.scripts, app);

  const { bootstrap, mount, unmount } = await getLifeCycleFuncs(app.name);

  validateFunction('bootstrap', bootstrap);
  validateFunction('mount', mount);
  validateFunction('unmount', unmount);

  app.bootstrap = bootstrap;
  app.mount = mount;
  app.unmount = unmount;
  try {
    app.props = getProps(app.props);
  } catch (e) {
    app.status = AppStatus.BOOTSTRAP_ERROR;
    throw e;
  }

  let result = (app as any).bootstrap(app.props);
  if (!isPromise(result)) {
    result = Promise.resolve(result);
  }

  return result
    .then(() => {
      app.status = AppStatus.BOOTSTRAPPED;
    })
    .catch((e: Error) => {
      app.status = AppStatus.BOOTSTRAP_ERROR;
      throw e;
    });
}

function getLifeCycleFuncs(name: string) {
  const result = window[`single-spa-jiang-${name}`];
  if (typeof result === 'function') {
    return result();
  }
  if (typeof result === 'object') {
    return result;
  }

  throw new Error(
    `The micro app must inject the lifecycle("bootstrap" "mount" "unmount") into window['mini-single-spa-${name}']`,
  );
}
