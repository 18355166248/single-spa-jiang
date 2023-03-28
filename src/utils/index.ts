import { AnyObj } from 'src/types';

export function isPromise(fn: any) {
  if (
    (typeof fn === 'object' || typeof fn === 'function') &&
    typeof fn.then === 'function'
  ) {
    return true;
  }
}

export function $(selector: string) {
  return document.querySelector(selector);
}

export function validateFunction(name: string, fn: any) {
  if (typeof fn !== 'function') {
    throw new Error(`The ${name} is not be a function`);
  }
}

export function getProps(props: Function | AnyObj) {
  if (typeof props === 'function') return props();
  if (typeof props === 'object') return props;
  return {};
}

const urlReg = /^http(s)?:\/\//;
export function isURl(url: string) {
  return urlReg.test(url);
}
