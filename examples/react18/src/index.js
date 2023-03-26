import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

function render() {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

export async function mount(options) {
  window.spaGlobalState.onChange((state, operator, key) => {
    alert(
      `react 子应用监听到 spa 全局状态发生了变化: ${JSON.stringify(
        state,
      )}，操作: ${operator}，变化的属性: ${key}`,
    );
  });

  window.spaGlobalState.on('testEvent', () =>
    alert('react 子应用监听到父应用发送了一个全局事件: testEvent'),
  );

  console.log('[react16] options from main framework', options);
  render(options);
}

export async function unmount(options) {
  const { container } = options;
  ReactDOM.unmountComponentAtNode(
    container
      ? container.querySelector('#root')
      : document.querySelector('#root'),
  );
}

if (window.__IS_SINGLE_SPA__) {
  window.__SINGLE_SPA__ = {
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
