// Компонент - страница, на которой мы можем посмотреть всех возможных ИСПОЛНИТЕЛЕЙ или КЛИЕНТОВ , подходящих для нашей заявки
import './LookPotentialClientsOrPerformers.css';

import React from "react"

import {Link} from "react-router-dom"

import swal from 'sweetalert';



export default class LookPotentialClientsOrPerformers extends React.Component {

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

    nameSurnameWhoSendOffer: null,

    // подходящие под мою заявку клиенты или исполнители
    clientsOrworkersApplicationsFromDB: []
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

    fetch(`http://localhost:3005/mathesClientsOrWorkers/${this.props.match.params.id}?type=${type}`, {
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

        fio: `${jsArr[2]} ${jsArr[3]}`,

        city: jsArr[0].city,
        dateFrom: jsArr[0].dateFrom,
        dateTo: jsArr[0].dateTo,
        email: jsArr[0].email,
        house: jsArr[0].house,
        id: jsArr[0].id,
        notes: jsArr[0].notes,
        price: jsArr[0].price,
        street: jsArr[0].street,
        tel: jsArr[0].tel,
        typeOfPet: jsArr[0].typeOfPet,
        userID: jsArr[0].userID,

        nameSurnameWhoSendOffer: jsArr[0].nameSurnameWhoSendOffer,
        
        clientsOrworkersApplicationsFromDB: jsArr[1] }, ()=> {

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
  redirectToAllApplicationsPage= ()=> {
    this.props.history.push("/allapplications")
  }

  // Функция, которая при вводе данных в инпуты меняет соответствующие поля в стейте
  handleChange = (e)=> {
    this.setState({ [e.target.name] : e.target.value })
  }




  // // Функция, которая при переходе на страницу с ПРОФИЛЕМ выбранного нами КЛИЕНТА/ИСПОЛНИТЕЛЯ визуально отмечает ли-шку как "уже просмотренную"
  // handleClickVisited = (id)=> {
    

  //   let clientsOrworkersApplicationsFromDBCOPY = this.state.clientsOrworkersApplicationsFromDB.slice()

  //   // Ищем по id объект-заявку и добавляем объекту свойство isVisited = true
  //   clientsOrworkersApplicationsFromDBCOPY = clientsOrworkersApplicationsFromDBCOPY.map( obj => {


  //     if( obj.id == id  ) {
  //       return {
  //         ...obj,
  //         isVisited: true
  //       }
  //     }

  //     else {
  //       return obj
  //     }

  //   })

  //   this.setState({ clientsOrworkersApplicationsFromDB: clientsOrworkersApplicationsFromDBCOPY  }, ()=> {
  //     console.log(this.state)
  //   })

  //   // this.props.history.push(`/ProfileClientOrWorker/${id}?type=${this.state.type}`)

  // }

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
        <div className="wrapper-for-two-forms without-pg">


          <div>
            <h2 className="heading-of-block">Данные по моей заявке</h2>

            <form className="left-form left-form-without-mg" onSubmit={this.handleSubmit}>
            {/* <h2 className="left-form-heading">{this.state.activeControl === "clients" ? "Клиент" : "Исполнитель"}</h2> */}

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
            Хочу {this.state.type !== "clients" ? "отдать" : "взять" }  на время:
            </label>
            <select disabled value={this.state.typeOfPet} name="typeOfPet" className="select" onChange={this.handleChange}>
              <option>Вид животного</option>
              <option>Кошку</option>
              <option>Собаку</option>
              <option>Птицу</option>
              <option>Рептилию</option>
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

          <div >
              <h2 className="heading-of-block">Список подходящих {this.state.type === "clients" ? "клиентов" : "исполнителей"}</h2>
                        
              <div className="application-block application-block-height">
                <ul className="list-with-items">
                {this.state.clientsOrworkersApplicationsFromDB.length > 0 && this.state.clientsOrworkersApplicationsFromDB.map( item => {

                  return (
                    <li className= { item.isVisited ? "list-item isVisited" : "list-item" } >
                      <div>{item.nameSurname}</div>
                      Может {this.state.type === "workers" ? "взять" : "отдать" } {item.typeOfPet} <br/> с {item.dateFrom} по {item.dateTo}

                      <br/>
                      <Link onClick={this.handleClickVisited} to={`/ProfileClientOrWorker/${item.id}?type=${this.state.type}`} className={ item.isVisited ? "button-to-redirect-on-searchpage isVisited" : "button-to-redirect-on-searchpage" }> Смотреть профиль </Link>
                      <br/>

                      { item.nameSurname === this.state.nameSurnameWhoSendOffer && item.offer === "да" ? (
                        <small className="gifting-bage">Можете связаться с {this.state.type === "clients" ? "клиентом" : "исполнителем"} для совершения сделки</small>
                      ) : null }

                      {item.nameSurname === this.state.nameSurnameWhoSendOffer && item.offer === "нет" ? (
                        <small className="gifting-bage">Пользователь прислал вам предложение</small>
                      ) : null }

                      <br/>

                      {item.offer === "да" && item.nameSurname !== this.state.nameSurnameWhoSendOffer ? (
                        <small className="sending-bage">Вы уже отправляли заявку данному пользователю.</small>
                      ) : null}
                    </li> 
                  ) 

                } )}
                </ul>
              </div>

          </div>

        </div>

        

        <button onClick={this.redirectToAllApplicationsPage} className="link-to-create-application">Вернуться назад</button>

      </div>
    );
  }

}
