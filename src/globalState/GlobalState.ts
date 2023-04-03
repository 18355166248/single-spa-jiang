import { AnyObj, AppStatus, ApplicationProp } from 'src/types';
import EventBus from './EventBus';
import { getApp, getCurrentAppName } from 'src/utils/application';
import { isActive } from 'src/application/apps';

type CallbackProp = (state: AnyObj, operator: string, key?: string) => void;

export class GlobalState extends EventBus {
  private state: AnyObj = {}; // 全局数据池
  private stateChangeCallbacksMaps: Map<string, Array<CallbackProp>> =
    new Map(); // 监听数据池改变的回调池

  set(key: string, val: any) {
    this.state[key] = val;
    this.emitChange('set', key);
  }
  get(key: string) {
    return this.state[key];
  }
  getAll() {
    return this.state;
  }
  delete(key: string) {
    delete this.state[key];
    this.emitChange(key, 'delete');
  }
  clear() {
    this.state = {};
    this.stateChangeCallbacksMaps.clear();
    this.emit('clear');
  }
  // 初始化监听回调
  onChange(callback: CallbackProp) {
    const appName = getCurrentAppName();
    if (!appName) return;

    const { stateChangeCallbacksMaps } = this;
    if (!stateChangeCallbacksMaps.has(appName)) {
      stateChangeCallbacksMaps.set(appName, []);
    }
    stateChangeCallbacksMaps.get(appName)?.push(callback);
  }
  // 触发监听回调
  emitChange(operator: string, key?: string) {
    this.stateChangeCallbacksMaps.forEach((callbacks, appName) => {
      const app = getApp(appName) as ApplicationProp;
      // 通过 activeRule 来判断当前子应用是否激活
      if (!(isActive(app) && app.status === AppStatus.MOUNTED)) return;
      callbacks.forEach((cb) => cb(this.state, operator, key));
    });
  }

  clearGlobalStateByAppName(appName: string) {
    this.stateChangeCallbacksMaps.set(appName, []);
    this.clearEventsByAppName(appName);
  }
}
