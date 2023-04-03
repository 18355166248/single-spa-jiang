import { loadApps } from './application/apps';
import { singleSpaJiang, spaJiangGloabalState } from './config';
import { GlobalState } from './globalState/GlobalState';
import { isInBrowser } from './utils/index';
import { originalWindow } from './utils/originalEnv';

let isStarted = false;

export default function start() {
  if (!isInBrowser()) {
    throw Error(`${singleSpaJiang} must br running in browser!`);
  }
  if (!isStarted) {
    // 初始化全局状态管理 通信
    originalWindow[spaJiangGloabalState] = new GlobalState();
    isStarted = true;

    try {
      loadApps();
    } catch (error) {
      throw error;
    }
  }
}

export function isStart() {
  return isStarted;
}
