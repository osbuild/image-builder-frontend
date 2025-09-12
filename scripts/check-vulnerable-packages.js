#!/usr/bin/env node

/**
 * Check for compromised packages from .github/dependency-review-config.yml
 */

const fs = require('fs');
const path = require('path');
const { PackageURL } = require('packageurl-js');

// Parse deny-packages from config
function loadDeniedPackages() {
  const configPath = path.join(process.cwd(), '.github', 'dependency-review-config.yml');

  if (!fs.existsSync(configPath)) {
    console.error('Error: .github/dependency-review-config.yml not found');
    process.exit(1);
  }

  const deniedPackages = new Set();
  const lines = fs.readFileSync(configPath, 'utf8').split('\n');
  let inDenyPackages = false;

  for (const line of lines) {
    if (line.trim() === 'deny-packages:') {
      inDenyPackages = true;
      continue;
    }
    if (inDenyPackages && line[0] !== ' ' && line[0] !== '-' && line.trim() !== '') {
      break;
    }
    if (inDenyPackages && line.trim().startsWith('- ')) {
      const purlString = line.trim().substring(2).trim();

      try {
        // Parse the purl using the official library
        const purl = PackageURL.fromString(purlString);

        // Only process npm packages
        if (purl.type === 'npm') {
          // Store the normalized purl string
          deniedPackages.add(purl.toString());
        }
      } catch (error) {
        console.warn(`Warning: Invalid purl format: ${purlString}`);
      }
    }
  }

  return deniedPackages;
}

// Check package-lock.json
function checkPackages() {
  const packageLockPath = path.join(process.cwd(), 'package-lock.json');

  if (!fs.existsSync(packageLockPath)) {
    console.error('Error: package-lock.json not found');
    process.exit(1);
  }

  const deniedPackages = loadDeniedPackages();
  const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
  const found = [];

  // Scan all packages
  function scan(packages) {
    for (const [pkgPath, info] of Object.entries(packages)) {
      if (pkgPath === '' || !info.version) continue;

      // Extract package name from the path
      // e.g., "node_modules/@scope/package" -> "@scope/package"
      // e.g., "node_modules/package" -> "package"
      const pathParts = pkgPath.split('node_modules/').pop();

      // Parse the package name to extract namespace and name
      let namespace = null;
      let name = pathParts;

      if (pathParts.startsWith('@')) {
        const scopeParts = pathParts.split('/');
        if (scopeParts.length >= 2) {
          namespace = scopeParts[0];
          name = scopeParts.slice(1).join('/');
        }
      }

      try {
        // Create a PackageURL object for this package
        const purl = new PackageURL(
          'npm',
          namespace,
          name,
          info.version,
          null,
          null
        );

        // Convert to string and check if it's in the denied list
        const purlString = purl.toString();
        if (deniedPackages.has(purlString)) {
          found.push({
            purl: purlString,
            displayName: `${namespace ? namespace + '/' : ''}${name}@${info.version}`
          });
        }
      } catch (error) {
        // Skip packages that can't be parsed as purl
        continue;
      }
    }
  }

  if (packageLock.packages) scan(packageLock.packages);
  
  // Report results
  if (found.length > 0) {
    console.error(`\n❌ Found ${found.length} compromised package(s):`);
    found.forEach(pkg => console.error(`  - ${pkg.displayName}`));
    console.error('\nThese packages are from a supply chain attack. DO NOT MERGE!');
    console.error('See: https://socket.dev/blog/npm-author-qix-compromised-in-major-supply-chain-attack\n');
    process.exit(1);
  } else {
    console.log(`✅ No compromised packages detected (checked ${deniedPackages.size} packages)`);
  }
}

checkPackages();
