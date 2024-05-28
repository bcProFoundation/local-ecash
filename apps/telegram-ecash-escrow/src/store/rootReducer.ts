import { counterReducer } from '@bcpros/counter';
import { combineReducers } from '@reduxjs/toolkit';



export const clientReducer = combineReducers({
  counter: counterReducer,
});

export default clientReducer;

