const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

// Monorepo root
const monorepoRoot = path.resolve(__dirname, '..');

// Map @sudobility packages to local directories
const sudobilityPackages = {
  '@sudobility/starter_lib': path.resolve(monorepoRoot, 'starter_lib'),
  '@sudobility/starter_types': path.resolve(monorepoRoot, 'starter_types'),
  '@sudobility/starter_client': path.resolve(monorepoRoot, 'starter_client'),
  '@sudobility/di': path.resolve(monorepoRoot, '..', '0xmail', 'di'),
  '@sudobility/types': path.resolve(monorepoRoot, '..', '0xmail', 'types'),
};

const config = {
  watchFolders: [
    monorepoRoot,
    ...Object.values(sudobilityPackages),
  ],
  resolver: {
    sourceExts: [...defaultConfig.resolver.sourceExts, 'cjs'],
    resolverMainFields: ['react-native', 'browser', 'main'],
    extraNodeModules: {
      ...sudobilityPackages,
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
      '@tanstack/react-query': path.resolve(__dirname, 'node_modules/@tanstack/react-query'),
    },
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(monorepoRoot, 'node_modules'),
    ],
    blockList: [
      /starter_app\/node_modules\/.*/,
      /starter_api\/node_modules\/.*/,
      /starter_lib\/node_modules\/.*/,
      /starter_types\/node_modules\/.*/,
      /starter_client\/node_modules\/.*/,
    ],
  },
};

module.exports = mergeConfig(defaultConfig, config);
