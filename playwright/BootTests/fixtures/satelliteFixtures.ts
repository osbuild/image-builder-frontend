// Command uses mock token
export const registrationCurlCommand = `curl --silent --show-error 'https://localhost/register?activation_keys=my-key&download_utility=curl&location_id=2&organization_id=1&update_packages=false' --header 'Authorization: Bearer mock.eyJleHAiOjk5OTk5OTk5OTl9.mock'`; // not secret
export const validRegistrationCommand = `set -o pipefail && ${registrationCurlCommand} | bash`;

export const validCertificate = `-----BEGIN CERTIFICATE-----
MIIDCDCCAfCgAwIBAgIBATANBgkqhkiG9w0BAQsFADAVMRMwEQYDVQQKDApFeGFt
cGxlIENBMB4XDTIwMTExODA3NTMzN1oXDTM1MTExODA3NTMzN1owFTETMBEGA1UE
CgwKRXhhbXBsZSBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALHm
fFYvVEtk1TIb2OHKoXiO4/1mXILBOi5mgxn49VT2YxWUO9E511iJg9j66yDlvJ0/
AwZBc+TTEk5wG2HGviE307TShj6uSywD5/gf5Py00jITEjbyzjLdpzuh8W/C8g/0
FQyIvpxfAwoiG1YB8a0l7Ejvx2tmSOyMDhNfBuS/OEiIMM9jiboLyEbhxKAhb3Q0
cG2pBZmYpWRLm1G2raecR5Lcl2Bl5lMGvm1XUvmsGEF45m8T+6XxitJlfurGLYFz
h3pUAfSAjnVp3KYAhbA2EVmSCo6OQfL9d6TbuecHMoGIXpMGBFLGvuC1UyIzkYJQ
kCWtplODPM4P14/7lv0CAwEAAaNjMGEwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8B
Af8EBAMCAQYwHQYDVR0OBBYEFMRTOqKRV2rv/yO9L5xhP7k7IB+zMB8GA1UdIwQY
MBaAFMRTOqKRV2rv/yO9L5xhP7k7IB+zMA0GCSqGSIb3DQEBCwUAA4IBAQAh9yku
uDvMBT06mocBLt/mW6JvW9tHfJIU/srfOV+pYO8PFv0JVYRwwsVhGWX7gvNyNXj8
5AjqEiyaC4ebmXCosPDCyoxA/RUtEaMJ980gMtdo2lc1uNlDYx7F6oxdqoQ66/Qm
vY5dh8cGqql9+BYlXFELbU6K/cbXbFINzE+QwRvPgx/Ctemq5BbZFmcOTw/M9R7p
3hh5PfM/uM71SkG8VyI6iStu8KqgBmEI43CH5KLaS6lZfnGaa1Ks10OdQuNbicuR
EuA3qL3jj7OPwyjecA9+X6qJd8FEXM1W2zCxFaODgr6iR7mvTkTxOEVfHRVT06GQ
LkB1TdfHQkk/525x
-----END CERTIFICATE-----`;
