This directory includes test data and mock fixtures for boot tests.

## Information about test certificates

### Example certificate

This certificate is used only for the purpose of running Satellite boot tests as a mock "Certificate authority (CA) for Satellite". It is externalized as `validCertificate` in [`satelliteFixtures.ts`](satelliteFixtures.ts)

```text
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: 1 (0x1)
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: O=Example CA
        Validity
            Not Before: Nov 18 07:53:37 2020 GMT
            Not After : Nov 18 07:53:37 2035 GMT
        Subject: O=Example CA
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                Public-Key: (2048 bit)
                Modulus:
                    00:b1:e6:7c:56:2f:54:4b:64:d5:32:1b:d8:e1:ca:
                    a1:78:8e:e3:fd:66:5c:82:c1:3a:2e:66:83:19:f8:
                    f5:54:f6:63:15:94:3b:d1:39:d7:58:89:83:d8:fa:
                    eb:20:e5:bc:9d:3f:03:06:41:73:e4:d3:12:4e:70:
                    1b:61:c6:be:21:37:d3:b4:d2:86:3e:ae:4b:2c:03:
                    e7:f8:1f:e4:fc:b4:d2:32:13:12:36:f2:ce:32:dd:
                    a7:3b:a1:f1:6f:c2:f2:0f:f4:15:0c:88:be:9c:5f:
                    03:0a:22:1b:56:01:f1:ad:25:ec:48:ef:c7:6b:66:
                    48:ec:8c:0e:13:5f:06:e4:bf:38:48:88:30:cf:63:
                    89:ba:0b:c8:46:e1:c4:a0:21:6f:74:34:70:6d:a9:
                    05:99:98:a5:64:4b:9b:51:b6:ad:a7:9c:47:92:dc:
                    97:60:65:e6:53:06:be:6d:57:52:f9:ac:18:41:78:
                    e6:6f:13:fb:a5:f1:8a:d2:65:7e:ea:c6:2d:81:73:
                    87:7a:54:01:f4:80:8e:75:69:dc:a6:00:85:b0:36:
                    11:59:92:0a:8e:8e:41:f2:fd:77:a4:db:b9:e7:07:
                    32:81:88:5e:93:06:04:52:c6:be:e0:b5:53:22:33:
                    91:82:50:90:25:ad:a6:53:83:3c:ce:0f:d7:8f:fb:
                    96:fd
                Exponent: 65537 (0x10001)
        X509v3 extensions:
            X509v3 Basic Constraints: critical
                CA:TRUE
            X509v3 Key Usage: critical
                Certificate Sign, CRL Sign
            X509v3 Subject Key Identifier: 
                C4:53:3A:A2:91:57:6A:EF:FF:23:BD:2F:9C:61:3F:B9:3B:20:1F:B3
            X509v3 Authority Key Identifier: 
                C4:53:3A:A2:91:57:6A:EF:FF:23:BD:2F:9C:61:3F:B9:3B:20:1F:B3
    Signature Algorithm: sha256WithRSAEncryption
    Signature Value:
        21:f7:29:2e:b8:3b:cc:05:3d:3a:9a:87:01:2e:df:e6:5b:a2:
        6f:5b:db:47:7c:92:14:fe:ca:df:39:5f:a9:60:ef:0f:16:fd:
        09:55:84:70:c2:c5:61:19:65:fb:82:f3:72:35:78:fc:e4:08:
        ea:12:2c:9a:0b:87:9b:99:70:a8:b0:f0:c2:ca:8c:40:fd:15:
        2d:11:a3:09:f7:cd:20:32:d7:68:da:57:35:b8:d9:43:63:1e:
        c5:ea:8c:5d:aa:84:3a:eb:f4:26:bd:8e:5d:87:c7:06:aa:a9:
        7d:f8:16:25:5c:51:0b:6d:4e:8a:fd:c6:d7:6c:52:0d:cc:4f:
        90:c1:1b:cf:83:1f:c2:b5:e9:aa:e4:16:d9:16:67:0e:4f:0f:
        cc:f5:1e:e9:de:18:79:3d:f3:3f:b8:ce:f5:4a:41:bc:57:22:
        3a:89:2b:6e:f0:aa:a0:06:61:08:e3:70:87:e4:a2:da:4b:a9:
        59:7e:71:9a:6b:52:ac:d7:43:9d:42:e3:5b:89:cb:91:12:e0:
        37:a8:bd:e3:8f:b3:8f:c3:28:de:70:0f:7e:5f:aa:89:77:c1:
        44:5c:cd:56:db:30:b1:15:a3:83:82:be:a2:47:b9:af:4e:44:
        f1:38:45:5f:1d:15:53:d3:a1:90:2e:40:75:4d:d7:c7:42:49:
        3f:e7:6e:71
```