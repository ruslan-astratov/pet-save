// Компонент - страница, на которой мы можем посмотреть всех возможных ИСПОЛНИТЕЛЕЙ или КЛИЕНТОВ , подходящих для нашей заявки
import './ProfileClientOrWorker.css';

import swal from 'sweetalert';

import React from "react"

// import {Link} from "react-router-dom"

export default class ProfileClientOrWorker extends React.Component {

  state = {
    // Кого смотрим - клиентов или исполнителей
    type: "clients",

    fio: "",

    city: "",
    dateFrom: "",
    dateTo: "",
    email: "",
    house: "",
    id: null,
    notes: "",
    price: "",
    street: "",
    tel: "",
    typeOfPet: "",
    userID: null,


    offer: null,

  }



  // При загрузке страницы проверяем - авторизован ли пользователь 
  componentDidMount() {
    // Здесь мы должны обратиться к LocalStorage и проверить - есть ли там токен
    this.checkIfAutorised()

    // Здесь мы должны вызвать функцию, которая бы запрашивала у БАЗЫ ДАННЫХ:
    // - мою заявку, для которой я ищу КЛИЕНТОВ/ИСПОЛНИТЕЛЕЙ
    // - ДАННЫЕ ПО ПОДХОДЯЩИМ КЛИЕНТАМ/ИСПОЛНИТЕЛЯМ

    // Получаем тип  type  из query-строки. 
    let queryString = this.props.location.search

    console.log("Наша query-строка", queryString)

    let queryStringArr = queryString.split("")

    let findedSymbolEuqal = queryStringArr.findIndex( letter => letter === "=")

    // Получаем массив символов , которые идут после знака "="
    let arraySymbols = queryStringArr.slice( findedSymbolEuqal + 1 )

    let type = arraySymbols.join("")

    fetch(`http://localhost:3005/dataOfConcreteClientOrWorker/${this.props.match.params.id}?type=${type}`, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        "Authorization" : localStorage.getItem("token")
      }
    })
    .then( responseBody => responseBody.json() )
    .then( jsArr => {
      console.log(`Ответ с сервера`, jsArr)

      this.setState({
        type: type,

        fio: jsArr.nameSurname,

        city: jsArr.city,
        dateFrom: jsArr.dateFrom,
        dateTo: jsArr.dateTo,
        email: jsArr.email,
        house: jsArr.house,
        id: jsArr.id,
        notes: jsArr.notes,
        price: jsArr.price,
        street: jsArr.street,
        tel: jsArr.tel,
        typeOfPet: jsArr.typeOfPet,
        userID: jsArr.userID,


        offer: jsArr.offer
        
      }, ()=> {

        console.log("Наш стейт", this.state)

      })

    })

  }

  // Читает токен из LS и , если он есть , то всё нормально
  checkIfAutorised = ()=> {

    if(!localStorage.getItem("token")) {

      this.redirectToRegisterPage()

    }
  }

  // Функция, которая "ПЕРЕНАПРАВЛЯЕТ" на  страницу с РЕГИСТРАЦИЕЙ/АВТОРИЗАЦИЕЙ
  redirectToRegisterPage = ()=> {
    this.props.history.push("/")
  }


  // Функция, которая перенаправляет нас НАЗАД, на страницу со всеми МОИМИ заявками
  redirectToLookPotentialClientsOrPerformersPage= ()=> {
    this.props.history.goBack();
  }



  // Функция, которая сработает при клике на "Предложить свои услуги"
  sendOffer = ()=> {

    swal("Предложение отправлено");

    // this.setState({ isSendOffer: true})

    const info = {
      offer: 'да'
    }

    fetch(`http://localhost:3005/sendOffer/${this.state.id}?type=${this.state.type}`, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
        "Authorization" : localStorage.getItem("token")
      },
      body: JSON.stringify(info)
    })
    .then( responseBody => responseBody.json() )
    .then( ()=> {
      // Получаем тип  type  из query-строки. 
      let queryString = this.props.location.search

      console.log("Наша query-строка", queryString)

      let queryStringArr = queryString.split("")

      let findedSymbolEuqal = queryStringArr.findIndex( letter => letter === "=")

      // Получаем массив символов , которые идут после знака "="
      let arraySymbols = queryStringArr.slice( findedSymbolEuqal + 1 )

      let type = arraySymbols.join("")

      fetch(`http://localhost:3005/dataOfConcreteClientOrWorker/${this.props.match.params.id}?type=${type}`, {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          "Authorization" : localStorage.getItem("token")
        }
      })
      .then( responseBody => responseBody.json() )
      .then( jsArr => {
        console.log(`Ответ с сервера`, jsArr)

        this.setState({
          type: type,

          fio: jsArr.nameSurname,

          city: jsArr.city,
          dateFrom: jsArr.dateFrom,
          dateTo: jsArr.dateTo,
          email: jsArr.email,
          house: jsArr.house,
          id: jsArr.id,
          notes: jsArr.notes,
          price: jsArr.price,
          street: jsArr.street,
          tel: jsArr.tel,
          typeOfPet: jsArr.typeOfPet,
          userID: jsArr.userID,


          offer: jsArr.offer
          
        }, ()=> {

          console.log("Наш стейт", this.state)

        })
      })
    } )
  }


    // Кнопка "Выйти"
    handleClickLogOut = ()=> {

      swal("Вы действительно хотите выйти из аккаунта?", {
        buttons: {
          cancel: "Отмена",
  
          defeat: "Да",
        },
      })
      .then((value) => {
        switch (value) {
       
          case "cancel":
            alert("Вы НЕ вышли")
          break;
       
          case "defeat":
            // alert("Вы вышли")
  
            localStorage.removeItem("token")
            this.props.history.push("/")
          break;
       
          default:
        }
      });
  
    }
  
  

  render() {
    return (
      <div className="allApplications">
        <button onClick={this.handleClickLogOut} class="log-out">Выйти</button>
        

        <h1 className="allApplications-heading"> Информация {this.state.type !== "clients" ? "об исполнителе" : "о клиенте"}</h1>

        <div className="wrapper-for-two-forms wrapper-for-two-forms-without-pd">


          <form className="left-form bg-color" onSubmit={this.handleSubmit}>
            <input disabled value={this.state.fio} name="fio" placeholder="Имя Фамилия" onChange={this.handleChange}/>

            <div className="wrapper-for-dates">
              <span>С&nbsp;&nbsp;</span>
              <input disabled value={this.state.dateFrom} name="dateFrom" type="date" onChange={this.handleChange}/>&nbsp;&nbsp;
              <span>По&nbsp;&nbsp;</span>
              <input disabled value={this.state.dateTo} name="dateTo" type="date" onChange={this.handleChange}/>
            </div>

            <label className="label">
              Цена за услугу (в рублях)
            </label>
            <input disabled value={this.state.price} name="price" type="number" placeholder="Цена за услугу (в рублях)" onChange={this.handleChange}/>


            <br/>
            <label className="label">
            Телефон
            </label>
            <input disabled value={this.state.tel} name="tel"  type="number" placeholder="Телефон" onChange={this.handleChange}/>
            <br/>

            <label className="label">
            Электронная почта
            </label>
            <input  disabled value={this.state.email} name="email"  type="email" placeholder="Электронная почта" onChange={this.handleChange}/>

            <br/>

            <label className="label">
            Город
            </label>
            <input disabled value={this.state.city}  name="city" placeholder="Город" onChange={this.handleChange}/>

            <br/>
            <label className="label">
            Улица
            </label>
            <input disabled value={this.state.street} name="street" placeholder="Улица" onChange={this.handleChange}/>


            <br/>
            <label className="label">
            Дом
            </label>
            <input disabled value={this.state.house} name="house" placeholder="Дом" onChange={this.handleChange}/>


            <br/>
            <label className="label">
            Тип животного
            </label>
            <select disabled value={this.state.typeOfPet} name="typeOfPet" className="select" onChange={this.handleChange}>
              <option>Вид животного</option>
              <option>Кошка</option>
              <option>Собака</option>
              <option>Птица</option>
              <option>Ящерица</option>
              <option>Водоплавающее</option>
              <option>Насекомое</option>
            </select>

            <br/>


            {this.state.notes && (
              <label className="label">
              Тип животного
              </label>
            )}



            <textarea disabled value={this.state.notes} name="notes" className="textarea" placeholder="Особые примечания" onChange={this.handleChange}/>
            <br/>

          </form>


        </div>

        {this.state.type === "clients" ? (

          <button disabled={this.state.offer === "да" ? true : false} onClick={this.sendOffer} className={this.state.offer  === "да" ? "button-to-send-offer disabled-send-button" : "button-to-send-offer" }> {this.state.offer === "да" ? "Услуги были предложены" : "Предложить свои услуги"} </button>

        ) : (
          <button disabled={this.state.offer === "да" ? true : false} onClick={this.sendOffer} className={this.state.offer === "да" ? "button-to-send-offer disabled-send-button" : "button-to-send-offer" }> {this.state.offer !== "нет" ? "Работа была предложена" : "Предложить работу"} </button>
        )}

        
        <br/>

        <button onClick={this.redirectToLookPotentialClientsOrPerformersPage} className="link-to-create-application">Вернуться назад</button>

      </div>
    );
  }

}
