const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// Monorepo: uncomment when moving to yarn workspaces
// const path = require('path');
// const projectRoot = __dirname;
// const monorepoRoot = path.resolve(projectRoot, '../..');

const config = {
  // Monorepo: uncomment when moving to yarn workspaces
  // watchFolders: [monorepoRoot],
  // resolver: {
  //   nodeModulesPaths: [
  //     path.resolve(projectRoot, 'node_modules'),
  //     path.resolve(monorepoRoot, 'node_modules'),
  //   ],
  // },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
