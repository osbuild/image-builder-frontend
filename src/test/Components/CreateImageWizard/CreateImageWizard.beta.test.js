import '@testing-library/jest-dom';

import React from 'react';

import {
  act,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import api from '../../../api.js';
import CreateImageWizard from '../../../Components/CreateImageWizard/CreateImageWizard';
import { RHEL_8 } from '../../../constants.js';
import { renderWithReduxRouter } from '../../testUtils';

let history = undefined;
let store = undefined;

function getBackButton() {
  const back = screen.getByRole('button', { name: /Back/ });
  return back;
}

function getNextButton() {
  const next = screen.getByRole('button', { name: /Next/ });
  return next;
}

// packages
const mockPkgResultContentSources = [
  {
    name: 'testPkg',
    summary: 'test package summary',
    version: '1.0',
  },
  {
    name: 'lib-test',
    summary: 'lib-test package summary',
    version: '1.0',
  },
  {
    name: 'test',
    summary: 'summary for test package',
    version: '1.0',
  },
];

const mockPkgResultAlphaContentSources = [
  {
    name: 'lib-test',
    summary: 'lib-test package summary',
    version: '1.0',
  },
  {
    name: 'Z-test',
    summary: 'Z-test package summary',
    version: '1.0',
  },
  {
    name: 'test',
    summary: 'summary for test package',
    version: '1.0',
  },
];

const mockPkgResultEmptyContentSources = [];

const mockRepositoryResults = {
  data: [
    {
      uuid: 'dbad4dfc-1547-45f8-b5af-1d7fec0476c6',
      name: '13lk3',
      url: 'http://yum.theforeman.org/releases/3.4/el8/x86_64/',
      distribution_versions: ['7'],
      distribution_arch: 'any',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 08:54:00.962352 +0000 UTC',
      last_success_introspection_time: '2022-11-23 08:54:00.962352 +0000 UTC',
      last_update_introspection_time: '2022-10-04 00:18:12.123607 +0000 UTC',
      last_introspection_error: '',
      package_count: 605,
      status: 'Valid',
      gpg_key:
        '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
      metadata_verification: false,
    },
    {
      uuid: '9cf1d45d-aa06-46fe-87ea-121845cc6bbb',
      name: '2lmdtj',
      url: 'http://mirror.stream.centos.org/SIGs/9/kmods/x86_64/packages-main/',
      distribution_versions: ['any'],
      distribution_arch: 'any',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 00:00:12.714873 +0000 UTC',
      last_success_introspection_time: '2022-11-23 00:00:12.714873 +0000 UTC',
      last_update_introspection_time: '2022-11-18 08:00:10.119093 +0000 UTC',
      last_introspection_error: '',
      package_count: 21,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    },
    {
      uuid: '828e7db8-c0d4-48fc-a887-9070e0e75c45',
      name: '2zmya',
      url: 'https://download-i2.fedoraproject.org/pub/epel/9/Everything/x86_64/',
      distribution_versions: ['7'],
      distribution_arch: 'x86_64',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 08:00:18.111405 +0000 UTC',
      last_success_introspection_time: '2022-11-23 08:00:18.111405 +0000 UTC',
      last_update_introspection_time: '2022-11-23 08:00:18.111405 +0000 UTC',
      last_introspection_error: '',
      package_count: 11526,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    },
    {
      uuid: 'ffe90892-6e6c-43c0-a284-df78977d8e37',
      name: '4tnt6f',
      url: 'https://mirror.linux.duke.edu/pub/centos/8-stream/BaseOS/x86_64/os/',
      distribution_versions: ['any'],
      distribution_arch: 'x86_64',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-22 16:00:06.455684 +0000 UTC',
      last_success_introspection_time: '2022-11-22 16:00:06.455684 +0000 UTC',
      last_update_introspection_time: '2022-10-04 00:06:03.021973 +0000 UTC',
      last_introspection_error: '',
      package_count: 11908,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    },
    {
      uuid: '744000a5-fde5-481d-a1ae-07f27e7f4db9',
      name: '76nlti',
      url: 'https://download-i2.fedoraproject.org/pub/epel/7/x86_64/',
      distribution_versions: ['7'],
      distribution_arch: 'any',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 08:01:28.74002 +0000 UTC',
      last_success_introspection_time: '2022-11-23 08:01:28.74002 +0000 UTC',
      last_update_introspection_time: '2022-11-23 08:01:28.74002 +0000 UTC',
      last_introspection_error: '',
      package_count: 13739,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    },
    {
      uuid: '45068247-67b9-4f6d-8f19-1718ab56586e',
      name: '938l0k',
      url: 'http://yum.theforeman.org/client/3.4/el8/x86_64/',
      distribution_versions: ['7'],
      distribution_arch: 'x86_64',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 08:00:20.911292 +0000 UTC',
      last_success_introspection_time: '2022-11-23 08:00:20.911292 +0000 UTC',
      last_update_introspection_time: '2022-10-04 00:18:10.148583 +0000 UTC',
      last_introspection_error: '',
      package_count: 17,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    },
    {
      uuid: '60887c35-ce7a-4abc-8c57-1cb8a596f63d',
      name: 'a6vac',
      url: 'http://mirror.stream.centos.org/9-stream/AppStream/x86_64/os/',
      distribution_versions: ['7'],
      distribution_arch: 'any',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 08:00:21.719974 +0000 UTC',
      last_success_introspection_time: '2022-11-23 08:00:21.719974 +0000 UTC',
      last_update_introspection_time: '2022-09-20 00:21:01.891526 +0000 UTC',
      last_introspection_error: '',
      package_count: 0,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    },
    {
      uuid: 'f033a5af-ae00-4c26-8bb9-7329d4f17180',
      name: 'abi7n',
      url: 'http://yum.theforeman.org/katello/4.6/katello/el8/x86_64/',
      distribution_versions: ['7'],
      distribution_arch: 'any',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 08:01:31.52995 +0000 UTC',
      last_success_introspection_time: '2022-11-23 08:01:31.52995 +0000 UTC',
      last_update_introspection_time: '2022-10-04 00:11:04.043452 +0000 UTC',
      last_introspection_error: '',
      package_count: 102,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    },
    {
      uuid: 'be0fd64b-b7d0-48f1-b671-4c74b93a42d2',
      name: 'g2ikq',
      url: 'http://yum.theforeman.org/client/3.4/el9/x86_64/',
      distribution_versions: ['any'],
      distribution_arch: 'any',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 08:00:21.465594 +0000 UTC',
      last_success_introspection_time: '2022-11-23 08:00:21.465594 +0000 UTC',
      last_update_introspection_time: '2022-10-04 00:18:10.830524 +0000 UTC',
      last_introspection_error: '',
      package_count: 11,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    },
    {
      uuid: 'bf5270e6-0559-469b-a4bd-9c881f603813',
      name: 'gnome-shell-extensions',
      url: 'https://gitlab.gnome.org/GNOME/gnome-shell-extensions/',
      distribution_versions: ['any'],
      distribution_arch: 'x86_64',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 08:01:33.91888 +0000 UTC',
      last_success_introspection_time: '',
      last_update_introspection_time: '',
      last_introspection_error:
        'error parsing repomd.xml: xml.Unmarshal failure: expected element type <repomd> but have <html>',
      package_count: 0,
      status: 'Invalid',
      gpg_key: '',
      metadata_verification: false,
    },
    {
      uuid: '31ae1b1c-0a14-46df-a6d4-4170f88abeee',
      name: 'i9arb',
      url: 'http://yum.theforeman.org/pulpcore/3.18/el8/x86_64/',
      distribution_versions: ['7'],
      distribution_arch: 'any',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 00:00:12.263236 +0000 UTC',
      last_success_introspection_time: '2022-11-23 00:00:12.263236 +0000 UTC',
      last_update_introspection_time: '2022-11-12 00:00:18.375292 +0000 UTC',
      last_introspection_error: '',
      package_count: 340,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    },
    {
      uuid: 'ea375230-32f7-490d-82b6-501f0a8c2932',
      name: 'ixgwo',
      url: 'http://yum.theforeman.org/client/3.3/el7/x86_64/',
      distribution_versions: ['7'],
      distribution_arch: 'any',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 08:00:37.091305 +0000 UTC',
      last_success_introspection_time: '2022-11-23 08:00:37.091305 +0000 UTC',
      last_update_introspection_time: '2022-10-10 16:11:35.690955 +0000 UTC',
      last_introspection_error: '',
      package_count: 14,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    },
    {
      uuid: 'aa9506b1-e5dd-42be-b5b0-a674f4db915f',
      name: 'k64ic',
      url: 'http://yum.theforeman.org/pulpcore/3.18/el9/x86_64/',
      distribution_versions: ['any'],
      distribution_arch: 'x86_64',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 08:00:18.671713 +0000 UTC',
      last_success_introspection_time: '2022-11-23 08:00:18.671713 +0000 UTC',
      last_update_introspection_time: '2022-11-12 00:00:08.970966 +0000 UTC',
      last_introspection_error: '',
      package_count: 338,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    },
    {
      uuid: '3cce24d2-41e2-481d-8f01-2b043c72fd6f',
      name: 'lrqm',
      url: 'http://yum.theforeman.org/client/3.3/el8/x86_64/',
      distribution_versions: ['any'],
      distribution_arch: 'any',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 08:00:11.11247 +0000 UTC',
      last_success_introspection_time: '2022-11-23 08:00:11.11247 +0000 UTC',
      last_update_introspection_time: '2022-10-10 16:01:36.465549 +0000 UTC',
      last_introspection_error: '',
      package_count: 16,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    },
    {
      uuid: 'c988934a-87e2-482f-b887-d9ba677a037a',
      name: 'mo1qy',
      url: 'https://download-i2.fedoraproject.org/pub/epel/8/Everything/x86_64/',
      distribution_versions: ['any'],
      distribution_arch: 'any',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 08:00:09.394253 +0000 UTC',
      last_success_introspection_time: '2022-11-23 08:00:09.394253 +0000 UTC',
      last_update_introspection_time: '2022-11-23 08:00:09.394253 +0000 UTC',
      last_introspection_error: '',
      package_count: 9452,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    },
    {
      uuid: 'bbc2bba5-9d7d-4726-b96f-a48408e130b5',
      name: 's2h9z',
      url: 'http://mirror.stream.centos.org/9-stream/BaseOS/x86_64/os/',
      distribution_versions: ['7'],
      distribution_arch: 'x86_64',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-22 16:00:06.224391 +0000 UTC',
      last_success_introspection_time: '2022-11-22 16:00:06.224391 +0000 UTC',
      last_update_introspection_time: '2022-09-20 00:27:02.197045 +0000 UTC',
      last_introspection_error: '',
      package_count: 0,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    },
    {
      uuid: '593a973b-715f-4867-ae9c-fa791b59b92d',
      name: 'v9h0m',
      url: 'http://yum.theforeman.org/pulpcore/3.18/el7/x86_64/',
      distribution_versions: ['any'],
      distribution_arch: 'any',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 08:00:19.586273 +0000 UTC',
      last_success_introspection_time: '2022-11-23 08:00:19.586273 +0000 UTC',
      last_update_introspection_time: '2022-11-13 00:00:25.156398 +0000 UTC',
      last_introspection_error: '',
      package_count: 259,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    },
    {
      uuid: 'd08a74ef-589b-486f-aae0-60c6abe25768',
      name: 'vbazm',
      url: 'http://yum.theforeman.org/client/3.4/el7/x86_64/',
      distribution_versions: ['any'],
      distribution_arch: 'any',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 08:00:37.944592 +0000 UTC',
      last_success_introspection_time: '2022-11-23 08:00:37.944592 +0000 UTC',
      last_update_introspection_time: '2022-10-04 00:18:09.561151 +0000 UTC',
      last_introspection_error: '',
      package_count: 15,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    },
    {
      uuid: '0a12a77d-c3fa-4cd7-958b-ecbec1fd1494',
      name: 'vv5jk',
      url: 'http://yum.theforeman.org/client/3.2/el7/x86_64/',
      distribution_versions: ['any'],
      distribution_arch: 'any',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 00:00:20.495629 +0000 UTC',
      last_success_introspection_time: '2022-11-23 00:00:20.495629 +0000 UTC',
      last_update_introspection_time: '2022-10-04 00:20:17.587417 +0000 UTC',
      last_introspection_error: '',
      package_count: 14,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    },
    {
      uuid: '5288c386-274c-4598-8f09-0e2f65346e0d',
      name: 'ycxvp',
      url: 'https://dl.google.com/linux/chrome/rpm/stable/x86_64/',
      distribution_versions: ['any'],
      distribution_arch: 'x86_64',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 08:00:09.595446 +0000 UTC',
      last_success_introspection_time: '2022-11-23 08:00:09.595446 +0000 UTC',
      last_update_introspection_time: '2022-11-18 08:00:13.259506 +0000 UTC',
      last_introspection_error: '',
      package_count: 3,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    },
    {
      uuid: 'f087f9ad-dfe6-4627-9d53-336c09886cd4',
      name: 'yzfsx',
      url: 'http://yum.theforeman.org/client/3.3/el9/x86_64/',
      distribution_versions: ['7'],
      distribution_arch: 'x86_64',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 08:00:22.137451 +0000 UTC',
      last_success_introspection_time: '2022-11-23 08:00:22.137451 +0000 UTC',
      last_update_introspection_time: '2022-10-10 16:00:18.041568 +0000 UTC',
      last_introspection_error: '',
      package_count: 11,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    },
  ],
  meta: {
    limit: 100,
    offset: 0,
    count: 21,
  },
  links: {
    first: '/api/content-sources/v1/repositories/?limit=100&offset=0',
    last: '/api/content-sources/v1/repositories/?limit=100&offset=0',
  },
};

const mockRepositoryResponsePartial = {
  data: new Array(100).fill().map((_, i) => {
    return {
      uuid: '9cf1d45d-aa06-46fe-87ea-121845cc6bbb',
      name: '2lmdtj',
      url:
        'http://mirror.stream.centos.org/SIGs/9/kmods/x86_64/packages-main/' +
        i,
      distribution_versions: ['any'],
      distribution_arch: 'any',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 00:00:12.714873 +0000 UTC',
      last_success_introspection_time: '2022-11-23 00:00:12.714873 +0000 UTC',
      last_update_introspection_time: '2022-11-18 08:00:10.119093 +0000 UTC',
      last_introspection_error: '',
      package_count: 21,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    };
  }),
  meta: {
    limit: 100,
    offset: 0,
    count: 132,
  },
  links: {
    first: '/api/content-sources/v1/repositories/?limit=100&offset=0',
    last: '/api/content-sources/v1/repositories/?limit=100&offset=0',
  },
};

const mockRepositoryResponseAll = {
  data: new Array(132).fill().map((_, i) => {
    return {
      uuid: '9cf1d45d-aa06-46fe-87ea-121845cc6bbb',
      name: '2lmdtj',
      url:
        'http://mirror.stream.centos.org/SIGs/9/kmods/x86_64/packages-main/' +
        i,
      distribution_versions: ['any'],
      distribution_arch: 'any',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 00:00:12.714873 +0000 UTC',
      last_success_introspection_time: '2022-11-23 00:00:12.714873 +0000 UTC',
      last_update_introspection_time: '2022-11-18 08:00:10.119093 +0000 UTC',
      last_introspection_error: '',
      package_count: 21,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    };
  }),
  meta: {
    limit: 132,
    offset: 0,
    count: 132,
  },
  links: {
    first: '/api/content-sources/v1/repositories/?limit=132&offset=0',
    last: '/api/content-sources/v1/repositories/?limit=132&offset=0',
  },
};

const searchForAvailablePackages = async (searchbox, searchTerm) => {
  userEvent.type(searchbox, searchTerm);
  await act(async () => {
    screen
      .getByRole('button', { name: /search button for available packages/i })
      .click();
  });
};

const searchForChosenPackages = async (searchbox, searchTerm) => {
  if (!searchTerm) {
    userEvent.clear(searchbox);
  } else {
    userEvent.type(searchbox, searchTerm);
  }
};

// mock the insights dependency
beforeAll(() => {
  // scrollTo is not defined in jsdom
  window.HTMLElement.prototype.scrollTo = function () {};

  // mock the activation key api call
  const mockActivationKeys = [{ name: 'name0' }, { name: 'name1' }];
  jest
    .spyOn(api, 'getActivationKeys')
    .mockImplementation(() => Promise.resolve(mockActivationKeys));

  const mockActivationKey = { body: [{ name: 'name0' }, { name: 'name1' }] };
  jest.spyOn(api, 'getActivationKey').mockImplementation((name) => {
    return Promise.resolve(mockActivationKey[name]);
  });

  global.insights = {
    chrome: {
      auth: {
        getUser: () => {
          return {
            identity: {
              internal: {
                org_id: 5,
              },
            },
          };
        },
      },
      isBeta: () => {
        return true;
      },
      isProd: () => {
        return true;
      },
    },
  };
});

afterEach(() => {
  jest.clearAllMocks();
  history = undefined;
});

// restore global mock
afterAll(() => {
  global.insights = undefined;
});

describe('Create Image Wizard', () => {
  test('renders component', () => {
    renderWithReduxRouter(<CreateImageWizard />);
    // check heading
    screen.getByRole('heading', { name: /Create image/ });

    screen.getByRole('button', { name: 'Image output' });
    screen.getByRole('button', { name: 'Registration' });
    screen.getByRole('button', { name: 'File system configuration' });
    screen.getByRole('button', { name: 'Content' });
    screen.getByRole('button', { name: 'Additional Red Hat packages' });
    screen.getByRole('button', { name: 'Custom repositories' });
    screen.getByRole('button', { name: 'Name image' });
    screen.getByRole('button', { name: 'Review' });
  });
});

describe('Step Packages', () => {
  const setUp = async () => {
    history = renderWithReduxRouter(<CreateImageWizard />).history;

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-aws');
    awsTile.click();
    getNextButton().click();

    // aws step
    userEvent.type(screen.getByTestId('aws-account-id'), '012345678901');
    getNextButton().click();
    // skip registration
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    const registerLaterRadio = screen.getByLabelText('Register later');
    userEvent.click(registerLaterRadio);
    getNextButton().click();

    // skip fsc
    getNextButton().click();
  };

  test('search results should be sorted with most relevant results first', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

    searchbox.click();

    const getPackages = jest
      .spyOn(api, 'getPackagesContentSources')
      .mockImplementation(() => Promise.resolve(mockPkgResultContentSources));

    await searchForAvailablePackages(searchbox, 'test');
    expect(getPackages).toHaveBeenCalledTimes(1);

    const availablePackagesList = screen.getByTestId('available-pkgs-list');
    const availablePackagesItems = within(availablePackagesList).getAllByRole(
      'option'
    );
    expect(availablePackagesItems).toHaveLength(3);
    const [firstItem, secondItem, thirdItem] = availablePackagesItems;
    expect(firstItem).toHaveTextContent('testsummary for test package');
    expect(secondItem).toHaveTextContent('testPkgtest package summary');
    expect(thirdItem).toHaveTextContent('lib-testlib-test package summary');
  });

  test('search results should be sorted after selecting them and then deselecting them', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

    searchbox.click();

    const getPackages = jest
      .spyOn(api, 'getPackagesContentSources')
      .mockImplementation(() => Promise.resolve(mockPkgResultContentSources));

    await searchForAvailablePackages(searchbox, 'test');
    expect(getPackages).toHaveBeenCalledTimes(1);

    screen.getByTestId('available-pkgs-testPkg').click();
    screen.getByRole('button', { name: /Add selected/ }).click();

    screen.getByTestId('selected-pkgs-testPkg').click();
    screen.getByRole('button', { name: /Remove selected/ }).click();

    const availablePackagesList = screen.getByTestId('available-pkgs-list');
    const availablePackagesItems = within(availablePackagesList).getAllByRole(
      'option'
    );
    expect(availablePackagesItems).toHaveLength(3);
    const [firstItem, secondItem, thirdItem] = availablePackagesItems;
    expect(firstItem).toHaveTextContent('testsummary for test package');
    expect(secondItem).toHaveTextContent('testPkgtest package summary');
    expect(thirdItem).toHaveTextContent('lib-testlib-test package summary');
  });

  test('search results should be sorted after adding and then removing all packages', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

    searchbox.click();

    const getPackages = jest
      .spyOn(api, 'getPackagesContentSources')
      .mockImplementation(() => Promise.resolve(mockPkgResultContentSources));

    await searchForAvailablePackages(searchbox, 'test');
    expect(getPackages).toHaveBeenCalledTimes(1);

    screen.getByRole('button', { name: /Add all/ }).click();
    screen.getByRole('button', { name: /Remove all/ }).click();

    const availablePackagesList = screen.getByTestId('available-pkgs-list');
    const availablePackagesItems = within(availablePackagesList).getAllByRole(
      'option'
    );
    expect(availablePackagesItems).toHaveLength(3);
    const [firstItem, secondItem, thirdItem] = availablePackagesItems;
    expect(firstItem).toHaveTextContent('testsummary for test package');
    expect(secondItem).toHaveTextContent('testPkgtest package summary');
    expect(thirdItem).toHaveTextContent('lib-testlib-test package summary');
  });

  test('removing a single package updates the state correctly', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref
    searchbox.click();
    const getPackages = jest
      .spyOn(api, 'getPackagesContentSources')
      .mockImplementation(() => Promise.resolve(mockPkgResultContentSources));

    await searchForAvailablePackages(searchbox, 'test');
    expect(getPackages).toHaveBeenCalledTimes(1);
    screen.getByRole('button', { name: /Add all/ }).click();

    // remove a single package
    screen.getByTestId('selected-pkgs-lib-test').click();
    screen.getByRole('button', { name: /Remove selected/ }).click();
    // skip Custom repositories page
    screen.getByRole('button', { name: /Next/ }).click();

    // skip name page
    screen.getByRole('button', { name: /Next/ }).click();

    // review page
    screen.getByRole('button', { name: /Next/ }).click();

    // await screen.findByTestId('chosen-packages-count');
    const chosen = await screen.findByTestId('chosen-packages-count');
    expect(chosen).toHaveTextContent('2');
  });

  test('should display empty available state on failed search', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

    searchbox.click();

    const getPackages = jest
      .spyOn(api, 'getPackagesContentSources')
      .mockImplementation(() =>
        Promise.resolve(mockPkgResultEmptyContentSources)
      );

    await searchForAvailablePackages(searchbox, 'asdf');
    expect(getPackages).toHaveBeenCalledTimes(1);

    await screen.findByText('No packages found');
  });

  test('should display empty chosen state on failed search', async () => {
    await setUp();

    const searchboxAvailable = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref
    const searchboxChosen = screen.getAllByRole('textbox')[1];

    const getPackages = jest
      .spyOn(api, 'getPackagesContentSources')
      .mockImplementation(() => Promise.resolve(mockPkgResultContentSources));

    searchboxAvailable.click();
    await searchForAvailablePackages(searchboxAvailable, 'test');
    expect(getPackages).toHaveBeenCalledTimes(1);

    screen.getByRole('button', { name: /Add all/ }).click();

    searchboxChosen.click();
    userEvent.type(searchboxChosen, 'asdf');

    expect(screen.getAllByText('No packages found').length === 2);
    // We need to clear this input in order to not have sideeffects on other tests
    await searchForChosenPackages(searchboxChosen, '');
  });

  test('search results should be sorted alphabetically', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

    searchbox.click();

    const getPackages = jest
      .spyOn(api, 'getPackagesContentSources')
      .mockImplementation(() =>
        Promise.resolve(mockPkgResultAlphaContentSources)
      );

    await searchForAvailablePackages(searchbox, 'test');
    expect(getPackages).toHaveBeenCalledTimes(1);

    const availablePackagesList = screen.getByTestId('available-pkgs-list');
    const availablePackagesItems = within(availablePackagesList).getAllByRole(
      'option'
    );
    expect(availablePackagesItems).toHaveLength(3);

    const [firstItem, secondItem, thirdItem] = availablePackagesItems;
    expect(firstItem).toHaveTextContent('testsummary for test package');
    expect(secondItem).toHaveTextContent('lib-testlib-test package summary');
    expect(thirdItem).toHaveTextContent('Z-testZ-test package summary');
  });

  test('available packages can be reset', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0];

    searchbox.click();

    const getPackages = jest
      .spyOn(api, 'getPackagesContentSources')
      .mockImplementation(() => Promise.resolve(mockPkgResultContentSources));

    await searchForAvailablePackages(searchbox, 'test');
    expect(getPackages).toHaveBeenCalledTimes(1);

    const availablePackagesList = screen.getByTestId('available-pkgs-list');
    const availablePackagesItems = within(availablePackagesList).getAllByRole(
      'option'
    );
    expect(availablePackagesItems).toHaveLength(3);

    screen
      .getByRole('button', { name: /clear available packages search/i })
      .click();

    screen.getByText('Search above to add additionalpackages to your image');
  });

  test('chosen packages can be reset after filtering', async () => {
    await setUp();

    const availableSearchbox = screen.getAllByRole('textbox')[0];

    availableSearchbox.click();

    const getPackages = jest
      .spyOn(api, 'getPackagesContentSources')
      .mockImplementation(() => Promise.resolve(mockPkgResultContentSources));

    await searchForAvailablePackages(availableSearchbox, 'test');
    expect(getPackages).toHaveBeenCalledTimes(1);

    const availablePackagesList = screen.getByTestId('available-pkgs-list');
    const availablePackagesItems = within(availablePackagesList).getAllByRole(
      'option'
    );
    expect(availablePackagesItems).toHaveLength(3);

    screen.getByRole('button', { name: /Add all/ }).click();

    const chosenPackagesList = screen.getByTestId('chosen-pkgs-list');
    let chosenPackagesItems = within(chosenPackagesList).getAllByRole('option');
    expect(chosenPackagesItems).toHaveLength(3);

    const chosenSearchbox = screen.getAllByRole('textbox')[1];
    chosenSearchbox.click();
    await searchForChosenPackages(chosenSearchbox, 'Pkg');
    chosenPackagesItems = within(chosenPackagesList).getAllByRole('option');
    // eslint-disable-next-line jest-dom/prefer-in-document
    expect(chosenPackagesItems).toHaveLength(1);

    screen
      .getByRole('button', { name: /clear chosen packages search/i })
      .click();
    chosenPackagesItems = within(chosenPackagesList).getAllByRole('option');
    expect(chosenPackagesItems).toHaveLength(3);
  });
});

describe('Step Custom repositories', () => {
  const setUp = async () => {
    history = renderWithReduxRouter(<CreateImageWizard />).history;

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-aws');
    awsTile.click();
    getNextButton().click();

    // aws step
    userEvent.type(screen.getByTestId('aws-account-id'), '012345678901');
    getNextButton().click();
    // skip registration
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    const registerLaterRadio = screen.getByLabelText('Register later');
    userEvent.click(registerLaterRadio);
    getNextButton().click();

    // skip fsc
    getNextButton().click();

    // skip packages
    getNextButton().click();
  };

  test('show only valid (successful) repositories', async () => {
    jest
      .spyOn(api, 'getRepositories')
      .mockImplementation(() => Promise.resolve(mockRepositoryResults));

    await setUp();

    // Display all repositories on one page
    screen.getByRole('button', { name: /items per page/i }).click();
    screen.getByRole('menuitem', { name: /100 per page/i }).click();

    // gnome-shell-extensions should not be present
    const table = await screen.findByTestId('repositories-table');
    const { getAllByRole } = within(table);
    const rows = getAllByRole('row');

    // remove first row from list since it is just header labels
    rows.shift();

    // mockRepositoryResults has 21 repositories, gnome-shell-extensions status is
    // 'Invalid' and it should not appear in table
    expect(rows).toHaveLength(20);
    expect(table).not.toHaveTextContent('gnome-shell-extensions');
  });

  test('selected packages stored in and retrieved from form state', async () => {
    jest
      .spyOn(api, 'getRepositories')
      .mockImplementation(() => Promise.resolve(mockRepositoryResults));

    await setUp();

    const getFirstRepoCheckbox = () =>
      screen.getByRole('checkbox', {
        name: /select row 0/i,
      });
    let firstRepoCheckbox = getFirstRepoCheckbox();

    expect(firstRepoCheckbox.checked).toEqual(false);
    userEvent.click(firstRepoCheckbox);
    expect(firstRepoCheckbox.checked).toEqual(true);

    getNextButton().click();
    getBackButton().click();

    firstRepoCheckbox = getFirstRepoCheckbox();
    expect(firstRepoCheckbox.checked).toEqual(true);
  });

  test('all repositories are fetched when number of repositories is greater than API limit', async () => {
    jest.spyOn(api, 'getRepositories').mockImplementation((limit) => {
      return limit
        ? Promise.resolve(mockRepositoryResponseAll)
        : Promise.resolve(mockRepositoryResponsePartial);
    });

    await setUp();
    screen
      .getByRole('button', {
        name: /select/i,
      })
      .click();

    screen.getByText(/select all \(132 items\)/i);
  });

  test('filter works', async () => {
    jest
      .spyOn(api, 'getRepositories')
      .mockImplementation(() => Promise.resolve(mockRepositoryResults));
    await setUp();

    userEvent.type(
      screen.getByRole('textbox', { name: /search repositories/i }),
      '2'
    );

    // gnome-shell-extensions is invalid and should not be present
    const table = await screen.findByTestId('repositories-table');
    const { getAllByRole } = within(table);
    const getRows = () => getAllByRole('row');

    let rows = getRows();
    // remove first row from list since it is just header labels
    rows.shift();

    expect(rows).toHaveLength(4);

    // clear filter
    screen.getByRole('button', { name: /reset/i }).click();

    rows = getRows();
    // remove first row from list since it is just header labels
    rows.shift();

    expect(rows).toHaveLength(10);
  });
});

describe('Click through all steps', () => {
  jest
    .spyOn(api, 'getRepositories')
    .mockImplementation(() => Promise.resolve(mockRepositoryResults));

  const setUp = async () => {
    const view = renderWithReduxRouter(<CreateImageWizard />);
    history = view.history;
    store = view.store;
  };

  test('with valid values', async () => {
    await setUp();

    // select image output
    const releaseMenu = screen.getByRole('button', {
      name: /options menu/i,
    });
    userEvent.click(releaseMenu);
    const releaseOption = screen.getByRole('option', {
      name: 'Red Hat Enterprise Linux (RHEL) 8',
    });
    userEvent.click(releaseOption);

    userEvent.click(screen.getByTestId('upload-aws'));
    userEvent.click(screen.getByTestId('upload-azure'));
    userEvent.click(screen.getByTestId('upload-google'));
    userEvent.click(screen.getByTestId('checkbox-vmware'));
    userEvent.click(screen.getByTestId('checkbox-guest-image'));
    userEvent.click(screen.getByTestId('checkbox-image-installer'));

    screen.getByRole('button', { name: /Next/ }).click();
    userEvent.type(screen.getByTestId('aws-account-id'), '012345678901');
    screen.getByRole('button', { name: /Next/ }).click();

    userEvent.type(screen.getByTestId('input-google-email'), 'test@test.com');
    screen.getByRole('button', { name: /Next/ }).click();

    // Randomly generated GUID
    userEvent.type(
      screen.getByTestId('azure-tenant-id'),
      'b8f86d22-4371-46ce-95e7-65c415f3b1e2'
    );
    userEvent.type(
      screen.getByTestId('azure-subscription-id'),
      '60631143-a7dc-4d15-988b-ba83f3c99711'
    );
    userEvent.type(
      screen.getByTestId('azure-resource-group'),
      'testResourceGroup'
    );
    screen.getByRole('button', { name: /Next/ }).click();

    // registration
    const mockActivationKeys = [
      { id: '0', name: 'name0' },
      { id: 1, name: 'name1' },
    ];
    jest
      .spyOn(api, 'getActivationKeys')
      .mockImplementation(() => Promise.resolve(mockActivationKeys));
    const mockActivationKey = {
      name0: {
        additionalRepositories: [
          {
            repositoryLabel: 'repository0',
          },
          {
            repositoryLabel: 'repository1',
          },
          {
            repositoryLabel: 'repository2',
          },
        ],
        id: '0',
        name: 'name0',
        releaseVersion: '',
        role: '',
        serviceLevel: 'Self-Support',
        usage: 'Production',
      },
      name1: {
        additionalRepositories: [
          {
            repositoryLabel: 'repository3',
          },
          {
            repositoryLabel: 'repository4',
          },
          {
            repositoryLabel: 'repository5',
          },
        ],
        id: '1',
        name: 'name1',
        releaseVersion: '',
        role: '',
        serviceLevel: 'Premium',
        usage: 'Production',
      },
    };
    jest.spyOn(api, 'getActivationKey').mockImplementation((name) => {
      return Promise.resolve(mockActivationKey[name]);
    });

    const registrationRadio = screen.getByLabelText(
      'Register and connect image instances with Red Hat'
    );
    userEvent.click(registrationRadio);

    const activationKeyDropdown = await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    userEvent.click(activationKeyDropdown);
    const activationKey = await screen.findByRole('option', {
      name: 'name0',
    });
    userEvent.click(activationKey);
    screen.getByDisplayValue('name0');

    getNextButton().click();

    // fsc
    (await screen.findByTestId('file-system-config-radio-manual')).click();
    const ap = await screen.findByTestId('file-system-add-partition');
    ap.click();
    ap.click();
    const tbody = screen.getByTestId('file-system-configuration-tbody');
    const rows = within(tbody).getAllByRole('row');
    expect(rows).toHaveLength(3);
    getNextButton().click();
    // set mountpoint of final row to /var/tmp
    within(rows[2]).getAllByRole('button', { name: 'Options menu' })[0].click();
    within(rows[2]).getByRole('option', { name: '/var' }).click();
    await waitForElementToBeRemoved(() =>
      screen.queryAllByRole('heading', {
        name: 'Danger alert: Duplicate mount point.',
      })
    );
    userEvent.type(
      within(rows[2]).getByRole('textbox', {
        name: 'Mount point suffix text input',
      }),
      '/tmp'
    );

    // set size of the final row to 100 MiB
    userEvent.type(
      within(rows[2]).getByRole('textbox', { name: 'Size text input' }),
      '{backspace}100'
    );
    within(rows[2]).getAllByRole('button', { name: 'Options menu' })[1].click();
    within(rows[2]).getByRole('option', { name: 'MiB' }).click();
    getNextButton().click();

    // packages
    const getPackages = jest
      .spyOn(api, 'getPackagesContentSources')
      .mockImplementation(() => Promise.resolve(mockPkgResultContentSources));

    screen.getByText(
      /Images built with Image Builder include all required packages/i
    );

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref
    await searchForAvailablePackages(searchbox, 'test');
    expect(getPackages).toHaveBeenCalledTimes(1);
    screen
      .getByRole('option', { name: /testPkg test package summary/ })
      .click();
    screen.getByRole('button', { name: /Add selected/ }).click();
    getNextButton().click();

    // Custom repositories
    userEvent.click(screen.getByRole('checkbox', { name: /select row 0/i }));
    userEvent.click(screen.getByRole('checkbox', { name: /select row 1/i }));
    getNextButton().click();

    // Custom packages
    getNextButton().click();

    // Enter image name
    const nameInput = screen.getByRole('textbox', {
      name: 'Image name',
    });
    userEvent.type(nameInput, 'MyImageName');
    getNextButton().click();

    // review
    await screen.findByText(
      'Review the information and click "Create image" to create the image using the following criteria.'
    );
    await screen.findAllByText('Amazon Web Services');
    await screen.findAllByText('Google Cloud Platform');
    await screen.findByText('VMWare');
    await screen.findByText('Virtualization - Guest image');
    await screen.findByText('Bare metal - Installer');
    await screen.findByText('Register with Subscriptions and Red Hat Insights');
    await screen.findByText('MyImageName');

    screen.getByTestId('tab-registration').click();
    await screen.findByText('name0');
    await screen.findByText('Self-Support');
    await screen.findByText('Production');

    screen.getByTestId('repositories-popover-button').click();
    const repotbody = await screen.findByTestId(
      'additional-repositories-table'
    );
    expect(within(repotbody).getAllByRole('row')).toHaveLength(3);

    screen.getByTestId('file-system-configuration-popover').click();
    const revtbody = await screen.findByTestId(
      'file-system-configuration-tbody-review'
    );
    expect(within(revtbody).getAllByRole('row')).toHaveLength(3);

    // mock the backend API
    const ids = [];
    const customizations = {
      payload_repositories: [
        {
          baseurl: 'http://yum.theforeman.org/releases/3.4/el8/x86_64/',
          check_gpg: true,
          gpgkey:
            '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
          rhsm: false,
        },
        {
          baseurl:
            'http://mirror.stream.centos.org/SIGs/9/kmods/x86_64/packages-main/',
          rhsm: false,
        },
      ],
      filesystem: [
        {
          mountpoint: '/',
          min_size: 10737418240,
        },
        {
          mountpoint: '/home',
          min_size: 1073741824,
        },
        {
          mountpoint: '/var/tmp',
          min_size: 104857600,
        },
      ],
      packages: ['testPkg'],
      subscription: {
        'activation-key': 'name0',
        insights: true,
        organization: 5,
        'server-url': 'subscription.rhsm.redhat.com',
        'base-url': 'https://cdn.redhat.com/',
      },
    };

    const composeImage = jest
      .spyOn(api, 'composeImage')
      .mockImplementation((body) => {
        let id;
        if (body.image_requests[0].upload_request.type === 'aws') {
          expect(body).toEqual({
            distribution: RHEL_8,
            image_name: 'MyImageName',
            image_requests: [
              {
                architecture: 'x86_64',
                image_type: 'aws',
                upload_request: {
                  type: 'aws',
                  options: {
                    share_with_accounts: ['012345678901'],
                  },
                },
              },
            ],
            customizations: customizations,
          });
          id = 'edbae1c2-62bc-42c1-ae0c-3110ab718f56';
        } else if (body.image_requests[0].upload_request.type === 'gcp') {
          expect(body).toEqual({
            distribution: RHEL_8,
            image_name: 'MyImageName',
            image_requests: [
              {
                architecture: 'x86_64',
                image_type: 'gcp',
                upload_request: {
                  type: 'gcp',
                  options: {
                    share_with_accounts: ['user:test@test.com'],
                  },
                },
              },
            ],
            customizations: customizations,
          });
          id = 'edbae1c2-62bc-42c1-ae0c-3110ab718f57';
        } else if (body.image_requests[0].upload_request.type === 'azure') {
          expect(body).toEqual({
            distribution: RHEL_8,
            image_name: 'MyImageName',
            image_requests: [
              {
                architecture: 'x86_64',
                image_type: 'azure',
                upload_request: {
                  type: 'azure',
                  options: {
                    tenant_id: 'b8f86d22-4371-46ce-95e7-65c415f3b1e2',
                    subscription_id: '60631143-a7dc-4d15-988b-ba83f3c99711',
                    resource_group: 'testResourceGroup',
                  },
                },
              },
            ],
            customizations: customizations,
          });
          id = 'edbae1c2-62bc-42c1-ae0c-3110ab718f58';
        } else if (body.image_requests[0].image_type === 'vsphere') {
          expect(body).toEqual({
            distribution: RHEL_8,
            image_name: 'MyImageName',
            image_requests: [
              {
                architecture: 'x86_64',
                image_type: 'vsphere',
                upload_request: {
                  type: 'aws.s3',
                  options: {},
                },
              },
            ],
            customizations: customizations,
          });
          id = 'edbae1c2-62bc-42c1-ae0c-3110ab718f59';
        } else if (body.image_requests[0].image_type === 'guest-image') {
          expect(body).toEqual({
            distribution: RHEL_8,
            image_name: 'MyImageName',
            image_requests: [
              {
                architecture: 'x86_64',
                image_type: 'guest-image',
                upload_request: {
                  type: 'aws.s3',
                  options: {},
                },
              },
            ],
            customizations: customizations,
          });
          id = 'edbae1c2-62bc-42c1-ae0c-3110ab718f5a';
        } else if (body.image_requests[0].image_type === 'image-installer') {
          expect(body).toEqual({
            distribution: RHEL_8,
            image_name: 'MyImageName',
            image_requests: [
              {
                architecture: 'x86_64',
                image_type: 'image-installer',
                upload_request: {
                  type: 'aws.s3',
                  options: {},
                },
              },
            ],
            customizations: customizations,
          });
          id = 'edbae1c2-62bc-42c1-ae0c-3110ab718f5b';
        }

        ids.unshift(id);
        return Promise.resolve({ id });
      });

    const create = screen.getByRole('button', { name: /Create/ });
    create.click();

    // API request sent to backend
    expect(composeImage).toHaveBeenCalledTimes(6);

    // returns back to the landing page
    await waitFor(() =>
      expect(history.location.pathname).toBe('/insights/image-builder')
    );
    expect(store.getState().composes.allIds).toEqual(ids);
    // set test timeout of 10 seconds
  }, 10000);
});
