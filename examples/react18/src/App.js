import { useEffect } from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: (
        <div>
          <h1>Hello World</h1>
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
    return '/react18';
  }
  return '/';
}

function App() {
  useEffect(() => {
    console.log('micro react window.name =>', window.name);
  }, []);
  return (
    <div>
      <div>React18 + react 16</div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
