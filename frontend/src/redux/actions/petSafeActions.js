export const LOGIN_REQUEST = 'LOGIN_REQUEST'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_FAIL = 'LOGIN_FAIL'

// АСИНХРОННЫЙ ЭКШН-креейтор (запрос к API)
export function handleLogin() {
  
  return function(dispatch) {
    // dispatch({
    //   type: LOGIN_REQUEST,
    // })

    // VK.Auth.login(r => {
    //   if (r.session) {
    //     const username = r.session.user.first_name

    //     dispatch({
    //       type: LOGIN_SUCCESS,
    //       payload: username,
    //     })
    //   } else {
    //     dispatch({
    //       type: LOGIN_FAIL,
    //       error: true,
    //       payload: new Error('Ошибка авторизации'),
    //     })
    //   }
    // }, 4) 
  }
}








// export const GET_PHOTOS_REQUEST = 'GET_PHOTOS_REQUEST';
// export const GET_PHOTOS_SUCCESS = 'GET_PHOTOS_SUCCESS';

// export function getPhotos(year) {

//   return (dispatch) => {
//     // экшен с типом REQUEST (запрос начался)
//     // диспатчится сразу, как будто-бы     ПЕРЕД   реальным    запросом
//     dispatch({
//       type: GET_PHOTOS_REQUEST,
//       payload: year,
//     });

//     // а экшен внутри setTimeout
//     // диспатчится через секунду (когда данные с  сервера придут)
//     // как будто-бы в это время
//     // наши данные загружались из сети
//     setTimeout(() => {
//       dispatch({
//         type: GET_PHOTOS_SUCCESS,
//         payload: [1, 2, 3, 4, 5],
//       });
//     }, 1000);
//   };
// }


// Когда у нас НЕТ асинхронных операций, наш экшен-криейтор должен просто возвращать ОБЪЕКТ

// Когда же у нас появляются запросы к API или таймеры (асинхронность), тогда экшен-криейтор должен возвращать ФУНКЦИЮ, в которой по очереди будут диспатчиться экшены




// Ещё один пример асинхронного запроса к внешнему API (с помощью библиотеки AXIOS)

// export const addTodo = ({ title, userId }) => {

//   return dispatch => {

//     dispatch(addTodoStarted());

//     axios
//       .post(`https://jsonplaceholder.typicode.com/todos`, {
//         title,
//         userId,
//         completed: false
//       })
//       .then(res => {
//         dispatch(addTodoSuccess(res.data));
//       })
//       .catch(err => {
//         dispatch(addTodoFailure(err.message));
//       });
//   };
// };



// const addTodoSuccess = todo => ({
//   type: ADD_TODO_SUCCESS,
//   payload: {
//     ...todo
//   }
// });


// const addTodoStarted = () => ({
//   type: ADD_TODO_STARTED
// });


// const addTodoFailure = error => ({
//   type: ADD_TODO_FAILURE,
//   payload: {
//     error
//   }
// });
