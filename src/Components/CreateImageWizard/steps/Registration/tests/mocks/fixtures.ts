import type { ListActivationKeysApiResponse } from '@/store/api/rhsm';

export const mockActivationKeys: ListActivationKeysApiResponse = {
  body: [
    {
      name: 'activation-key-1',
      role: undefined,
      serviceLevel: 'Self-Support',
      usage: 'Production',
    },
    {
      name: 'activation-key-2',
      role: undefined,
      serviceLevel: undefined,
      usage: 'Development',
    },
    {
      name: 'test-key-alpha',
      role: undefined,
      serviceLevel: 'Self-Support',
      usage: 'Production',
    },
  ],
};

export const mockEmptyActivationKeys: ListActivationKeysApiResponse = {
  body: [],
};

export const VALID_SATELLITE_COMMAND = `
set -o pipefail && curl -sS 'https://ec2-107-23-89.compute-1.amazonaws.com/register?activation_keys=ak&location_id=2&organization_id=1&update_packages=false'
// -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjQxMDI0NDQ4MDB9.CQ6hOQJLJDfD_P5gaEIEseY5iMRLhnk7iC5ZJ4Rzno0 | bash`; // notsecret

export const SATELLITE_COMMAND_EXPIRED_TOKEN = `
set -o pipefail && curl -sS 'https://ec2-107-23-89.compute-1.amazonaws.com/register?activation_keys=ak&location_id=2&organization_id=1&update_packages=false'
// -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo1LCJpYXQiOjE3MjM4Mzc3MjIsImp0aSI6IjBhNTU3MDM3ZDIyNzUyMDYwM2M3MWIzZDI4NGYwZjQ1NmFjYjE5NzEyNmFmNTk5NzU0NWJmODcwZDczM2RhY2YiLCJleHAiOjE3MjM4NTIxMjIsInNjb3BlIjoicmVnaXN0cmF0aW9uI2dsb2JhbCByZWdpc3RyYXRpb24jaG9zdCJ9.HsSnZEqq--MIJfP3_awn6SflEruoEm77iSWh0Pi6EW4'
//  | bash`; // notsecret

export const SATELLITE_COMMAND_NO_EXPIRATION = `
set -o pipefail && curl -sS 'https://ec2-107-23-89.compute-1.amazonaws.com/register?activation_keys=ak&location_id=2&organization_id=1&update_packages=false'
// -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' | bash`; // notsecret

export const INVALID_SATELLITE_COMMAND = 'invalid-command';

export const VALID_CERTIFICATE = `-----BEGIN CERTIFICATE-----
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
