import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
} from '../actions/petSafeActions'

const initialState = {
  name: '',
  error: '',
  isFetching: false,
}

export function petSafe(state = initialState, action) {
  switch (action.type) {
    case LOGIN_REQUEST:
      // Возвращается НОВЫЙ объект, в котором мы "взорвали" прежний state, и перезаписали некоторые его свойства 
      return { ...state, isFetching: true, error: '' }

    case LOGIN_SUCCESS:
      return { ...state, isFetching: false, name: action.payload }

    case LOGIN_FAIL:
      return { ...state, isFetching: false, error: action.payload.message }

    default:
      return state
  }
}
