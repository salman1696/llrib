/**
 * @format
 */
import React from 'react';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {PersistGate} from 'redux-persist/integration/react';
import {persistStore} from 'redux-persist';
import Store from './src/Store';
import {Provider} from 'react-redux';
let persistedStore = persistStore(Store);

console.disableYellowBox = true;

const WrappedApp = () => {
  return (
    <Provider store={Store}>
      <PersistGate loading={null} persistor={persistedStore}>
        <App />
      </PersistGate>
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => WrappedApp);
