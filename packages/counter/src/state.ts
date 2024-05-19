import { Action } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useSelector } from 'react-redux'
import { ThunkAction } from 'redux-thunk'

export interface CounterStateInterface {
  counter: CountState
}

export interface CountState {
  count: number
}

type SliceThunkInterface<ReturnType = void> = ThunkAction<
  ReturnType,
  CounterStateInterface,
  unknown,
  Action<string>
>
