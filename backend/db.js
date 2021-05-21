// Описано подключение к базе данных 

// Для подключения SQL к серверу используют npm-пакет mysql,  установив его как зависимость  - командой    npm i mysql



// Перед тем , как создавать mySQL-сервер, нужно было пофиксить ошибку -> для этого  в терминале я прописал:

// ALTER USER "root"@"localhost" IDENTIFIED WITH mysql_native_password BY "2584955rb";

// а затем -

// flush privileges;


// Импортирую возможность СОЗДАТЬ mySQL-сервер
const mysql = require('mysql');

// Описываю ПАРАМЕТРЫ ПОДКЛЮЧЕНИЯ
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '2584955rb',
  database: 'petsafe'
});
// ----------------------------------------- Теперь мы можем (если нужно) прямо из этого файла   отправлять запросы в базу данных

//        Но  правильнее - делать это из файла server.js (В файле server.js мы должны подключить базу данных командой require, а затем прописать логику при CRUD - запросах со стороны
// фронтенда  )
// Устанавливаю соединение
connection.connect((err) => {
  if (!err) { 
    console.log("Успешно");
  }

  else {
    console.log("Ошибка подключения", err);

  }
});


module.exports = connection;
