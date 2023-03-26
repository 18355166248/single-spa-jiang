import { ApplicationProp, AppStatus } from 'src/types';
import { isPromise } from 'src/utils/index';

export default function mount(app: ApplicationProp) {
  app.status = AppStatus.BEFORE_MOUNT;

  let result = (app as any).unmount(app.props);
  if (!isPromise(result)) {
    result = Promise.resolve(result);
  }

  return result
    .then(() => {
      app.status = AppStatus.UNMOUNTED;
    })
    .catch((e: Error) => {
      app.status = AppStatus.UNMOUNT_ERROR;
      throw e;
    });
}
