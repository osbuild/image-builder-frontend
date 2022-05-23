import axios from 'axios';
import { IMAGE_BUILDER_API, RHSM_API } from './constants';

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

export default {
  composeImage,
  getComposes,
  getComposeStatus,
  getPackages,
  getVersion,
  getActivationKeys,
};
