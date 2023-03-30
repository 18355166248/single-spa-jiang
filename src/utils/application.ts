import { nextTick } from 'process';
import { ApplicationProp, AppStatus } from 'src/types';
import { isFunction } from './index';

export const appMaps = new Map<string, ApplicationProp>();

let currentAppName: null | string = null;

export function getCurrentAppName() {
  return currentAppName;
}

export function setCurrentAppName(name: string | null) {
  currentAppName = name;
}

export function getCurrentApp() {
  return currentAppName && appMaps.get(currentAppName);
}

export function getApp(name: string) {
  return appMaps.get(name);
}

export function changeCurrentAppName(name: string | null) {
  if (name !== currentAppName) {
    currentAppName = name;
    nextTick(() => (currentAppName = null));
  }
}

// 修改应用状态 执行声明周期
export function triggerAppHook<K extends keyof ApplicationProp>(
  app: ApplicationProp,
  key: K,
  status: AppStatus,
) {
  app.status = status;
  if (isFunction(app[key])) {
    // @ts-ignore
    app[key]();
  }
}
