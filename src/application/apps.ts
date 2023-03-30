import { ApplicationProp, AppStatus } from 'src/types';
import { appMaps } from 'src/utils/application';
import { originalWindow } from 'src/utils/originalEnv';
import bootstrapApp from '../lifestyle/bootstrap';
import mountApp from '../lifestyle/mount';
import unmountApp from '../lifestyle/unmount';

export async function loadApps() {
  // 找到所有运行中的 app, 执行销毁
  const unmountAppList = getAppsStatus(AppStatus.MOUNTED);
  await Promise.all(unmountAppList.map(unmountApp));

  // 找到所有状态为创立前, 执行创立
  const loadAppList = getAppsStatus(AppStatus.BEFORE_BOOTSTRAP);
  await Promise.all(loadAppList.map(bootstrapApp));

  // 找到所有状态为渲染和销毁的组件, 执行渲染
  const mountAppList = [
    ...getAppsStatus(AppStatus.BOOTSTRAPPED),
    ...getAppsStatus(AppStatus.UNMOUNTED),
  ];
  await mountAppList.map(mountApp);
}

function getAppsStatus(status: AppStatus) {
  const result: ApplicationProp[] = [];

  appMaps.forEach((app) => {
    // 子应用路由匹配上且状态匹配上 且不是 MOUNTED
    if (isActive(app) && app.status === status) {
      switch (app.status) {
        case AppStatus.BEFORE_BOOTSTRAP:
        case AppStatus.BOOTSTRAPPED:
        case AppStatus.UNMOUNTED:
          result.push(app);
          break;
      }
    } else if (
      // 不满足上述条件 但是子应用是渲染阶段且想要获取渲染阶段
      app.status === AppStatus.MOUNTED &&
      status === AppStatus.MOUNTED
    ) {
      result.push(app);
    }
  });

  return result;
}

function isActive(app: ApplicationProp) {
  return (
    typeof app.activeRule === 'function' &&
    app.activeRule(originalWindow.location)
  );
}
