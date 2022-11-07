import axios from 'axios';
import { CONTENT_SOURCES, IMAGE_BUILDER_API, RHSM_API } from './constants';
import { repos } from './repos';

const postHeaders = { headers: { 'Content-Type': 'application/json' } };

async function composeImage(body) {
  let path = '/compose';
  const request = await axios.post(
    IMAGE_BUILDER_API.concat(path),
    body,
    postHeaders
  );
  return request.data;
}

async function getComposes(limit, offset) {
  const params = new URLSearchParams({
    limit,
    offset,
  });
  let path = '/composes?' + params.toString();
  const request = await axios.get(IMAGE_BUILDER_API.concat(path));
  return request.data;
}

async function getComposeStatus(id) {
  let path = '/composes/' + id;
  const request = await axios.get(IMAGE_BUILDER_API.concat(path));
  return request.data;
}

async function getPackages(distribution, architecture, search, limit) {
  const params = new URLSearchParams({
    distribution,
    architecture,
    search,
  });
  limit && params.append('limit', limit);
  let path = '/packages?' + params.toString();
  const request = await axios.get(IMAGE_BUILDER_API.concat(path));
  return request.data;
}

async function getPackagesContentSources(distribution, search) {
  // content-sources expects an array of urls but we store the whole repo object
  // so map the urls into an array to send to the content-sources api
  const repoUrls = repos[distribution].map((repo) => repo.url);
  const body = {
    urls: repoUrls,
    search,
  };
  const path = '/rpms/names';
  const request = await axios.post(
    CONTENT_SOURCES.concat(path),
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
  let path = '/version';
  const request = await axios.get(IMAGE_BUILDER_API.concat(path));
  return request.data;
}

async function getActivationKeys() {
  const path = '/activation_keys';
  const request = await axios.get(RHSM_API.concat(path));
  return request.data.body;
}

async function getActivationKey(name) {
  const path = `/activation_keys/${name}`;
  const request = await axios.get(RHSM_API.concat(path));
  return request.data.body;
}

// get clones of a compose
async function getClones(id, limit, offset) {
  const params = new URLSearchParams({
    limit,
    offset,
  });
  const path = `/composes/${id}/clones?${params}`;
  const request = await axios.get(IMAGE_BUILDER_API.concat(path));
  return request.data;
}

async function getCloneStatus(id) {
  const path = `/clones/${id}`;
  const request = await axios.get(IMAGE_BUILDER_API.concat(path));
  return request.data;
}

async function cloneImage(composeId, body) {
  const path = `/composes/${composeId}/clone`;
  const request = await axios.post(
    IMAGE_BUILDER_API.concat(path),
    body,
    postHeaders
  );
  return request.data;
}

export default {
  cloneImage,
  composeImage,
  getClones,
  getCloneStatus,
  getComposes,
  getComposeStatus,
  getPackages,
  getPackagesContentSources,
  getVersion,
  getActivationKeys,
  getActivationKey,
};
