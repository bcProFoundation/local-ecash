import { counterReducer } from '@bcpros/counter';
import { Action, ThunkAction, combineReducers, configureStore } from '@reduxjs/toolkit';

const combineReducer = combineReducers({
  counter: counterReducer
});
export type RootState = ReturnType<typeof combineReducer>;
export const store = configureStore({
  reducer: {
    counter: counterReducer
  }
});

// Infer the type of makeStore
export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
// Infer the `RootState` and `AppDispatch` types from the store itself
// export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
