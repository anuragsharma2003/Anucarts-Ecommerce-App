const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  // Enable Metro to reset its cache
  server: {
    resetCache: true,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

//const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
//
///**
// * Metro configuration
// * https://reactnative.dev/docs/metro
// *
// * @type {import('metro-config').MetroConfig}
// */
//const config = {};
//
//module.exports = mergeConfig(getDefaultConfig(__dirname), config);
