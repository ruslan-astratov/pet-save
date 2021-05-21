import { createStore, applyMiddleware } from 'redux'
import { rootReducer } from '../reducers'
import thunk from 'redux-thunk'

// Создаём стор на основе корневого редюсера  (applyMiddleware - промежуточные обработчики)
export const store = createStore(rootReducer, applyMiddleware(thunk))
