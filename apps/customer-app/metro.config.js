// Metro config for use inside an npm-workspaces monorepo.
// Dependencies are hoisted to the repo-root node_modules, so Metro must be
// told to (a) watch the whole monorepo and (b) resolve modules from both the
// app's own node_modules and the root node_modules.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the whole monorepo for changes.
config.watchFolders = [monorepoRoot];

// Resolve modules from the app first, then the hoisted root node_modules.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules')
];

module.exports = config;
