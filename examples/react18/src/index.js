import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

window.name = 'react';

let root;

function render(options = {}) {
  const { container } = options;
  root = ReactDOM.createRoot(
    container
      ? container.querySelector('#root')
      : document.querySelector('#root'),
  );
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

export async function bootstrap() {
  console.log('react18 bootstrap');
}

export async function mount(options) {
  if (window.spaJiangGloabalState) {
    window.spaJiangGloabalState.onChange((state, operator, key) => {
      alert(
        `react 子应用监听到 spa 全局状态发生了变化: ${JSON.stringify(
          state,
        )}，操作: ${operator}，变化的属性: ${key}`,
      );
    });

    window.spaJiangGloabalState.on('testEvent', () =>
      alert('react 子应用监听到父应用发送了一个全局事件: testEvent'),
    );
  }

  console.log('[react18] options from main framework', options);
  render(options);
}

export async function unmount(options) {
  root.unmount();
}

if (window.__IS_SINGLE_SPA_JIANG__) {
  window.__SINGLE_SPA__JIANG__ = {
    bootstrap,
    mount,
    unmount,
  };
} else {
  render();
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
