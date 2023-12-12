import axios from 'axios';

import { CONTENT_SOURCES_API, IMAGE_BUILDER_API } from './constants';

const postHeaders = { headers: { 'Content-Type': 'application/json' } };

async function getPackages(distribution, architecture, search, limit) {
  const params = new URLSearchParams({
    distribution,
    architecture,
    search,
  });
  limit && params.append('limit', limit);
  const path = '/packages?' + params.toString();
  const request = await axios.get(IMAGE_BUILDER_API.concat(path));
  return request.data;
}

async function getPackagesContentSources(repoUrls, search) {
  // content-sources expects an array of urls but we store the whole repo object
  // so map the urls into an array to send to the content-sources api
  const body = {
    urls: repoUrls,
    search,
  };
  const path = '/rpms/names';
  const request = await axios.post(
    CONTENT_SOURCES_API.concat(path),
    body,
    postHeaders
  );
  // map `package_name` key to just `name` since that's what we use across the UI
  const packages = request.data.map(({ package_name: name, ...rest }) => ({
    name,
    ...rest,
  }));
  return packages;
}

async function getVersion() {
  const path = '/version';
  const request = await axios.get(IMAGE_BUILDER_API.concat(path));
  return request.data;
}

const apiCalls = {
  getPackages,
  getPackagesContentSources,
  getVersion,
};

export default apiCalls;
