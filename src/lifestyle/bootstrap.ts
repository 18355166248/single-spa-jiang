import { AnyObj, ApplicationProp, AppStatus } from 'src/types';
import { validteFunction, isPromise, getProps } from 'src/utils/index';
import parseHTMLandLoadSources from 'src/utils/parseHTMLandLoadSources';

declare const window: any;

export default async function bootstrap(app: ApplicationProp) {
  try {
    console.log(app);
    // 加载 html js css
    await parseHTMLandLoadSources(app);
  } catch (error) {
    throw error;
  }
  const { bootstrap, mount, unmount } = await getLifeCycleFuncs(app.name);

  validteFunction('bootstrap', bootstrap);
  validteFunction('mount', mount);
  validteFunction('unmount', unmount);

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
