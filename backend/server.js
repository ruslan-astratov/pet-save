const express = require('express');
const app = express();

var cors = require("cors")

const bodyParser = require ('body-parser')

// Подключаю возможность обращаться к базе данных
const db = require("./db.js")

app.use(cors())

// Получаем тело POST и PUT запросов и преобразовываем их В JSON
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));



// После установки библиотеки , могу её здесь подключить
const bcrypt = require('bcrypt');




// -------------------------------------------------------  РЕГИСТРАЦИЯ. Добавляем запись в базу данных
app.post('/register', (req, res) => {
  let { name, surname, login, password } = req.body;

  // // на основе случайного числа  генерируется соль.
  let salt = bcrypt.genSaltSync(10);

  // // // на основе соли и пароля, которую необходимо зашифровать, генерирует хэш
  let hash = bcrypt.hashSync(req.body.password, salt);

  // В "Базу данных" сохраняем логин (пришедший от юзера), соль (сгенерированную сейчас , в момент получения POST запроса) и хэш (сгенерированный сейчас, в момент получения POST запроса)



  db.query(`
    INSERT INTO users
      (login, salt, hash, name, surname, token)
    VALUES
      ('${req.body.login}', '${salt}', '${hash}', '${name}', '${surname}', '');`, (err, data)=> {

    if(err) {
      res.status(500).json({ message: "Ошибка при обращении к базе данных. Ошибка при создании новой записи в таблице users", err })
      return
    }

    // И при регистрации будем так же делать АВТОРИЗАЦИЮ
    exchangeLogin(login, password, function(err, token) {

      if(err) {
        res.status(500).json({message: err.message})
  
        return
      }
  
      else {
        res.json(token)
      }
  
    }) 
  })

});
// ----------------------------------------------------//   РЕГИСТРАЦИЯ . Добавляем запись в базу данных




// ------------------------------------- АВТОРИЗАЦИЯ.  Пользователь, уже имея аккаунт,  хочет ВОЙТИ в приложение   ->   и нажимает на кнопку ВОЙТИ 
app.post("/login", (req, res) => {

  let { login, password } = req.body;

  exchangeLogin(login, password, function(err, token) {

    if(err) {
      res.status(500).json({message: err.message})

      return
    }

    else {
      res.json(token)
    }

  }) 

})


// Функция, которая делает запрос к БАЗЕ данных и находит пользователя по его ЛОГИНУ. Находит пользователя, создаёт дял него новый ТОКЕН (перезаписывая старый, если он был)
// и наружу ВОЗВРАЩАЕТ  ТОКЕН 
function exchangeLogin(login, password, cb) {
      // Ищем ПОЛЬЗОВАТЕЛЯ    в БАЗЕ ДАННЫХ 
      let userInBase;

      db.query(`
        SELECT * FROM users
        WHERE login = '${login}';
      `, (err, data2)=> {
  
        // Если всё плохо, выкидываем ошибку
        if(err) {
          cb(new Error("Не смогли подключиться к базе!"))  
          return
        }
  
        // JS объект
        userInBase = data2[0]
  
        console.log( "Наш JSON объект с ответом - из базы данных",  data2[0])
  
  
          //  Если не нашли юзера, отправляем на клиент ошибку 
          if (!userInBase) {
            cb(new Error("Не смогли найти пользователя!"))  
            return
          } 
        
          // Если нашли юзера всё круто, делаем ХЭШ И ТОКЕН
          let hash2 = bcrypt.hashSync(password, userInBase.salt);
        
          // У одного пользователя не должно храниться несколько токенов. На случай, если для этого пользователя уже существует токен, удаляем его.
          if (userInBase.hash === hash2) {
        
            let newToken = getRandomString();
        
            db.query(`
              UPDATE users
              SET token = "${newToken}"
              WHERE id = ${userInBase.id};
              `, (err)=> {

                if(err) {
                  cb(err)
                  return
                }
                else {
                  cb(null, { login: login, token: newToken });
                }

            })
        
 
            // //     // То есть сейчас мы на фронтенд должны получить корректный ТОКЕН, который должны будем вставлять в тело CRUD запросов
            // {
            //    "login": "Руслан",
            //    "token":  "вва34ававава"
            // }
        
          } else {
            cb(new Error("Не смогли найти юзера!"))  
          }
      })
}



// Для выпуска токена можно использовать любую функцию генерации рандомной строки:
function getRandomString() {
  let resString = '';
  let letters = ['a', 'b', 'c', 'd', 'e', 'f', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let length = 200;
  for (let i = 0; i < length; i++){
    resString += letters[Math.floor(Math.random() * (letters.length - 1))];
  }
  return resString;
}
// ------------------------------------- // АВТОРИЗАЦИЯ.  Пользователь хочет ВОЙТИ в приложение и нажимает на кнопку ВОЙТИ 




// ПРОМЕЖУТОЧНЫЙ ОБРАБОТЧИК  authMiddleware ДЛЯ АВТОРИЗАЦИИ. ФУНКЦИЯ позволяющая проверить - АВТОРИЗОВАН ли ПОЛЬЗОВАТЕЛЬ.  Имеет ли пользователь право - получить данные по запросу
function authMiddleware(req, res, next) {

  //  Получаю токен из ЗАГОЛОВКА  запроса , сохраняя в переменную
  const token = req.get("Authorization")

  // Если токена нет
  if(!token) {
    res.status(401).json({ message: "Какие-то проблемы с токеном" })
    return
  }

  db.query(`
    SELECT * FROM users
    WHERE token = "${token}";
    `, (err, data)=> {

    if(err || !data || data.length === 0) {
      res.status(401).json({ message: "При запросе к базе данных не нашли пользователя по токену" })
      return
    }

    const user = data[0]

    // Создаём новое свойство у объекта ЗАПРОСА.  В это свойство помещаем юзера, которого мы нашли 
    req.user = user

    // console.log("Промежуточный оработчик успешно отработал. Сейчас будет выполняться код", req.user)
    next()

  })

}
//   //ПРОМЕЖУТОЧНЫЙ ОБРАБОТЧИК  authMiddleware ДЛЯ АВТОРИЗАЦИИ. ФУНКЦИЯ позволяющая проверить - АВТОРИЗОВАН ли ПОЛЬЗОВАТЕЛЬ.  Имеет ли пользователь право - получить данные по запросу









// ------------------------------------------------------------- СТРАНИЦА со всеми заявками  ---------------------------------------------------------------

// ---------------- GET запрос.  Запрашиваем у базы данных вообще ВСЕ заявки, оформленные МНОЙ (от лица КЛИЕНТА, и от лица ИСПОЛНИТЕЛЯ)

app.get("/allapplications", authMiddleware,  (req, res)=> {

  let userName = req.user.name

  let userSurname = req.user.surname

  let dataToFrontend = [] 

  // В зависимости от значения   activeControl  делаем запись в ту или иную таблицу   (в таблицу клиентов или таблицу исполнителей)
  db.query(`
    SELECT * FROM clients
    WHERE userID = ${req.user.id};
    `, 

    (err, data1)=> {

      if(err) {
        res.status(500).json({ message: `Ошибка при обращении к базе данных. Ошибка при создании новой записи в таблице ${activeControl}`, err })
        return
      }

      console.log("Мы получаем все заявки, которые мы оформляли как КЛИЕНТ", data1)
      
      // res.json(data)
      dataToFrontend.push(data1)



      db.query(`
        SELECT * FROM workers
        WHERE userID = ${req.user.id};
      `, 
  
      (err, data2)=> {
  
        if(err) {
          res.status(500).json({ message: `Ошибка при обращении к базе данных. Ошибка при создании новой записи в таблице ${activeControl}`, err })
          return
        }
  
        dataToFrontend.push(data2)


        dataToFrontend.push(userName)

        dataToFrontend.push(userSurname)




        console.log("Здесь все наши заявки  dataToFrontend", dataToFrontend)
        
        res.json(dataToFrontend)
  
    })

  })
})
// ---------------- GET запрос.  Запрашиваем у базы данных ВСЕ заявки, оформленные мной (от лица КЛИЕНТА, и от лица ИСПОЛНИТЕЛЯ)




// ----------------------- Когда я хочу ИЗМЕНИТЬ свою заявку и кликаю по кнопке РЕДАКТИРОВАТЬ. GET запрос за одной конкретной заявкой (Клиент или исполнитель)
app.get("/changedApplication/:id", authMiddleware, (req, res)=> {

  let userName = req.user.name

  let userSurname = req.user.surname


  let id = req.params.id

  console.log("Наш параметр id из строки запроса -> ", id)
  

  // Получаю query-строку , которая идёт после параметров   mainpage/19?type=clients
  let type = req.query.type

  console.log("Наш тип - clients или workers  из строки запроса -> ", type)


  db.query(`
  SELECT * FROM ${type}
  WHERE id = ${id};
`, 

  (err, data)=> {

    if(err) {
      res.status(500).json({ message: `Ошибка при обращении к базе данных. Ошибка при создании новой записи в таблице ${activeControl}`, err })
      return
    }

    res.json([data[0], type, userName, userSurname])

  })



})
// -------------------- //  Когда я хочу ИЗМЕНИТЬ свою заявку и кликаю по кнопке РЕДАКТИРОВАТЬ. GET запрос за одной конкретной заявкой (Клиент или исполнитель)






// ----------------------------------------------- Когда я хочу УДАЛИТЬ одну какую-либо заявку ----------------------------------------------------------
app.delete("/deleteApplication/:id", authMiddleware,  (req, res)=> {


  // Здесь мы должны извлечь id из параметров 
  let id = req.params.id

  // Здесь извлекаем  из query-строки название таблицы,  в которой мы хотим удалить заявку 
  let type = req.query.type

  console.log("Наш тип - clients или workers  из строки запроса -> ", type)

  db.query(`
  DELETE FROM ${type}
  WHERE id = ${parseInt(id)};
  `, 

  (err, data)=> {

    if(err) {
      res.status(500).json({ message: `Ошибка при обращении к базе данных. Ошибка при создании новой записи в таблице ${activeControl}`, err })
      return
    }

    // После того, как успешно удалили эту запись - мы должны сделать запрос в БД за всеми заявками и вернуть 
    // res.json([data[0], type, userName, userSurname])
    let dataToFrontend = [] 

    // В зависимости от значения   activeControl  делаем запись в ту или иную таблицу   (в таблицу клиентов или таблицу исполнителей)
    db.query(`
      SELECT * FROM clients
      WHERE userID = ${req.user.id};
      `, 
  
      (err, data1)=> {
  
        if(err) {
          res.status(500).json({ message: `Ошибка при обращении к базе данных. Ошибка при создании новой записи в таблице ${activeControl}`, err })
          return
        }
  
        console.log("Мы получаем все заявки, которые мы оформляли как КЛИЕНТ", data1)
        
        // res.json(data)
        dataToFrontend.push(data1)
  
  
  
        db.query(`
          SELECT * FROM workers
          WHERE userID = ${req.user.id};
        `, 
    
        (err, data2)=> {
    
          if(err) {
            res.status(500).json({ message: `Ошибка при обращении к базе данных. Ошибка при создании новой записи в таблице ${activeControl}`, err })
            return
          }
    
          dataToFrontend.push(data2)
  
          console.log("Здесь все наши заявки  dataToFrontend", dataToFrontend)
          
          res.json(dataToFrontend)
    
      })
  
    })

  })


})
// ---------------------------------------------// Когда я хочу УДАЛИТЬ какую-либо заявку ----------------------------------------------------------















// -------------------------------------- Страница  LookPotentialClientsOrPerformers с моей заявкой и списком КЛИЕНТОВ/ИСПОЛНИТЕЛЕЙ ------------------------------------
app.get("/mathesClientsOrWorkers/:id", authMiddleware,  (req, res)=> {

  // Получаю  Имя Фамилию    - меня, как пользователя
  let userName = req.user.name

  let userSurname = req.user.surname



  // Здесь мы должны извлечь id из параметров 
  let id = req.params.id

  // В переменной nameSearchedTable будет лежать название таблицы, в которой буду искать ПОДХОДЯЩИХ   КЛИЕНТОВ / ИСПОЛНИТЕЛЕЙ 
  let nameSearchedTable = req.query.type

  // В переменной nameTableOfMyApplication будет название таблицы, из которой  получу данные по МОЕЙ заявке
  let nameTableOfMyApplication = nameSearchedTable === "workers" ? "clients" : "workers"

  let arrayDataForFrontend = []

  // Ищем в базе данных, в таблице - данные по нашей заявке 
  db.query(`
    SELECT * FROM ${nameTableOfMyApplication}
    WHERE id = ${parseInt(id)};
  `, 

  (err, data1)=> {

    if(err) {
      res.status(500).json({ message: `Ошибка при обращении к базе данных. Не могу получить данные по пользовательской заявке`, err })
      return
    }

    console.log("Объект - данные по нашей заявке", data1[0])
    // Данные по найденной заявке добавляем в массив arrayDataForFrontend
    arrayDataForFrontend.push(data1[0])

    
    db.query(`
      SELECT * FROM ${nameSearchedTable}
      WHERE city = "${data1[0].city}" AND typeOfPet = "${data1[0].typeOfPet}";
      `, 

      (err, data2)=> {

        if(err) {
          res.status(500).json({ message: `Ошибка при обращении к базе данных. Не могу получить данные по подходящим КЛИЕНТАМ/ИСПОЛНИТЕЛЯМ`, err })
          return
        }
        // Данные по подходящим КЛИЕНТАМ/ИСПОЛНИТЕЛЯМ добавляем в массив arrayDataForFrontend. В data2 - лежит МАССИВ с объектами
        arrayDataForFrontend.push(data2)

        // Пушим мои Имя Фамилию (как зарегистрированного пользователя)
        arrayDataForFrontend.push(userName, userSurname)

        // Возвращаем на фронтенд данные. Если мы не СМОЖЕМ найти подходящих КЛИЕНТОВ / ИСПОЛНИТЕЛЕЙ, мы вернём пустой массив
        res.json(arrayDataForFrontend)
        // То есть вторым элементом в массиве arrayDataForFrontend будет   []
    })
  })
})
// ------------------------------------//  Страница LookPotentialClientsOrPerformers с моей заявкой и списком КЛИЕНТОВ/ИСПОЛНИТЕЛЕЙ ------------------------------------







// -------------------------------------    Страница с данными по конкретному выбранному нами КЛИЕНТУ или ИСПОЛНИТЕЛЮ ------------------------------------
app.get("/dataOfConcreteClientOrWorker/:id", authMiddleware,  (req, res)=> {

  // Здесь мы должны извлечь id из параметров 
  let id = req.params.id

  // В переменной nameSearchedTable будет лежать название таблицы, в которой буду искать КЛИЕНТА/ИСПОЛНИТЕЛЯ
  let nameSearchedTable = req.query.type

  db.query(`
  SELECT * FROM ${nameSearchedTable}
  WHERE id = ${parseInt(id)};
  `, 

  (err, data2)=> {

    if(err) {
      res.status(500).json({ message: `Ошибка при обращении к базе данных. Не могу получить данные по конкретному КЛИЕНТУ/ИСПОЛНИТЕЛЮ`, err })
      return
    }

    console.log("Данные по одному конкретному КЛИЕНТУ/ИСПОЛНИТЕЛЮ", data2[0])
    // Возвращаем на фронтенд данные. Если мы не СМОЖЕМ найти подходящего КЛИЕНТА/ ИСПОЛНИТЕЛЯ, мы вернём пустой массив
    res.json(data2[0])
  })

})



// Когда нажимаю на кнопку "Предложить услуги"

app.put("/sendOffer/:id", authMiddleware,  (req, res)=> {

  // Получаю  Имя Фамилию 
  let userName = req.user.name

  let userSurname = req.user.surname

  let nameSurname = `${userName} ${userSurname}`

  // Здесь мы должны извлечь id из параметров 
  let id = req.params.id

  // В переменной nameSearchedTable будет лежать название таблицы, в которой буду искать КЛИЕНТА/ИСПОЛНИТЕЛЯ
  let nameSearchedTable = req.query.type

  db.query(`
    UPDATE ${nameSearchedTable}
    SET offer = '${req.body.offer}', nameSurnameWhoSendOffer = '${nameSurname}', isAgree = 'да'
    WHERE id = ${parseInt(id)};
  `, 

  (err, data2)=> {

    if(err) {
      res.status(500).json({ message: `Ошибка при обращении к базе данных. Не могу получить данные по конкретному КЛИЕНТУ/ИСПОЛНИТЕЛЮ`, err })
      return
    }

    console.log("Обновлённые данные по одному конкретному КЛИЕНТУ/ИСПОЛНИТЕЛЮ - добавили запись о том, что у КЛИЕНТА/ИСПОЛНИТЕЛЯ появилось предложение", data2[0])
    // Возвращаем на фронтенд данные. Если мы не СМОЖЕМ найти подходящего КЛИЕНТА/ ИСПОЛНИТЕЛЯ, мы вернём пустой массив
    res.json(data2)
  })

})

// ------------------------------------//   Страница с данными по конкретному выбранному нами КЛИЕНТУ или ИСПОЛНИТЕЛЮ ------------------------------------


















// --------------------   Перед тем как попасть на страницу с ФОРМОЙ  и    СОЗДАТЬ новую заявку (при переходе на страницу с ФОРМОЙ заявки) и хочу получить Имя Фамилия, чтобы отобразить в инпуте 
app.get("/newApplication", authMiddleware, (req, res)=> {

  // Получаю  Имя Фамилию 
  let userName = req.user.name

  let userSurname = req.user.surname

  res.json( {userName, userSurname} )

})
//  //------------------  Перед тем как попасть на страницу с ФОРМОЙ  и    СОЗДАТЬ новую заявку (при переходе на страницу с ФОРМОЙ заявки) и хочу получить Имя Фамилия, чтобы отобразить в инпуте












// -------------------------------------------- СТРАНИЦА с ФОРМОЙ СОЗДАНИЯ/РЕДАКТИРОВАНИЯ заявки    --------------------------------------------------------------------------

// ---------------------------------------- Создание НОВОЙ заявки в БАЗЕ ДАННЫХ,   в ФОРМЕ КЛИЕНТЫ или ИСПОЛНИТЕЛИ
app.post("/newRequest", authMiddleware,  (req, res)=> {

  // Получаю  Имя Фамилию 
  let userName = req.user.name

  let userSurname = req.user.surname

  console.log( "Выведем Имя Фамилию", userName, userSurname )


  let { activeControl, dateFrom, dateTo, price, tel, email, city, street, house, typeOfPet, notes } = req.body;

  // В зависимости от значения   activeControl  делаем запись в ту или иную таблицу   (в таблицу клиентов или таблицу исполнителей)
  db.query(`
  INSERT INTO ${activeControl}
    (userID, dateFrom, dateTo, price, tel, email, city, street, house, typeOfPet, notes, nameSurname, offer, isAgree)
  VALUES
    ('${req.user.id}', '${dateFrom}', '${dateTo}', '${price}', '${tel}', '${email}', '${city}', '${street}', '${house}', '${typeOfPet}', '${notes}', '${userName} ${userSurname}', 'нет', 'нет' );`, 

    (err, data)=> {

    if(err) {
      res.status(500).json({ message: `Ошибка при обращении к базе данных. Ошибка при создании новой записи в таблице ${activeControl}`, err })
      return
    }

    res.json(data)

  })

})
// ---------------------------------------- Создание НОВОЙ заявки в БАЗЕ ДАННЫХ,   в ФОРМЕ КЛИЕНТЫ или ИСПОЛНИТЕЛИ




// ---------------------------------------- РЕДАКТИРОВАНИЕ СУЩЕСТВУЮЩЕЙ  заявки в БАЗЕ ДАННЫХ,   в ФОРМЕ КЛИЕНТЫ / ИСПОЛНИТЕЛИ
app.put("/changeRequest/:id", authMiddleware,  (req, res)=> {

  // Получаю  Имя Фамилию 
  let userName = req.user.name

  let userSurname = req.user.surname

  // // Извлекаем id
  let id = req.params.id

  console.log("Смотрим на айдишник id, который мы извлекли из params", typeof id)

  // // Извлекаем данные, которые будем менять 
  let { activeControl, dateFrom, dateTo, price, tel, email, city, street, house, typeOfPet, notes } = req.body;

  // console.log("Смотрим на данные, КОТОРЫМИ будем ОБНОВЛЯТЬ  строку в таблице", activeControl, dateFrom, dateTo, price, tel, email, city, street, house, typeOfPet, notes )

  let previousActiveControl = activeControl === "clients" ? "workers" : "clients"

  // Нужно удалить запись из предыдущей таблицы
  db.query(`
  DELETE FROM ${previousActiveControl}
  WHERE id = ${parseInt(id)};
  `, 

  (err, data)=> {

  if(err) {
    res.status(500).json({ message: `Ошибка при обращении к базе данных. Ошибка при редактировании существующей записи в таблице ${activeControl}`, err })
    return
  }



  db.query(`

    INSERT INTO ${activeControl}
      (userID, dateFrom, dateTo, price, tel, email, city, street, house, typeOfPet, notes, nameSurname, offer, isAgree)
    VALUES
      ('${req.user.id}', '${dateFrom}', '${dateTo}', '${price}', '${tel}', '${email}', '${city}', '${street}', '${house}', '${typeOfPet}', '${notes}', '${userName} ${userSurname}', 'нет', 'нет' );`, 


    (err, data)=> {

    if(err) {
      res.status(500).json({ message: `Ошибка при обращении к базе данных. Ошибка при редактировании существующей записи в таблице ${activeControl}`, err })
      return
    }

    console.log("Успешно ОБНОВИЛИ существующую заявку")
    res.json(data)
  })

})


})
// --------------------------------------// РЕДАКТИРОВАНИЕ СУЩЕСТВУЮЩЕЙ  заявки в БАЗЕ ДАННЫХ,   в ФОРМЕ КЛИЕНТЫ или ИСПОЛНИТЕЛИ












app.listen(3005, function () {
  console.log('Сервер запущен на порте 3005');
});

// Чтобы запустить сервер , нужно в терминале прописать команду node server.js
