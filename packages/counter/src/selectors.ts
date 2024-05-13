import { CountAwareState } from "./state"

export const countSelector = (state: CountAwareState): number => {
  return state['count'].count
}