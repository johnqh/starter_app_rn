#!/usr/bin/env node
/**
 * Merge environment files for React Native
 * Mimics Vite's behavior: .env first (defaults), then .env.local (overrides)
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const envLocalPath = path.join(rootDir, '.env.local');
const envMergedPath = path.join(rootDir, '.env.merged');

function parseEnvFile(filePath) {
  const result = {};
  if (!fs.existsSync(filePath)) {
    return result;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return;
    }
    const equalIndex = trimmedLine.indexOf('=');
    if (equalIndex > 0) {
      const key = trimmedLine.substring(0, equalIndex).trim();
      let value = trimmedLine.substring(equalIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      result[key] = value;
    }
  });
  return result;
}

function serializeEnv(envObj) {
  const lines = [
    '# Auto-generated merged environment file',
    '# DO NOT EDIT - Edit .env or .env.local instead',
    `# Generated at: ${new Date().toISOString()}`,
    '',
  ];
  Object.entries(envObj).forEach(([key, value]) => {
    if (value.includes(' ') || value.includes('#') || value.includes('"')) {
      lines.push(`${key}="${value}"`);
    } else {
      lines.push(`${key}=${value}`);
    }
  });
  return lines.join('\n') + '\n';
}

console.log('Merging environment files...');

const envBase = parseEnvFile(envPath);
console.log(`  Loaded ${Object.keys(envBase).length} variables from .env`);

const envLocal = parseEnvFile(envLocalPath);
if (Object.keys(envLocal).length > 0) {
  console.log(`  Loaded ${Object.keys(envLocal).length} variables from .env.local`);
}

const merged = { ...envBase, ...envLocal };
console.log(`  Total merged variables: ${Object.keys(merged).length}`);

const content = serializeEnv(merged);
fs.writeFileSync(envMergedPath, content);
console.log('Merged environment written to .env.merged');
