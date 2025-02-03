/**
 * @format
 */

// Polyfill for window.location required by @emailjs/browser in React Native
if (typeof window === 'undefined') {
  global.window = {};
}
if (!window.location) {
  window.location = { protocol: 'https:' };
}

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

///**
// * @format
// */
//
//import {AppRegistry} from 'react-native';
//import App from './App';
//import {name as appName} from './app.json';
//
//AppRegistry.registerComponent(appName, () => App);