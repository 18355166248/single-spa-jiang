const originalPushState = window.history.pushState;
const originalReplaceState = window.history.replaceState;

export default function overwriteHashAndHistory() {
  window.history.pushState = function (state, title, url) {
    const result = originalPushState.call(this, state, title, url);
    return result;
  };

  window.history.replaceState = function (state, title, url) {
    const result = originalReplaceState.call(this, state, title, url);
    return result;
  };

  window.addEventListener(
    'popstate',
    () => {
      console.log('popstate');
    },
    true,
  );
  window.addEventListener(
    'hashchange',
    () => {
      console.log('hashchange');
    },
    true,
  );
}
