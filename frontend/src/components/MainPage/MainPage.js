import React from "react"

import swal from 'sweetalert';


import './MainPage.css';


export default class MainPage extends React.Component {

  state = {

    activeControl: "clients",

    isDisabledFio: false,

    // Поля формы слева:
    fio: "",

    dateFrom: "",

    dateTo: "",

    price: "",

    tel: "",

    email: "",

    city: "",

    street: "",

    house: "",

    typeOfPet: "",

    notes: "",
    // Поля формы слева

    // Активна ли кнопка "Сохранить изменения"
    isButtonDisabled: true,

    // В зависимости от этого флага - будем показывать либо кнопку "Создать заявку" (если мы создаём первую заявку),
    // либо кнопку "Сохранить изменения" - если мы хотим РЕДАКТИРОВАТЬ уже существующую заявку
    canShowButtonSaveChanges: false,

    // Список  исполнителей/клиентов  для отрисовки.   Он запрашивается из базы данных
    clientsOrWorkersList: []
  }


  // Читает токен из LS и , если он есть , то всё нормально. Остаёмся на этой странице.  Если токена нет, перенаправляем пользователя на страницу регистрации
  checkIfAutorised = ()=> {

    if(!localStorage.getItem("token")) {

      this.redirectToRegisterPage()

    }
  }

  // Функция, которая "ПЕРЕНАПРАВЛЯЕТ" на  ГЛАВНУЮ страницу  - MainPage
  redirectToRegisterPage = ()=> {
    this.props.history.push("/")
  }

  

  // При загрузке страницы первым делом проверяем - авторизован ли пользователь 
  componentDidMount() {
    // Здесь мы должны обратиться к LocalStorage и проверить - есть ли там токен
    this.checkIfAutorised()


    // Теперь нужно проверить - попали ли мы на эту страницу с параметром или без него. 
    // То есть -  когда мы хотим  РЕДАКТИРОВАТЬ  существующую
    if(this.props.match.params.id) {

      // Получаем сам параметр - id
      let id = this.props.match.params.id
      console.log("Получаем массив нужных нам символов id ->", id )

      // ------------------------------------------------

      let queryString = this.props.location.search

      console.log("Наша query-строка", queryString)

      // ?type=clients
      let queryStringArr = queryString.split("")

      let findedSymbolEuqal = queryStringArr.findIndex( letter => letter === "=")

      // Получаем массив символов , которые идут после знака "="
      let arraySymbols = queryStringArr.slice( findedSymbolEuqal + 1 )

      let type = arraySymbols.join("")
  
     
      // Делаем запрос на сервер -> из него в БАЗУ ДАННЫХ -> ищем по id нужную нам заявку, которую хотим отредактировать. 
      // Получаем данные по этой заявке и устанавливаем их в стейт.  По этому стейту - заполнится форма 
      fetch(`http://localhost:3005/changedApplication/${id}?type=${type}`, {
        headers: {
          'Content-type': 'application/json',
          "Authorization" : localStorage.getItem("token")
        }
      })
        .then( responseBody => responseBody.json() )
        .then( jsArr => {

          // jsObj - это массив, состоящий из объекта с данными , и типа - клиент/исполнитель
          console.log(jsArr[0])

          this.setState({

            activeControl: jsArr[1],

            fio: `${jsArr[2]} ${jsArr[3]}`,

            dateFrom: jsArr[0].dateFrom,

            dateTo: jsArr[0].dateTo,

            price: jsArr[0].price,

            tel: jsArr[0].tel,

            email: jsArr[0].email,
        
            city: jsArr[0].city,
        
            street: jsArr[0].street,
        
            house:  jsArr[0].house,
        
            typeOfPet: jsArr[0].typeOfPet,
        
            notes: jsArr[0].notes,

            isButtonDisabled: false,

            // Делаем инпут с ФИО неактивным 
            isDisabledFio: true,

            canShowButtonSaveChanges: true

          })

        })
    }

    // Если же мы хотим СОЗДАТЬ НОВУЮ ЗАЯВКУ 
    else {
      fetch(`http://localhost:3005/newApplication`, {
        headers: {
          'Content-type': 'application/json',
          "Authorization" : localStorage.getItem("token")
        }
      })
        .then( responseBody => responseBody.json() )
        .then( jsObj => {

          console.log("Получили Имя Фамилию", jsObj)

          this.setState({

            fio: `${jsObj.userName} ${jsObj.userSurname}`,
            isDisabledFio: true

          })

        })
    }

  }













  // Визуально выделает один из двух активных контролов - "Клиент" или "Исполнитель"
  clickHandler = (e)=> {

    this.setState({ activeControl : e.target.name }, ()=> {
      console.log(this.state)
    })
  }


  // При изменении в инпутах, ПРИ ВВОДЕ в них -  будет меняться стейт  - что повлияет на АКТИВНОСТЬ кнопки снизу
  handleChange = (e)=> {
    this.setState({ [e.target.name] : e.target.value }, ()=> {

      console.log(this.state)

        if(this.state.fio !== "" &&  this.state.dateFrom !== "" && this.state.dateTo !== "" && this.state.price !== "" && this.state.tel !== "" && this.state.email !== ""
          && this.state.city !== "" && this.state.street !== "" && this.state.house !== "" && this.state.typeOfPet !== "") {
          this.setState({ isButtonDisabled : false })
        }
  
        else {
          this.setState({ isButtonDisabled : true })
        }
    })
  }


  // При SUBMIT-е , при отправке формы, то есть при создании новой заявки -  будет создаваться новая запись в таблице базы данных 
  handleSubmit = (e) => {

    e.preventDefault()
    // Здесь мы должны проверить - а что пользователь хочет сделать - СОЗДАТЬ НОВУЮ заявку, или же РЕДАКТИРОВАТЬ существующую? 
    // Как это понять?   По параметрам из URL.  Если они есть, значит, пользователь хочет РЕДАКТИРОВАТЬ существующую заявку.
    // Если их нет - значит, пользователь хочет СОЗДАТЬ новую заявку 
    if(!this.props.match.params.id) {
      // e.preventDefault()

      // Будет post-запрос на сервер с целью создания в базе данных новой записи 
  
      // Смотрим на заголовок нашей формы - Клиент или Исполнитель. В зависимости от этого сохраняем в одну из таблиц
      const info = {
       
        activeControl: this.state.activeControl,
  
        dateFrom: this.state.dateFrom,
    
        dateTo: this.state.dateTo,
    
        price: this.state.price,
    
        tel: this.state.tel,
    
        email: this.state.email,
    
        city: this.state.city,
    
        street: this.state.street,
    
        house: this.state.house,
    
        typeOfPet: this.state.typeOfPet,
    
        notes: this.state.notes
      }
  

      fetch('http://localhost:3005/newRequest', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          "Authorization" : localStorage.getItem("token")
        },
        body: JSON.stringify(info)
      })
      .then( responseBody => responseBody.json() )
      .then( jsObj => {

        // Делаем все инпуты пустыми
        this.setState( {

          // Поля формы слева:
          fio: "",

          dateFrom: "",

          dateTo: "",

          price: "",

          tel: "",

          email: "",

          city: "",

          street: "",

          house: "",

          typeOfPet: "",

          notes: "",

        } )
        
        swal("Заявка успешно создана!");

        console.log(`Успешно создали НОВУЮ заявку в базе данных в таблице `) 

      })
  
    }



    // В случае, если юзер хочет ОТРЕДАКТИРОВАТЬ уже существующую заявку, делаем PUT запрос по id 
    else {

      // let activeControlCopy = this.state.activeControl
      // Нужно знать таблицу (clients или workers, а также - знать id-шник конкретной заявки)
      // Название таблицы можно взять из стейта

      const info = {
        
        activeControl: this.state.activeControl,

        dateFrom: this.state.dateFrom,
    
        dateTo: this.state.dateTo,
    
        price: this.state.price,
    
        tel: this.state.tel,
    
        email: this.state.email,
    
        city: this.state.city,
    
        street: this.state.street,
    
        house: this.state.house,
    
        typeOfPet: this.state.typeOfPet,
    
        notes: this.state.notes
      }

      fetch(`http://localhost:3005/changeRequest/${this.props.match.params.id}`, {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json',
          "Authorization" : localStorage.getItem("token")
        },
        body: JSON.stringify(info)
      })
      .then( responseBody => responseBody.json() )
      .then( jsArr => {
        console.log("С сервера к нам пришли данные - данные о том, какие поля мы обновили", jsArr)

        swal("Заявка успешно обновлена!");
      })
    }


  }


  // Кнопка - Вернуться назад
  handleClickButtonGoToBack = ()=> {
    this.props.history.push("/allapplications")
  }



  render() {

    console.log(this.state.dateTo)
    return(

      <div className="mainpage">

        <div className="wrapper-for-buttons">
          <button className={ this.state.activeControl ===  "clients" ? "control-button active-button" : "control-button"} onClick={this.clickHandler} name="clients">Клиент</button>
          <button className={ this.state.activeControl ===  "workers" ? "control-button active-button" : "control-button"} onClick={this.clickHandler}  name="workers">Исполнитель</button>
        </div>
        

        <div className="wrapper-for-two-forms">

          <form className="left-form" onSubmit={this.handleSubmit}>

            <input disabled={this.state.isDisabledFio} value={this.state.fio} name="fio" placeholder="Имя Фамилия" onChange={this.handleChange}/>

            <div className="wrapper-for-dates">
              <span>С&nbsp;&nbsp;</span>
              <input value={this.state.dateFrom} name="dateFrom" type="date" onChange={this.handleChange}/>&nbsp;&nbsp;
              <span>По&nbsp;&nbsp;</span>
              <input value={this.state.dateTo} name="dateTo" type="date" onChange={this.handleChange}/>
            </div>

            <input value={this.state.price} name="price" type="number" placeholder="Цена за услугу (в рублях)" onChange={this.handleChange}/>

            <br/>

            <input value={this.state.tel} name="tel"  type="number" placeholder="Телефон" onChange={this.handleChange}/>
            <br/>

            <input value={this.state.email} name="email"  type="email" placeholder="Электронная почта" onChange={this.handleChange}/>

            <br/>

            <input value={this.state.city}  name="city" placeholder="Город" onChange={this.handleChange}/>

            <br/>

            <input value={this.state.street} name="street" placeholder="Улица" onChange={this.handleChange}/>


            <br/>

            <input value={this.state.house} name="house" placeholder="Дом" onChange={this.handleChange}/>


            <br/>

            <select value={this.state.typeOfPet} name="typeOfPet" className="select" onChange={this.handleChange}>
              <option>Вид животного</option>
              <option>Кошку</option>
              <option>Собаку</option>
              <option>Птицу</option>
              <option>Рептилию</option>
              <option>Водоплавающее</option>
              <option>Насекомое</option>
            </select>

            <br/>

            <textarea value={this.state.notes} name="notes" className="textarea" placeholder="Особые примечания" onChange={this.handleChange}/>
            <br/>

            { !this.state.canShowButtonSaveChanges ? (
              <button disabled={this.state.isButtonDisabled} className={this.state.isButtonDisabled ? "submit-button button-disabled" : "submit-button"} >Создать заявку </button>

            ) : (
              <button disabled={this.state.isButtonDisabled} className={this.state.isButtonDisabled ? "submit-button button-disabled" : "submit-button"} >Сохранить изменения </button>

            ) }



          </form>



        </div>

        <button onClick={this.handleClickButtonGoToBack} className="button-go-to-back">Вернуться назад</button>
      </div>

    )

  }

}
