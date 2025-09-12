# Security Vulnerability Scanning

This repository has automated security scanning to prevent compromised packages from being merged.

## Overview

We use two security checks to protect against supply chain attacks:

1. **GitHub Dependency Review Action** - Checks for known vulnerabilities in the GHSA database
2. **Custom Blocked Package Check** - Blocks specific compromised packages from known supply chain attacks

## Configuration

All compromised packages are listed in `.github/dependency-review-config.yml` under the `deny-packages` section.

This configuration is used by:
- GitHub's dependency-review-action (in CI)
- Our local security check script

## How to Use

### Check for compromised packages locally:
```bash
npm run security:check
```

### Add new blocked packages:
Edit `.github/dependency-review-config.yml` and add to the `deny-packages` list:
```yaml
deny-packages:
  - package-name:version
```

## References

- [Supply Chain Attack (Sept 2025)](https://socket.dev/blog/npm-author-qix-compromised-in-major-supply-chain-attack)
- [GitHub Dependency Review Action](https://github.com/actions/dependency-review-action)
