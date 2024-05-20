import { counterReducer } from '@bcpros/counter';
import { combineReducers } from '@reduxjs/toolkit';

const rootReducer = combineReducers({
  counter: counterReducer
});

export default rootReducer;
