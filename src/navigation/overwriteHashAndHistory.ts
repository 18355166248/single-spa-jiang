import { loadApps } from 'src/application/apps';
import {
  originalPushState,
  originalReplaceState,
  originalWindowAddEventListener,
} from 'src/utils/originalEnv';

export default function overwriteHashAndHistory() {
  window.history.pushState = function (state, title, url) {
    const result = originalPushState.call(this, state, title, url);
    loadApps();
    return result;
  };

  window.history.replaceState = function (state, title, url) {
    const result = originalReplaceState.call(this, state, title, url);
    loadApps();
    return result;
  };

  originalWindowAddEventListener(
    'popstate',
    () => {
      loadApps();
    },
    true,
  );
  originalWindowAddEventListener(
    'hashchange',
    () => {
      loadApps();
    },
    true,
  );
}
