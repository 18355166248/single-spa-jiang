import { ApplicationProp, AppStatus } from 'src/types';
import { apps } from './apps';

export default function registerApplication(app: ApplicationProp) {
  if (typeof app.activeRule === 'string') {
    const path = app.activeRule;
    app.activeRule = (location = window.location) => location.pathname === path;
  }

  app.pageBody = '';
  app.loadURLs = [];
  app.status = AppStatus.BEFORE_BOOTSTRAP;
  apps.push(app);
}
