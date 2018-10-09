/** @format */

import {AppRegistry} from 'react-native';
import App from './App';
import Entry from "./Entry";
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => Entry);