import { ApplicationProp, MicroWindow } from 'src/types';
import { changeCurrentAppName } from 'src/utils/application';
import { deepClone } from 'src/utils/deepClone';
import { getWindowEventNames } from 'src/utils/dom';
import { isFunction } from 'src/utils/index';
import {
  originalDefineProperty,
  originalDocument,
  originalEval,
  originalWindow,
  originalWindowAddEventListener,
  originalWindowRemoveEventListener,
} from 'src/utils/originalEnv';
import { patchDocument, releaseDocument } from './patchDocument';
import {
  documentEventMap,
  patchDocumentEvents,
  releaseAppDocumentEvent,
  releaseDocumentEvents,
} from './patchDocumentEvents';

/**
 * js 沙箱 用户隔离子应用 window 作用域
 */
export default class Sandbox {
  // 当前存活的子应用数量
  static activeCount = 0;
  // 子应用 window 代理对象
  public proxyWindow: MicroWindow = {};
  // 子应用 window 对象
  public microAppWindow: MicroWindow = {};
  // 子应用名称
  private appName = '';
  // 记录子应用第一次 mount 前的 window 快照
  private microSnapshot = new Map<string | symbol, Map<string | symbol, any>>();
  // 子应用是否激活
  private active = false;
  // 子应用向 window 注入的 key
  private injectKeySet = new Set<string | symbol>();
  // 子应用 setTimeout 集合, 退出子应用清除
  private timeoutSet = new Set<number>();
  // 子应用 setInterval 集合, 退出子应用清除
  private intervalSet = new Set<number>();
  // 子应用 requestIdleCallback 集合, 退出子应用清除
  private idleSet = new Set<number>();
  // 子应用绑定到 window 上的事件集合, 退出子应用清除
  private windowEventMap = new Map<
    string | symbol,
    { listener: any; options: any }[]
  >();
  // 子应用 window onXXX 上的事件集合, 退出子应用清除
  private onWindowEventMap = new Map<
    string,
    EventListenerOrEventListenerObject
  >();

  constructor(app: ApplicationProp) {
    this.microSnapshot.set('attrs', new Map<string | symbol, any>());
    this.microSnapshot.set('windowEvent', new Map<string | symbol, any>());
    this.microSnapshot.set('onWindowEvent', new Map<string | symbol, any>());
    this.microSnapshot.set('documentEvent', new Map<string | symbol, any>());

    this.appName = app.name;
    this.hijackProperties(); // 劫持 window 属性
    this.proxyWindow = this.createProxyWindow(this.appName);
  }

  // 开启沙箱
  start() {
    const { active } = this;
    if (active) return;

    this.active = true;
    // 如果当前子应用为第一个
    if (++Sandbox.activeCount === 1) {
      patchDocument();
      patchDocumentEvents();
    }
  }
  // 关闭沙箱
  stop() {
    const { active } = this;
    if (!active) return;
    this.active = false;

    const {
      injectKeySet,
      microAppWindow,
      timeoutSet,
      intervalSet,
      idleSet,
      windowEventMap,
      onWindowEventMap,
    } = this;

    for (const key of injectKeySet) {
      Reflect.deleteProperty(microAppWindow, key);
    }
    for (const key of timeoutSet) {
      originalWindow.clearTimeout(key);
    }
    for (const key of intervalSet) {
      originalWindow.clearInterval(key);
    }
    for (const key of idleSet) {
      originalWindow.cancelIdleCallback(key);
    }
    for (const [type, arr] of windowEventMap) {
      for (const item of arr) {
        originalWindowRemoveEventListener.call(
          originalWindow,
          type as string,
          item.listener,
          item.options,
        );
      }
    }

    getWindowEventNames().forEach((eventName) => {
      const fn = onWindowEventMap.get(eventName);
      fn &&
        originalWindowRemoveEventListener.call(originalWindow, eventName, fn);
    });

    injectKeySet.clear();
    timeoutSet.clear();
    intervalSet.clear();
    idleSet.clear();
    windowEventMap.clear();
    onWindowEventMap.clear();
    releaseAppDocumentEvent(this.appName);

    // 当所有子应用全部卸载后
    if (--Sandbox.activeCount === 0) {
      releaseDocument();
      releaseDocumentEvents();
    }
  }
  // 记录子应用快照
  recordMicroSnapshot() {
    const {
      microSnapshot,
      injectKeySet,
      windowEventMap,
      onWindowEventMap,
      microAppWindow,
      appName,
    } = this;
    const recordAttrs = microSnapshot.get('attrs')!;
    const recordWindowEvent = microSnapshot.get('windowEvent')!;
    const recordOnWindowEvent = microSnapshot.get('onWindowEvent')!;
    const recordDocumentEvent = microSnapshot.get('documentEvent')!;

    injectKeySet.forEach((key) => {
      recordAttrs.set(key, microAppWindow[key]);
    });
    windowEventMap.forEach((arr, type) => {
      recordWindowEvent.set(type, deepClone(arr));
    });
    onWindowEventMap.forEach((func, type) => {
      recordOnWindowEvent.set(type, func);
    });
    documentEventMap.get(appName)?.forEach((appMap, type) => {
      recordDocumentEvent.set(type, deepClone(appMap));
    });
  }
  // 恢复子应用快照
  restoreMicroSnapshot() {
    const {
      microSnapshot,
      injectKeySet,
      windowEventMap,
      onWindowEventMap,
      microAppWindow,
      appName,
    } = this;

    const recordAttrs = microSnapshot.get('attrs')!;
    const recordWindowEvent = microSnapshot.get('windowEvent')!;
    const recordOnWindowEvent = microSnapshot.get('onWindowEvent')!;
    const recordDocumentEvent = microSnapshot.get('documentEvent')!;

    recordAttrs.forEach((value, key) => {
      injectKeySet.add(key);
      microAppWindow[key] = deepClone(value);
    });
    recordWindowEvent.forEach((arr, key) => {
      windowEventMap.set(key, deepClone(arr));
      for (const item of arr) {
        originalWindowAddEventListener.call(
          originalWindow,
          key as string,
          item.listener,
          item.options,
        );
      }
    });
    recordOnWindowEvent.forEach((func, key) => {
      onWindowEventMap.set(key as string, func);
      originalWindowAddEventListener.call(originalWindow, key as string, func);
    });

    const curMap = documentEventMap.get(appName)!;
    recordDocumentEvent.forEach((arr, key) => {
      curMap.set(key as string, deepClone(arr));

      for (const item of arr) {
        originalWindowAddEventListener.call(
          originalDocument,
          key as string,
          item.listener,
          item.options,
        );
      }
    });
  }
  // 劫持 window 属性
  hijackProperties() {
    const {
      microAppWindow,
      intervalSet,
      timeoutSet,
      idleSet,
      windowEventMap,
      onWindowEventMap,
    } = this;

    microAppWindow.setInterval = function (
      callback: Function,
      time?: number,
      ...args: any[]
    ): number {
      const timer = originalWindow.setInterval(callback, time, ...args);
      intervalSet.add(timer);
      return timer;
    };
    microAppWindow.clearInterval = function (time?: number) {
      if (!time) return;
      originalWindow.clearInterval(time);
      intervalSet.delete(time);
    };

    microAppWindow.setTimeout = function (
      callback: Function,
      time?: number,
      ...args: any[]
    ): number {
      const timer = originalWindow.setTimeout(callback, time, ...args);
      timeoutSet.add(timer);
      return timer;
    };
    microAppWindow.clearTimeout = function (time?: number) {
      if (!time) return;
      originalWindow.clearTimeout(time);
      intervalSet.delete(time);
    };

    microAppWindow.requestIdleCallback = function (
      callback: (options: any) => any,
      options?: { timeout: number },
    ) {
      const timer = originalWindow.requestIdleCallback(callback, options);
      idleSet.add(timer);
      return timer;
    };
    microAppWindow.cancelIdleCallback = function (time?: number) {
      if (!time) return;
      originalWindow.cancelIdleCallback(time);
      idleSet.delete(time);
    };

    microAppWindow.addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) {
      if (!windowEventMap.has(type)) {
        windowEventMap.set(type, []);
      }
      windowEventMap.get(type)?.push({ listener, options });
      return originalWindowAddEventListener.call(
        originalWindow,
        type,
        listener,
        options,
      );
    };
    microAppWindow.removeEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) {
      const list = windowEventMap.get(type) || [];
      for (let i = 0; i < list.length; i++) {
        if (list[i].listener === listener) {
          list.splice(i, 1);
          break;
        }
      }

      return originalWindowRemoveEventListener.call(
        originalWindow,
        type,
        listener,
        options,
      );
    };

    microAppWindow.eval = originalEval;
    microAppWindow.document = originalDocument;
    microAppWindow.originalWindow = originalWindow;
    microAppWindow.window = microAppWindow;

    // 劫持 window.onXXX 事件
    getWindowEventNames().forEach((eventName) => {
      originalDefineProperty(microAppWindow, `on${eventName}`, {
        configurable: true,
        enumerable: true,
        get() {
          return onWindowEventMap.get(eventName);
        },
        set(val) {
          onWindowEventMap.set(eventName, val);
          originalWindowAddEventListener.call(originalWindow, eventName, val);
        },
      });
    });
  }
  // 创建 window 代理对象
  createProxyWindow(appName: string) {
    return new Proxy(this.microAppWindow, {
      get(target, key) {
        changeCurrentAppName(appName);
        if (Reflect.has(target, key)) return Reflect.get(target, key);

        const result = originalWindow[key];

        // window 原生方法 this 执行必须绑定在 window 上, 不然会报错
        return isFunction(result) && needBindOriginalWindow(result)
          ? result.bind(originalWindow)
          : result;
      },
      set: (target, key, value) => {
        if (!this.active) return true;
        this.injectKeySet.add(key);
        return Reflect.set(target, key, value);
      },
      has: function (target, key) {
        changeCurrentAppName(appName);
        return key in target || key in originalWindow;
      },
      // Object.keys(window)
      // Object.getOwnPropertyNames(window)
      // Object.getOwnPropertySymbols(window)
      // Reflect.ownKeys(window)
      ownKeys: function (target) {
        changeCurrentAppName(appName);
        const result = Object.keys(target).concat(Object.keys(originalWindow));
        return Array.from(new Set(result));
      },
      deleteProperty: (target, property) => {
        this.injectKeySet.delete(property);
        return Reflect.deleteProperty(target, property);
      },
      // 用于拦截对象的 Object.defineProperty() 操作
      defineProperty: (target, property, descriptor) => {
        if (!this.active) return true;
        return Reflect.defineProperty(originalWindow, property, descriptor);
      },
      getOwnPropertyDescriptor: function (target, prop) {
        return Reflect.getOwnPropertyDescriptor(target, prop);
      },
      // 返回真正的 window 原型
      getPrototypeOf() {
        return Reflect.getPrototypeOf(originalWindow);
      },
    });
  }
}

// 构造函数, class, call, apply, bind 绑定了作用域的函数都不需要绑定到原始的 window 上
export function needBindOriginalWindow(fn: Function) {
  if (
    fn.toString().startsWith('class') ||
    isBoundFunction(fn) ||
    (/^[A-Z][\w_]+$/.test(fn.name) && fn.prototype?.constructor === fn)
  ) {
    return false;
  }
  return true;
}

export function isBoundFunction(fn: Function) {
  return fn?.name?.startsWith('bound ');
}
