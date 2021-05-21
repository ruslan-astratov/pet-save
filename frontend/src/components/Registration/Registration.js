import './Registration.css';

import React from "react"


export default class Registration extends React.Component {

  state = {

    canShowApp: false,

    // Показывать ли форму регистрации?
    isVisibleRegistrationForm: false, 

    // Показывать ли форму ЛОГИНА ?
    isVisibleLoginForm: false,

    // Поля формы регистрации
    name: "",
    surname: "",
    login: "",
    password: "",

    // Поля формы ЛОГИНА
    loginFromLoginForm: "",
    passwordFromLoginForm: "",


    // Выключена ли кнопка отправки?
    isSendButtonDisabled: true,


    // Показывать ли кнопку ЗАРЕГИСТРИРОВАТЬСЯ ?
    isVisibleButtonRegistration: true,



    // Показывать ли кнопку ВОЙТИ ?
    isVisibleButtonLogin: true,



  }







  componentDidMount() {

    // Здесь мы должны обратиться к LocalStorage и проверить - есть ли там токен
    this.checkIfAutorised()

  }



  // Читает токен из LS и , если он есть - устанавливаем его в стейте
  checkIfAutorised = ()=> {

    if(localStorage.getItem("token")) {

      this.redirectToMainPage()

    }
  }




  // Когда нажимаем на кнопку Зарегистрироваться  ->  должна появиться форма РЕГИСТРАЦИИ 
  handleClickRegistration = ()=> {
    this.setState({ isVisibleRegistrationForm: true, isVisibleButtonRegistration: false })
  }



  // Когда нажимаем на кнопку  ВОЙТИ  (АВТОРИЗАЦИЯ) - должна появиться форма для ВХОДА 
  handleClickLogin = ()=> {
    this.setState({ isVisibleLoginForm: true, isVisibleButtonRegistration: false })
  }





  // Когда  ВВОДИМ данные  в инпуты формы РЕГИСТРАЦИИ
  handleChange = (e)=> {

    this.setState({ [e.target.name] : e.target.value }, ()=> {

      console.log("Наш стейт", this.state)

      // Как только установили значение в стейт, нужно проверить остальные поля.  Если они НЕ пусты, мы активируем кнопку отправки данных на сервер
      if(this.state.name !== "" && this.state.surname !== "" && this.state.login !== ""  && this.state.password !== "") {
        this.setState({ isSendButtonDisabled: false })
      }

      else {
        this.setState({ isSendButtonDisabled: true })
      }

    })

  }




  // Когда  ВВОДИМ данные  в инпуты формы АВТОРИЗАЦИИ 
  handleChangeLoginForm = (e)=> {
    this.setState({ [e.target.name] : e.target.value }, ()=> {


      if(this.state.loginFromLoginForm && this.state.passwordFromLoginForm ) {
        this.setState({ isSendButtonDisabled : false })
      }

      else {
        this.setState({ isSendButtonDisabled : true })
      }

    })
  }





  // РЕГИСТРАЦИЯ.  Когда отправляем данные формы Submit  -  то есть, когда регистрируемся
  handleRegistrationSubmit = (e)=> {
    e.preventDefault()

    // Логин и пароль должны попасть в базу данных, а на фронтенд должен придти токен - и мы его сохраним в LocalStorage
    const dataFromClient = {
      name:  this.state.name,
      surname: this.state.surname,
      login: this.state.login,
      password: this.state.password
    }

    // Отправляем данные на сервер
    fetch('http://localhost:3005/register', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(dataFromClient)
    })
    .then( responseBody => responseBody.json() )
    .then( jsObj => this.handleAutorisationResponse(jsObj) )

  }




  // АВТОРИЗАЦИЯ.  Когда ввели ЛОГИН и ПАРОЛЬ в форму и нажали ОТПРАВИТЬ
  handleLogin = (e)=> {
    e.preventDefault()

    // Логин и пароль должны попасть в базу данных, а на фронтенд должен придти пароль и хэш - и мы их сохраним в LocalStorage
    const dataFromClient = {
      login: this.state.loginFromLoginForm,
      password: this.state.passwordFromLoginForm
    }

    // Отправляем данные на сервер
    fetch('http://localhost:3005/login', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(dataFromClient)
    })
    .then( responseBody => responseBody.json() )
    .then( jsObj => this.handleAutorisationResponse(jsObj) )

  }


  // Функция, которая  принимает с сервера объект с токеном и устанавливает этот токен в localStorage
  handleAutorisationResponse = (autoRes)=> {

    // Токен сохраняем в локалстораж
    localStorage.setItem( "token", autoRes.token )

    this.checkIfAutorised()

  }


  // Функция, которая в случае, если токен есть,   "ПЕРЕНАПРАВЛЯЕТ" на  следующую  страницу  - то есть на ГЛАВНУЮ,  MainPage
  redirectToMainPage = ()=> {
    this.props.history.push("/allapplications")
  }




  render() {
    return (
      <div className="homepage">

        <div className="flex-wrapper-for-words ">
          <div className="left-block  animated-class-for-left-word ">Pet</div>
          <div className="right-block animated-class-for-right-word">Save</div>
        </div>

        <h2 className="heading">Сервис, позволяющий на некоторое время взять или отдать питомца</h2>

        <button className={this.state.isVisibleButtonRegistration ? "registration-button" : "registration-button registration-button-fadeout"}
        
        onClick={this.handleClickLogin}>
          Войти
        </button>

        <br/>

        <button className={this.state.isVisibleButtonRegistration ? "registration-button" : "registration-button registration-button-fadeout"}
        
        onClick={this.handleClickRegistration}>
          Зарегистрироваться
        </button>


        { this.state.isVisibleRegistrationForm && (
          <form onSubmit={this.handleRegistrationSubmit} className="registration-form registration-form-animation">

            <input name="name" type="text" placeholder="Имя" onChange={this.handleChange}/>
            <input name="surname" type="text" placeholder="Фамилия" onChange={this.handleChange}/>
            <input name="login" type="text" placeholder="Логин" onChange={this.handleChange}/>
            <input name="password" type="password" placeholder="Пароль (не меньше 6 символов)" onChange={this.handleChange}/>

            <button
            className={ this.state.isSendButtonDisabled ? "button-send-fetch-for-registration disabled-button" : "button-send-fetch-for-registration" }
            
            disabled={this.state.isSendButtonDisabled}
            >Отправить</button>
  
          </form>
        ) }


          { this.state.isVisibleLoginForm && (
          <form onSubmit={this.handleLogin} className="login-form login-form-animation">

            <input name="loginFromLoginForm" type="text" placeholder="Логин" onChange={this.handleChangeLoginForm}/>
            <input name="passwordFromLoginForm" type="password" placeholder="Пароль (не меньше 6 символов)" onChange={this.handleChangeLoginForm}/>

            <button
            className={ this.state.isSendButtonDisabled ? "button-send-fetch-for-registration disabled-button" : "button-send-fetch-for-registration" }
            
            disabled={this.state.isSendButtonDisabled}
            >Отправить</button>
  
          </form>
        ) }



      </div>
    );
  }

}
