import { startRouter } from './core/router.js';
import { prefetch } from './core/templates.js';
import { routes } from './routes.js';
import { initMenu } from './ui/menu.js';
import './ui/feedback.js';

initMenu();
startRouter(routes);
prefetch(Object.values(routes).map((r) => r.template));
