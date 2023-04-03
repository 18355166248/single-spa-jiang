import Vue from 'vue';
import App from './App';
import { registerApplication, start } from '@single-spa-jiang/esm';
import { $, pathPrefix } from './utils';

function render() {
  new Vue({
    el: '#app',
    render(h) {
      return h(App);
    },
  });
}

render();

registerApplication({
  name: 'vue2',
  entry: 'http://localhost:8001',
  activeRule: pathPrefix('/vue2'),
  container: $('#micro-app'),
  /**
   * app 生命周期钩子，加载页面资源前触发，只会触发一次
   */
  beforeBootstrap: () => console.log('vue beforeBootstrap'),
  /**
   * app 生命周期钩子，页面入口的资源被加载并执行后触发，只会触发一次
   */
  bootstrapped: () => console.log('vue bootstrapped'),
  /**
   * app 生命周期钩子，挂载前触发
   */
  beforeMount: () => console.log('vue beforeMount'),
  /**
   * app 生命周期钩子，挂载后触发
   */
  mounted: () => console.log('vue mounted'),
  /**
   * app 生命周期钩子，卸载前触发
   */
  beforeUmount: () => console.log('vue beforeUmount'),
  /**
   * app 生命周期钩子，卸载后触发
   */
  unmounted: () => console.log('vue unmounted'),
  /**
   * js 代码的 loader，每次获取到 js 代码后会传给 loader() 并将返回值作为新的代码
   */
  loader: (code) => {
    console.log('vue loader');
    return code;
  },
  sandboxConfig: {
    css: true,
  },
});

registerApplication({
  name: 'react18',
  entry: 'http://localhost:8002',
  activeRule: (location) =>
    location.pathname.indexOf('/react18') === 0 ||
    location.pathname.indexOf('/multiple') === 0,
  container: $('#micro-app'),
  sandboxConfig: {
    css: true,
  },
});

registerApplication({
  name: 'multiple',
  entry: 'http://localhost:8003',
  activeRule: (location) => location.pathname.indexOf('/multiple') === 0,
  container: $('#multiple-app'),
  sandboxConfig: {
    css: true,
  },
});

start();
window.name = 'parent';
console.log(window.name);

window.spaJiangGloabalState.on('vue2', () =>
  alert('父应用监听到 vue 子应用发送了一个全局事件: vue2'),
);

window.spaJiangGloabalState.on('react18', (...args) => {
  alert('父应用监听到 React 子应用发送了一个全局事件: react18');
  console.log('其它参数', args);
});
