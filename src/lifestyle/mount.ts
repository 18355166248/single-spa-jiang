import { ApplicationProp, AppStatus } from 'src/types';
import { isPromise } from 'src/utils/index';

export default function mount(app: ApplicationProp) {
  app.status = AppStatus.BEFORE_MOUNT;

  let result = (app as any).mount(app.props);
  if (!isPromise(result)) {
    result = Promise.resolve(result);
  }

  return result
    .then(() => {
      app.status = AppStatus.MOUNTED;
    })
    .catch((e: Error) => {
      app.status = AppStatus.MOUNT_ERROR;
      throw e;
    });
}
