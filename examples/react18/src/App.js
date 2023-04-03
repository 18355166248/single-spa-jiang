import { useEffect } from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: (
        <div>
          <h2>Hello World</h2>
          <Link to="about">About Us</Link>
        </div>
      ),
    },
    {
      path: '/about',
      element: (
        <div>
          <div>About</div>
          <Link to="/">回到首页</Link>
        </div>
      ),
    },
  ],
  {
    basename: getBaseName(),
  },
);

function getBaseName() {
  if (window.__IS_SINGLE_SPA_JIANG__) {
    if (window.location.pathname.indexOf('/react18') === 0) {
      return '/react18';
    }
    return '/multiple';
  }
  return '/';
}

function App() {
  useEffect(() => {
    console.log('micro react window.name =>', window.name);
  }, []);

  function globalEmit() {
    window.spaJiangGloabalState.emit('react18', '其他参数2', '其他参数2', {
      name: '其他参数3',
    });
  }
  return (
    <div id="App">
      <div className="App-header">
        <h1>React18 + react 16</h1>
        <div style={{ marginTop: 10 }}>
          <button onClick={globalEmit}>发送一个全局事件</button>
        </div>
        <RouterProvider router={router} />
      </div>
    </div>
  );
}

export default App;
