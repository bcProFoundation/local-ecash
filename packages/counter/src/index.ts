import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { counterReducer } from "./reducer";
import { countWatcher } from "./saga";
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { CountAwareState, useSliceSelector } from "./state";

const persistConfig = {
    key: 'root',
    storage
    // whitelist: ['counter']
}

export const getCounterEgg = () => {
    return {
        id: 'counter-egg',
        reducersMap: {
            counter: counterReducer
        },
        sagas: [countWatcher]
    }
};

export const counterEggPersist = () => {
    return {
        id: 'counter-egg',
        reducersMap: {
            counter: persistReducer(persistConfig, counterReducer)
        },
        sagas: [countWatcher]
    }
}

export let useSliceSelector: TypedUseSelectorHook<CountAwareState> =
  useSelector;

// This function would configure a "local" store if called, but currently it is
// not called, and is just used for type inference.
const configureLocalStore = () =>
  configureStore({
    reducer: { counter: counterReducer },
  });


  type SliceDispatch = ReturnType<typeof configureLocalStore>["dispatch"];

  export let useSliceDispatch = () => useDispatch<SliceDispatch>();

  // Allows initializing of this package by a calling package with the "global"
// dispatch and selector hooks of that package, provided they satisfy this packages
// state and dispatch interfaces--which they will if the imported this package and
// used it to compose their store.
export const initializeSlicePackage = (
    useAppDispatch: typeof useSliceDispatch,
    useAppSelector: typeof useSliceSelector 
  ) => {
    useSliceDispatch = useAppDispatch;
    useSliceSelector = useAppSelector;
  };