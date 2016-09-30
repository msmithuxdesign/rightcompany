//require("./main.scss");
//require("./styles/radar.css");

import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import rootReducer from './reducers'
import App from './containers/App';
import configureStore from './store/configureStore'
import './styles/input.css'
//import { readData } from './Data/companyData';


const store = configureStore('Data/companyData.csv');
const history = syncHistoryWithStore(browserHistory, store);


ReactDOM.render(
  <Provider store={store} history={history}>
    <App />
  </Provider>,
  document.getElementById('app')
);

if (module.hot) {
    module.hot.accept('./containers/App', () => {
        const NewRoot = require('./containers/App').default;
        render(
            <AppContainer>
                <NewRoot store={store} history={history} />
            </AppContainer>,
            document.getElementById('app')
        );
    });
}
