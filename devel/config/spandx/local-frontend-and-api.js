/*global module*/
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const fs = require('fs');
const base64 = require('base-64');

const SECTION = 'insights';
const APP_ID = 'image-builder';
const FRONTEND_PORT = 8002;
const API_PORT = 8086;
const routes = {};

const PORTAL_BACKEND_MARKER = 'PORTAL_BACKEND_MARKER';

const keycloakPubkeys = {
    prod:  fs.readFileSync('/certs/keycloak.prod.cert',  'utf8'),
    stage: fs.readFileSync('/certs/keycloak.stage.cert', 'utf8'),
    qa:    fs.readFileSync('/certs/keycloak.qa.cert',    'utf8')
};

const buildUser = input => {

    const user = {
        entitlements: {
            insights: { is_entitled: true },
            smart_management: { is_entitled: true },
            openshift: { is_entitled: true },
            hybrid: { is_entitled: true },
            migrations: { is_entitled: true },
            ansible: { is_entitled: true }
        },
        identity: {
            account_number: input.account_number,
            type: 'User',
            user: {
                username: input.username,
                email: input.email,
                first_name: input.first_name,
                last_name: input.last_name,
                is_active: true,
                is_org_admin: input.is_org_admin,
                is_internal: input.is_internal,
                locale: input.locale
            },

            internal: {
                org_id: input.account_id
            }
        }
    };

    return user;
};

const envMap = {
    ci: {
        keycloakPubkey: keycloakPubkeys.qa,
        target: 'https://ci.cloud.redhat.com',
        str: 'ci'
    },
    qa: {
        keycloakPubkey: keycloakPubkeys.qa,
        target: 'https://qa.cloud.redhat.com',
        str: 'qa'
    },
    stage: {
        keycloakPubkey: keycloakPubkeys.stage,
        target: 'https://stage.cloud.redhat.com',
        str: 'stage'
    },
    prod: {
        keycloakPubkey: keycloakPubkeys.prod,
        target: 'https://cloud.redhat.com',
        str: 'prod'
    }
};

const authPlugin = (req, res, target) => {
    let env = envMap.prod;

    switch (req.headers['x-spandx-origin']) {
        case 'ci.foo.redhat.com':    env = envMap.ci;    break;
        case 'qa.foo.redhat.com':    env = envMap.qa;    break;
        case 'stage.foo.redhat.com': env = envMap.stage; break;
        case 'prod.foo.redhat.com':  env = envMap.prod;  break;
        default: env = false;
    }

    if (target === PORTAL_BACKEND_MARKER) {
        target = env.target;
        console.log(`    --> mangled ${PORTAL_BACKEND_MARKER} to ${target}`);
    }

    const noop = { then: (cb) => { cb(target); } };
    if (!req || !req.headers || !req.headers.cookie) { return noop; } // no cookies short circut

    const cookies = cookie.parse(req.headers.cookie);
    if (!cookies.cs_jwt) { return noop; } // no rh_jwt short circut

    var decoded = jwt.decode(cookies.cs_jwt);
    const user = buildUser(decoded);
    const unicodeUser = new Buffer(JSON.stringify(user), "utf8");
    req.headers["x-rh-identity"] = unicodeUser.toString("base64");
    return new Promise((resolve, reject) => resolve(target));
};



routes[`/beta/${SECTION}/${APP_ID}`] = { host: `http://frontend:${FRONTEND_PORT}` };
routes[`/${SECTION}/${APP_ID}`]      = { host: `http://frontend:${FRONTEND_PORT}` };
routes[`/beta/apps/${APP_ID}`]       = { host: `http://frontend:${FRONTEND_PORT}` };
routes[`/apps/${APP_ID}`]            = { host: `http://frontend:${FRONTEND_PORT}` };
routes[`/api/${APP_ID}`]             = { host: `http://backend:${API_PORT}` };
routes['/apps/chrome']               = { host: PORTAL_BACKEND_MARKER };
routes['/apps/beta/chrome']          = { host: PORTAL_BACKEND_MARKER };

module.exports = {
    bs: {
        notify: false,
        https: {
            key:  '/ssl/key.pem',
            cert: '/ssl/cert.pem'
        }
    },
    routerPlugin: authPlugin,
    routes: routes,
};
