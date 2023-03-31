import Sandbox from './sandbox/Sandbox';

export interface AnyObj {
  [key: string]: any;
}

export type MicroWindow = Window & any;

export enum AppStatus {
  BEFORE_BOOTSTRAP = 'BEFORE_BOOTSTRAP',
  BEFORE_BOOTSTRAP_LOADING = 'BEFORE_BOOTSTRAP_LOADING', // BOOTSTRAP 执行中
  BOOTSTRAPPED = 'BOOTSTRAPPED',
  BEFORE_MOUNT = 'BEFORE_MOUNT',
  MOUNTED = 'MOUNTED',
  BEFORE_UNMOUNT = 'BEFORE_UNMOUNT',
  UNMOUNTED = 'UNMOUNTED',
  BOOTSTRAP_ERROR = 'BOOTSTRAP_ERROR',
  MOUNT_ERROR = 'MOUNT_ERROR',
  UNMOUNT_ERROR = 'UNMOUNT_ERROR',
}

// script css 资源熟悉
export interface SourceProps {
  // 是否是全局资源
  isGlobal: boolean;
  // 资源的 url
  url?: string;
  // 资源的内容
  value: string;
  // script 的类型
  type?: string | null;
}

export interface ApplicationProp {
  name: string; // 名称
  entry: string; // app 入口 一个 http 链接
  activeRule: Function | string; // app 匹配规则
  props: AnyObj | Function; // 父应用传递过来的自定义属性
  container: HTMLElement; // app 挂载的 Dom 节点
  pageBody: string; // app 入口的 html
  loadURLs: string[]; // app已经加载过的 url 用于去重
  status?: AppStatus; // app 当前的状态
  sandbox: Sandbox; // app js 运行的沙箱
  styles: (string | HTMLStyleElement)[]; // app 所有的非全局样式, app 加载时需要添加到页面中
  scripts: string[]; // app页面入口上非全局的方法, 只会执行一次
  isFirstLoad: boolean; // 是否是首次加载
  // 加载方法
  bootstrap?: (props: AnyObj) => Promise<any>; // 加载页面资源时触发方法 (需要子应用暴露)
  mount?: (props: AnyObj) => Promise<any>; // app 加载方法 (需要子应用暴露)
  unmount?: (props: AnyObj) => Promise<any>; // app 卸载方法 (需要子应用暴露)
  // 生命周期 start
  beforeBootstrap?: () => void; // 加载页面资源前触发 只触发一次
  bootstrapped?: () => void; // 加载页面资源触发 只触发一次
  beforeMount?: () => void; // 挂载前触发
  mounted?: () => void; // 挂载后触发
  beforeUnmount?: () => void; // 卸载前触发
  unmounted?: () => void; // 卸载后触发
  loader?: (code: string) => string; // 每次获取到 js 代码都会触发 loader 并返回作为新的代码
}
