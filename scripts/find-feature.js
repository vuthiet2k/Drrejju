#!/usr/bin/env node
/**
 * scripts/find-feature.js — Fast Feature Map & Package Lookup CLI for AI Agents
 * Usage: node scripts/find-feature.js <keyword-or-selector> [--json]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PACKAGES_PATH = path.join(ROOT, 'configs', 'feature-packages.json');

const query = process.argv.slice(2).filter(a => !a.startsWith('--')).join(' ').trim().toLowerCase();
const isJson = process.argv.includes('--json');

if (!query) {
  console.log('Usage: node scripts/find-feature.js <keyword|selector|defect-id> [--json]');
  process.exit(1);
}

let packagesData = { packages: [] };
try {
  packagesData = JSON.parse(fs.readFileSync(PACKAGES_PATH, 'utf8'));
} catch (e) {
  console.error('[Error] Could not read feature-packages.json:', e.message);
  process.exit(1);
}

const matches = packagesData.packages.filter(pkg => {
  const matchId = pkg.packageId.toLowerCase().includes(query);
  const matchName = pkg.name.toLowerCase().includes(query);
  const matchDesc = pkg.description.toLowerCase().includes(query);
  const matchDefects = (pkg.defectsCovered || []).some(d => d.toLowerCase().includes(query));
  const matchFiles = (pkg.allowedEditFiles || []).some(f => f.toLowerCase().includes(query));
  return matchId || matchName || matchDesc || matchDefects || matchFiles;
});

if (isJson) {
  console.log(JSON.stringify(matches, null, 2));
} else {
  if (matches.length === 0) {
    console.log(`[Lookup] No feature packages found for query: "${query}"`);
  } else {
    console.log(`\n[Lookup Results for: "${query}"] — Found ${matches.length} matching package(s):`);
    matches.forEach(m => {
      console.log(`\n📦 Package: ${m.packageId} (${m.name})`);
      console.log(`   Description:  ${m.description}`);
      console.log(`   Defects:      ${m.defectsCovered.join(', ') || 'None'}`);
      console.log(`   Allowed Files:`);
      m.allowedEditFiles.forEach(f => console.log(`     - ${f}`));
    });
  }
}
