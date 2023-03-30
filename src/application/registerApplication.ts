import { ApplicationProp, AppStatus } from 'src/types';
import { appMaps } from 'src/utils/application';

export default function registerApplication(app: ApplicationProp) {
  if (typeof app.activeRule === 'string') {
    const path = app.activeRule;
    app.activeRule = (location = window.location) => location.pathname === path;
  }

  app = {
    ...app,
    pageBody: '',
    loadURLs: [],
    status: AppStatus.BEFORE_BOOTSTRAP,
    styles: [],
    scripts: [],
    isFirstLoad: true,
  };

  appMaps.set(app.name, app);
}
