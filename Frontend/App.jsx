import React from 'react';
import {Provider} from 'react-redux';
import store from './Store/Store';
import {RootNavigator} from "./screens/"

const App = () => {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>

  );
};

export default App;
