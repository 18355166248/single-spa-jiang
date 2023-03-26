import { isFunction } from 'lodash-es';
const test = 1;

function getTest() {
  console.log(22333);
}

isFunction(getTest) && getTest();
