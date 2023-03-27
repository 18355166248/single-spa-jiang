export { default as registerApplication } from './application/registerApplication';
export { default as start } from './start';
import overwriteHashAndHistory from './navigation/overwriteHashAndHistory';

declare const window: any;

window.__IS_SINGLE_SPA_JIANG__ = true;

overwriteHashAndHistory();
