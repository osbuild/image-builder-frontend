import { Customizations } from '../../store/imageBuilderApi';

export const customizations: Customizations = {
  custom_repositories: [
    {
      baseurl: ['http://yum.theforeman.org/releases/3.4/el8/x86_64/'],
      check_gpg: true,
      check_repo_gpg: false,
      gpgkey: [
        '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
      ],
      id: 'dbad4dfc-1547-45f8-b5af-1d7fec0476c6',
      name: '13lk3',
    },
    {
      baseurl: [
        'http://mirror.stream.centos.org/SIGs/9/kmods/x86_64/packages-main/',
      ],
      check_gpg: false,
      id: '9cf1d45d-aa06-46fe-87ea-121845cc6bbb',
      name: '2lmdtj',
    },
  ],
  payload_repositories: [
    {
      baseurl: 'http://yum.theforeman.org/releases/3.4/el8/x86_64/',
      check_gpg: true,
      check_repo_gpg: false,
      gpgkey:
        '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
      id: 'dbad4dfc-1547-45f8-b5af-1d7fec0476c6',
      rhsm: false,
    },
    {
      baseurl:
        'http://mirror.stream.centos.org/SIGs/9/kmods/x86_64/packages-main/',
      rhsm: false,
      check_gpg: false,
      id: '9cf1d45d-aa06-46fe-87ea-121845cc6bbb',
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
  packages: ['test'],
  subscription: {
    'activation-key': 'name0',
    insights: true,
    rhc: true,
    organization: 5,
    'server-url': 'subscription.rhsm.redhat.com',
    'base-url': 'https://cdn.redhat.com/',
  },
};

export const SATELLITE_COMMAND = `
set -o pipefail && curl -sS ‘https://ec2-107-23-89.compute-1.amazonaws.com/register?activation_keys=ak&location_id=2&organization_id=1&update_packages=false’
// -H ‘Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjQxMDI0NDQ4MDB9.CQ6hOQJLJDfD_P5gaEIEseY5iMRLhnk7iC5ZJ4Rzno0 | bash`;

export const SATELLITE_COMMAND_EXPIRED_TOKEN = `
set -o pipefail && curl -sS ‘https://ec2-107-23-89.compute-1.amazonaws.com/register?activation_keys=ak&location_id=2&organization_id=1&update_packages=false’
// -H ‘Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo1LCJpYXQiOjE3MjM4Mzc3MjIsImp0aSI6IjBhNTU3MDM3ZDIyNzUyMDYwM2M3MWIzZDI4NGYwZjQ1NmFjYjE5NzEyNmFmNTk5NzU0NWJmODcwZDczM2RhY2YiLCJleHAiOjE3MjM4NTIxMjIsInNjb3BlIjoicmVnaXN0cmF0aW9uI2dsb2JhbCByZWdpc3RyYXRpb24jaG9zdCJ9.HsSnZEqq--MIJfP3_awn6SflEruoEm77iSWh0Pi6EW4’
//  | bash`;

export const CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIIDUDCCAjigAwIBAgIUIE7ftn9J9krO6TRJg8M3plAZGgEwDQYJKoZIhvcNAQEL
BQAwYjELMAkGA1UEBhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExFjAUBgNVBAcM
DVNhbiBGcmFuY2lzY28xETAPBgNVBAoMCFRlc3QgT3JnMRMwEQYDVQQDDAp0ZXN0
LmxvY2FsMB4XDTI1MDIwNTEzMzk0N1oXDTI2MDIwNTEzMzk0N1owYjELMAkGA1UE
BhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExFjAUBgNVBAcMDVNhbiBGcmFuY2lz
Y28xETAPBgNVBAoMCFRlc3QgT3JnMRMwEQYDVQQDDAp0ZXN0LmxvY2FsMIIBIjAN
BgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy8JdVoIaWh0PO1dL7xuGUNBUx6hZ
PBYSnWpPS7lNL3Y/KHNNZhStm0ISFYcB4C/mlJN+9kMcl3CXoktZHfrkencRwhlv
9aua70fZmmjgHDn3Stm25pqrhehUzoKZPlai9eXGJfY1q52ZMjNa0dxJjt6IST8U
oAwwXrBr14dUjuMM0ZhLeLtiTAh1Eb8CnXMmVmkhoMBbMODE3Lkqr72K8kseu8Qx
6Iq96ggkwiAQr3+h2GOkqtEl6BQEbjG1CVlVMCTU3B3yJ/uDUYvqK3897PdgWkUQ
2L3dZPTWv+p8+UjaC4zVYGnM7NpJisMZPXsbA9KiqaF+bUvLLjP9budPXwIDAQAB
MA0GCSqGSIb3DQEBCwUAA4IBAQCz2uByr3Tf34zSeYhy1z6MLJR4ijcfuWhxuE7D
M5fB4I0Ua3K6+ptZDvlWuikF+5InnoU3HSfrXVPCJ1my4jsgk+c4YKPW0yVRrr6m
hS2CKZyngICWnGCIYrlXlKeNJe4j23WF7IRhsykvkpt69Vw1x99UIJBcobOx+Kw/
zB92/XFIBwOZArUmGDaiL5MnqhmFWfc6mtIELxIRKCj9LQG9y7L1JoVyqug3thgZ
CdoLGtbHXri9BSR+8ogXu4JWp0YwMHTul6AEb2kcSZHTrYj6lUkXJMsw+E5jV37G
jZKGigLMSUp2z4jT+aX+HblYHrvTbrKct23EMeJeANQzF08e
-----END CERTIFICATE-----`;
