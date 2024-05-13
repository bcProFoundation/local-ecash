import { Action } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useSelector } from "react-redux";
import { ThunkAction } from "redux-thunk";

export interface CountAwareState {
    ['count']: CountState
}

export interface CountState {
    count: number
}

type SliceThunkInterface<ReturnType = void> = ThunkAction<
  ReturnType,
  CountAwareState,
  unknown,
  Action<string>
>;

