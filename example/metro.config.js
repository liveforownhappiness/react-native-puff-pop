const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');

const root = path.resolve(__dirname, '..');
const projectRoot = __dirname;

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = getDefaultConfig(projectRoot);

// Watch the root directory for changes
config.watchFolders = [root];

// Resolve react-native-puff-pop to the src folder
config.resolver.extraNodeModules = {
  'react-native-puff-pop': path.resolve(root, 'src'),
  // Force React and React Native to use the example's versions
  'react': path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};

// Block duplicate React packages from root
config.resolver.blockList = [
  new RegExp(`^${path.resolve(root, 'node_modules/react')}/.*$`),
  new RegExp(`^${path.resolve(root, 'node_modules/react-native')}/.*$`),
];

// Allow importing from the parent directory
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(root, 'node_modules'),
];

config.resolver.unstable_enablePackageExports = true;

module.exports = config;

