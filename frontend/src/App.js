import './App.css';

import React from "react"

import { Switch, Route } from 'react-router-dom';

import Registration from "./components/Registration/Registration"

import AllApplications from "./components/AllApplications/AllApplications"

import MainPage from "./components/MainPage/MainPage"

import LookPotentialClientsOrPerformers from "./components/LookPotentialClientsOrPerformers/LookPotentialClientsOrPerformers"

import ProfileClientOrWorker from "./components/ProfileClientOrWorker/ProfileClientOrWorker"








export default class App extends React.Component {


  // Здесь мы проверим - если у нас в LocalStorage имелся токен (то есть, если пользователь был авторизован ранее, мы позволим ему находиться на этой странице)
  // Если же пользователь перешёл по этой ссылке БЕЗ АВТОРИЗАЦИИ , не имея токена,  мы вышвырнем пользователя на главную страницу
  componentDidMount() {

    

  }

  render() {


    return (
      <div className="App">
        <Switch>
          {/*  страница  входа/регистрации*/}
          <Route exact path="/" component={Registration} />

          {/*  страница  со всеми МОИМИ  заявками  ( оформленными от лица КЛИЕНТА , и от лица ИСПОЛНИТЕЛЯ) */}
          <Route exact path="/allapplications" component={AllApplications} />

          {/*  страница где можно увидеть всех возможных ИСПОЛНИТЕЛЕЙ / КЛИЕНТОВ , подходящих под мою заявку */}
          <Route exact path="/LookPotentialClientsOrPerformers/:id" component={LookPotentialClientsOrPerformers} /> 



          {/*  страница - ПРОФИЛЬ  выбранного  нами   КЛИЕНТА  или ИСПОЛНИТЕЛЯ  */}
          <Route exact path="/ProfileClientOrWorker/:id" component={ProfileClientOrWorker} /> 



          {/*  страница с ФОРМОЙ.  Даёт возможность СОЗДАТЬ новую заявку  */}
          <Route exact path="/mainpage" component={MainPage} /> 

          {/* Когда хотим отредактировать одну , конкретную заявку  */}
          <Route path="/mainpage/:id" component={MainPage} /> 


        </Switch>
      </div>
    );
  }

}

