/*global module*/

const API_PORT = 8086;

const routes = {
  "/api/image-builder": { 
    host: `http://backend:${API_PORT}` ,
  }
};

module.exports = { routes };
