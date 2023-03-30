import { ApplicationProp, AppStatus } from 'src/types';
import { triggerAppHook } from 'src/utils/application';
import { addStyles } from 'src/utils/dom';
import { isPromise } from 'src/utils/index';

export default function mount(app: ApplicationProp) {
  triggerAppHook(app, 'beforeMount', AppStatus.BEFORE_MOUNT);

  if (!app.isFirstLoad) {
    // 恢复子应用的快照
    app.sandbox.restoreMicroSnapshot();
    app.sandbox.start();
    // bootstrap 生成的 html 塞入之前配置好的 节点中
    app.container.innerHTML = app.pageBody;
    addStyles(app.styles);
  } else {
    app.isFirstLoad = false;
  }

  let result = (app as any).mount(app.props);
  if (!isPromise(result)) {
    result = Promise.resolve(result);
  }

  return result
    .then(() => {
      triggerAppHook(app, 'mounted', AppStatus.MOUNTED);
    })
    .catch((e: Error) => {
      app.status = AppStatus.MOUNT_ERROR;
      throw e;
    });
}
