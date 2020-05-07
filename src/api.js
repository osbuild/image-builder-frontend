import axios from 'axios';
import {
    OSBUILD_INSTALLER_API,
} from './constants';

const postHeaders = { headers: { 'Content-Type': 'application/json' }};

async function composeImage(body) {
    let path = '/compose';
    const request = await axios.post(OSBUILD_INSTALLER_API.concat(path), body, postHeaders);
    return request.data;
}

async function getComposeStatus(id) {
    let path = '/compose/' + id;
    const request = await axios.get(OSBUILD_INSTALLER_API.concat(path));
    return request.data;
}

export default {
    composeImage,
    getComposeStatus,
};
