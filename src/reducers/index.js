import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import {default as phoneData } from '../Data/phoneData'
import {default as _assign } from 'lodash.assign';
import { fetchData, dataReturned } from '../actions/index';
import { DATA_UPDATED } from '../Constants/actionTypes';
import { readData } from '../Data/CompanyData';

const reducer = function(state, action) {
  if(state === null || typeof state === 'undefined') {
    state = {};
  }
  console.log('reducer called, action is:');
  console.log(action.type);
  switch (action.type) {
    case '@@INIT':
      const compData = readData();
      let ud ={};
      compData.categories.forEach((c) => {
        ud[c]=5;
      });
      _assign(state, {phoneData: phoneData}, {companyData: compData, userData: ud});
      return state;
    case DATA_UPDATED: 
      let t = {};
      t[action.catChanged] = parseInt(action.value);
      let userDat ={};
      _assign(userDat, state.userData, t);
      return _assign({},{companyData: state.companyData, userData: userDat});
    default:
      return state;
  }
};

const rootReducer = combineReducers({ reducer, routing});
export default rootReducer;
