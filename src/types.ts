export interface AnyObj {
  [key: string]: any;
}

export enum AppStatus {
  BEFORE_BOOTSTRAP = 'BEFORE_BOOTSTRAP',
  BOOTSTRAPPED = 'BOOTSTRAPPED',
  BEFORE_MOUNT = 'BEFORE_MOUNT',
  MOUNTED = 'MOUNTED',
  BEFORE_UNMOUNT = 'BEFORE_UNMOUNT',
  UNMOUNTED = 'UNMOUNTED',
  BOOTSTRAP_ERROR = 'BOOTSTRAP_ERROR',
  MOUNT_ERROR = 'MOUNT_ERROR',
  UNMOUNT_ERROR = 'UNMOUNT_ERROR',
}

export interface ApplicationProp {
  name: string;
  entry: string;
  activeRule: Function | string;
  loadApp: () => Promise<any>;
  props: AnyObj | Function;
  status?: AppStatus;
  container?: HTMLElement;
  bootstrap?: (props: AnyObj) => Promise<any>;
  mount?: (props: AnyObj) => Promise<any>;
  unmount?: (props: AnyObj) => Promise<any>;
}
