import { ApplicationProp, AppStatus } from 'src/types';
import { triggerAppHook } from 'src/utils/application';
import { removeMicroStyles } from 'src/utils/dom';
import { isPromise } from 'src/utils/index';

export default function mount(app: ApplicationProp) {
  triggerAppHook(app, 'beforeUnmount', AppStatus.BEFORE_UNMOUNT);

  let result = (app as any).unmount({
    props: app.props,
    container: app.container,
  });
  if (!isPromise(result)) {
    result = Promise.resolve(result);
  }

  return result
    .then(() => {
      // app.sandbox.stop();
      // app.styles = removeMicroStyles(app.name);
      triggerAppHook(app, 'unmounted', AppStatus.UNMOUNTED);
    })
    .catch((e: Error) => {
      app.status = AppStatus.UNMOUNT_ERROR;
      throw e;
    });
}
