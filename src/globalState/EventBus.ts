import { isActive } from 'src/application/apps';
import { AppStatus, ApplicationProp } from 'src/types';
import { getApp, getCurrentAppName } from 'src/utils/application';
import { isFunction } from 'src/utils/index';

type CallbackProp = (...args: any) => void;

export default class EventBus {
  private eventsMap: Map<string, Record<string, Array<CallbackProp>>> =
    new Map();

  on(event: string, callback: CallbackProp) {
    if (!isFunction(callback)) {
      throw Error(
        `The second param callback ${typeof callback} is not a function`,
      );
    }

    const appName = getCurrentAppName() || 'parent';
    const { eventsMap } = this;
    if (!eventsMap.get(appName)) {
      eventsMap.set(appName, {});
    }
    const events = eventsMap.get(appName)!;
    if (!events[event]) {
      events[event] = [];
    }
    events[event].push(callback);
  }
  off(event: string, callback?: CallbackProp) {
    const appName = getCurrentAppName() || 'parent';
    const { eventsMap } = this;
    const events = eventsMap.get(appName);
    if (!events || !events[event]) return;

    if (callback) {
      const cbs = events[event];
      let length = cbs.length;
      while (length--) {
        if (callback === cbs[length]) {
          cbs.splice(length, 1);
        }
      }
    } else {
      events[event] = [];
    }
  }
  emit(event: string, ...args: any) {
    this.eventsMap.forEach((events, appName) => {
      const app = getApp(appName) as ApplicationProp;
      // 父元素或者通过 activeRule 来判断当前子应用是否在运行
      if (
        appName === 'parent' ||
        (isActive(app) && app.status === AppStatus.MOUNTED)
      ) {
        if (events[event]?.length) {
          for (const cb of events[event]) {
            cb.call(this, ...args);
          }
        }
      }
    });
  }
  once(event: string, callback: CallbackProp) {
    const self = this;
    function wrap(...args: any) {
      callback.call(self, ...args);
      self.off(event, wrap);
    }

    this.on(event, wrap);
  }
  clearEventsByAppName(appName: string) {
    this.eventsMap.set(appName, {});
  }
}
