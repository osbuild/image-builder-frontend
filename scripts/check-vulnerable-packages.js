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
  const differentVersions = new Map(); // Map of package name to {installed: Set<string>, compromised[]}

  // Build a map of package names to their compromised versions
  const compromisedByName = new Map();
  for (const purlString of deniedPackages) {
    try {
      const purl = PackageURL.fromString(purlString);
      const fullName = purl.namespace ? `${purl.namespace}/${purl.name}` : purl.name;
      if (!compromisedByName.has(fullName)) {
        compromisedByName.set(fullName, []);
      }
      compromisedByName.get(fullName).push(purl.version);
    } catch (error) {
      continue;
    }
  }

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
        const fullName = namespace ? `${namespace}/${name}` : name;
        const displayName = `${fullName}@${info.version}`;

        if (deniedPackages.has(purlString)) {
          found.push({
            purl: purlString,
            displayName: displayName
          });
        } else if (compromisedByName.has(fullName)) {
          // Package exists but at a different version
          if (!differentVersions.has(fullName)) {
            differentVersions.set(fullName, {
              installed: new Set(),
              compromised: compromisedByName.get(fullName)
            });
          }
          differentVersions.get(fullName).installed.add(info.version);
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
    
    // Show packages with different versions if any
    if (differentVersions.size > 0) {
      console.log(`\nℹ️  Found ${differentVersions.size} package(s) at different (safe) versions:`);
      for (const [pkgName, versions] of differentVersions.entries()) {
        const installedList = Array.from(versions.installed).sort().join(', ');
        const compromisedList = versions.compromised.join(', ');
        console.log(`  - ${pkgName}@${installedList} ✓ (compromised: ${compromisedList})`);
      }
    }
  }
}

checkPackages();
