import { getObjType, isObject } from './index';

const mapTag = '[object Map]';
const arrayTag = '[object Array]';
const setTag = '[object Set]';
const objectTag = '[object Object]';
const symbolTag = '[object Symbol]';

const isNode = (node: any) => typeof node?.ELEMENT_NODE === 'number';

export function deepClone(target: any, map = new WeakMap()) {
  if (!target || !isObject(target) || isNode(target)) return target;

  const objType = getObjType(target);
  const objCopy = createObject(target, objType);

  // 防止循环引用
  if (map.has(target)) return map.get(target);

  if (objType === setTag) {
    for (const val of target) {
      objCopy.add(deepClone(val, map));
    }
    return objCopy;
  }
  if (objType === mapTag) {
    for (const [key, val] of target) {
      objCopy.set(key, deepClone(val, map));
    }
    return objCopy;
  }
  if (objType === objectTag || objType === arrayTag) {
    for (const key in target) {
      objCopy[key] = deepClone(target[key], map);
    }
    return objCopy;
  }

  return objCopy;
}

function createObject(obj: any, type: string) {
  if (type === objectTag) return {};
  if (type === arrayTag) return [];
  if (type === symbolTag) return Object(Symbol.prototype.valueOf.call(obj));

  return new obj.constructor(obj);
}
