import './AllApplications.css';

import React from "react"

import {Link} from "react-router-dom"

import swal from 'sweetalert';


export default class AllApplications extends React.Component {

  state = {

    userName: "",

    userSurname: "",

    clientsApplicationsFromDB: [],

    workersApplicationsFromDB: []

  }



  // При загрузке страницы проверяем - авторизован ли пользователь 
  componentDidMount() {
    // Здесь мы должны обратиться к LocalStorage и проверить - есть ли там токен
    this.checkIfAutorised()

    // Здесь мы должны вызвать функцию, которая бы запрашивала у БАЗЫ ДАННЫХ все мои заявки, оформленные как от лица КЛИЕНТА, так и от лица ИСПОЛНИТЕЛЯ
    fetch('http://localhost:3005/allapplications', {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        "Authorization" : localStorage.getItem("token")
      }
    })
    .then( responseBody => responseBody.json() )
    .then( jsArr => {
      console.log(`Успешно получили данные по заявкам`, jsArr)

      this.setState({ clientsApplicationsFromDB: jsArr[0], workersApplicationsFromDB: jsArr[1], userName: jsArr[2], userSurname: jsArr[3] })

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



  // Когда кликаю по кнопке "Редактировать заявку" - я должен попадать на отдельную страницу MainPage , с формой, в которую подставятся редактируемые значения
  clickToChangeApplication = (id, type)=> {

    this.props.history.push(`/mainpage/${id}?type=${type}`)

  }

  // Перенаправление на страницу с ФОРМОЙ СОЗДАНИЯ НОВОЙ / РЕДАКТИРОВАНИЯ СУЩЕСТВУЮЩЕЙ  заявки
  redirectToMainPage = ()=> {
    this.props.history.push(`/mainpage`)
  }


  // Функция , которая УДАЛЯЕТ ИЗ БАЗЫ данных -> из таблицы одну КОНКРЕТНУЮ ЗАЯВКУ
  // Функция принимает : название таблицы (клиенты или исполнители)  и   id - шник конкретной заявки 
  deleteApplication = (nameTable, id)=> {


    fetch(`http://localhost:3005/deleteApplication/${id}?type=${nameTable}`, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        "Authorization" : localStorage.getItem("token")
      }
    })
    .then( responseBody => responseBody.json() )
    .then( jsArr => {

      console.log(`Успешно удалили одну конкретную заявку`)

      // В стейт устанавливаем данные, которые пришли из базы данных - то есть  ВСЕ заявки по КЛИЕНТАМ/ИСПОЛНИТЕЛЯМ, но без удалённого КЛИЕНТА/ИСПОЛНИТЕЛЯ
      this.setState({ clientsApplicationsFromDB: jsArr[0], workersApplicationsFromDB: jsArr[1] })

    })


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

        <h2 className="allApplications-heading">{this.state.userName} {this.state.userSurname}</h2>

        <h1 className="allApplications-heading">Все мои заявки:</h1>

        <button onClick={this.handleClickLogOut} className="log-out">Выйти</button>

        <div className="wrapper-for-two-forms">

          <div className="application-block">
            <h2 className="heading-block">В качестве клиента:</h2>

            <ul className="list-with-items">
              {this.state.clientsApplicationsFromDB.length > 0 && this.state.clientsApplicationsFromDB.map( item => {

                return (
                  <li className="list-item">
                    Хочу  оставить на время: {item.typeOfPet}

                    <br/>
                    <Link to={`/LookPotentialClientsOrPerformers/${item.id}?type=workers`} className="button-to-redirect-on-searchpage">Смотреть возможных исполнителей</Link>
                    <br/>
                    <span className="change-button" onClick={()=> this.clickToChangeApplication(item.id, "clients")}>Редактировать заявку</span>

                    <br/>
                    <span className="delete-button" onClick={()=> this.deleteApplication( "clients", item.id )}>Удалить заявку</span>
                  </li>
                )

              } )}
            </ul>
          </div>

          <div className="application-block">
            <h2 className="heading-block">В качестве исполнителя:</h2>

            <ul className="list-with-items">
            {this.state.workersApplicationsFromDB.length > 0 && this.state.workersApplicationsFromDB.map( item => {

              return (
                <li className="list-item">
                  Хочу  взять на время: {item.typeOfPet}

                  <br/>
                  <Link to={`/LookPotentialClientsOrPerformers/${item.id}?type=clients`} className="button-to-redirect-on-searchpage">Смотреть возможных клиентов</Link>
                  <br/>
                  <span className="change-button" onClick={()=> this.clickToChangeApplication(item.id, "workers")}>Редактировать заявку</span>
                  <br/>
                  <span className="delete-button" onClick={()=> this.deleteApplication( "workers", item.id )}>Удалить заявку</span>
                </li> 
              ) 

            } )}
            </ul>
          </div>

        </div>

        

        <button onClick={this.redirectToMainPage} className="link-to-create-application">Создать новую заявку</button>

      </div>
    );
  }

}
