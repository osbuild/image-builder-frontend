const CHROME_CONFIG_PORT = 8889;
const PROV_FRONT_PORT = 8003;
const PROV_APP_PATH = `${process.env.BETA ? '/beta' : ''}/apps/provisioning`;
const CONFIG_PATH = `${process.env.BETA ? '/beta' : ''}/config/chrome`;

module.exports = {
  routes: {
    [PROV_APP_PATH]: { host: `http://127.0.0.1:${PROV_FRONT_PORT}` },
    [CONFIG_PATH]: { host: `http://127.0.0.1:${CHROME_CONFIG_PORT}` },
  },
};
