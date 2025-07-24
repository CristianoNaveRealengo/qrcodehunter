/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { name as appName } from './package.json';
import App from './src/App';

AppRegistry.registerComponent(appName, () => App);

if (typeof document !== 'undefined') {
  const rootTag = document.getElementById('root') || document.getElementById('app-root');
  AppRegistry.runApplication(appName, { rootTag });
}