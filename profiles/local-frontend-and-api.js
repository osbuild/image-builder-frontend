/*global module*/

const SECTION = 'apps';
const APP_ID = 'image-builder';
const FRONTEND_PORT = 8002;
const API_PORT = 8086;
const routes = {};

routes[`/beta/${SECTION}/${APP_ID}`] = { host: `http://localhost:${FRONTEND_PORT}` };
routes[`/${SECTION}/${APP_ID}`]      = { host: `http://localhost:${FRONTEND_PORT}` };
routes[`/beta/apps/${APP_ID}`]       = { host: `http://localhost:${FRONTEND_PORT}` };
routes[`/apps/${APP_ID}`]            = { host: `http://localhost:${FRONTEND_PORT}` };
routes[`/api/${APP_ID}`]             = { host: `http://localhost:${API_PORT}` };

module.exports = { routes };
