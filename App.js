import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import 'react-native-gesture-handler';

import RootNavigator from './navigation/RootNavigator';
import {store} from './store/store';
import {MenuProvider} from 'react-native-popup-menu';

const App = () => {
  return (
    <Provider store={store}>
      <MenuProvider>
        <RootNavigator />
      </MenuProvider>
    </Provider>
  );
};

export default App;
