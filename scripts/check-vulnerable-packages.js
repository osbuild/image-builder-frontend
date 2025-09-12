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

  const deniedPackages = {};
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
          // Build the full package name with namespace if present
          const packageName = purl.namespace 
            ? `${decodeURIComponent(purl.namespace)}/${purl.name}`
            : purl.name;
          
          if (packageName && purl.version) {
            deniedPackages[`${packageName}@${purl.version}`] = true;
          }
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
    for (const [path, info] of Object.entries(packages)) {
      if (path === '') continue;
      const key = `${path.split('/').pop()}@${info.version}`;
      if (deniedPackages[key]) {
        found.push(key);
      }
    }
  }
  
  if (packageLock.packages) scan(packageLock.packages);
  
  // Report results
  if (found.length > 0) {
    console.error(`\n❌ Found ${found.length} compromised package(s):`);
    found.forEach(pkg => console.error(`  - ${pkg}`));
    console.error('\nThese packages are from a supply chain attack. DO NOT MERGE!');
    console.error('See: https://socket.dev/blog/npm-author-qix-compromised-in-major-supply-chain-attack\n');
    process.exit(1);
  } else {
    console.log(`✅ No compromised packages detected (checked ${Object.keys(deniedPackages).length} packages)`);
  }
}

checkPackages();
