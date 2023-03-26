import { AnyObj, ApplicationProp, AppStatus } from 'src/types';
import { validteFunction, isPromise, getProps } from 'src/utils/index';

export default async function bootstrap(app: ApplicationProp) {
  const { bootstrap, mount, unmount } = await app.loadApp();

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
