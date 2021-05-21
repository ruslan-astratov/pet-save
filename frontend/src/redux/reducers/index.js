import { combineReducers } from 'redux'
import { petSafe } from './petSafe'

export const rootReducer = combineReducers({
  petSafeState: petSafe

})
