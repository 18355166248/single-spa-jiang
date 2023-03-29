import { ApplicationProp, AppStatus } from 'src/types';
import { isFunction } from './index';

export const appMaps = new Map<string, ApplicationProp>();

let currentAppName: null | string = null;

export function getCurrentAppName() {
  return currentAppName;
}

export function setCurrentAppName(name: string) {
  currentAppName = name;
}

export function getCurrentApp() {
  return currentAppName && appMaps.get(currentAppName);
}

export function getApp(name: string) {
  return appMaps.get(name);
}

// 修改应用状态 执行声明周期
export function triggerAppHook<K extends keyof ApplicationProp>(
  app: ApplicationProp,
  key: K,
  status: AppStatus,
) {
  app.status = status;
  if (isFunction(app[key])) {
    app[key]();
  }
}
