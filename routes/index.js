const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require("express-session");
//const flash = require('connect-flash');

const mysql = require('mysql');

//const app = express();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(cookieParser('keyboard cat'));
router.use(session({secret: 'keyboard cat'}));
router.use(passport.initialize());
router.use(passport.session());

router.get('/', function(req, res, next) {
  res.render('home', { title: 'Express' });
});

const connection = mysql.createConnection( {
  host: '13.125.177.193',
  port: '3306',
  user: 'root',
  password: 'semonemo95',
  database: 'test'
});

connection.connect();

passport.serializeUser(function(user, done) {
  console.log("serializeUser ", user)
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log("deserializeUser id ", id);

  var userinfo = "";
  var sql = "SELECT * FROM web_user WHERE id=?";

  connection.query(sql , [id], function (err, result) {
    if(err) console.log('mysql 에러');

    console.log("deserializeUser mysql result : " , result);

    var json = JSON.stringify(result[0]);
    userinfo = JSON.parse(json);

    done(null, userinfo);
  })
});

router.get('/join', function(req, res, next) {
  res.render('join', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  var userId = "";

  if(req.cookies['loginId'] !== undefined){
    console.log(req.cookies['loginId']);

    userId = req.cookies['rememberId'];
  }
  res.render('login', {userId: userId});

  console.log("userId : " + userId);
});

passport.use('join', new LocalStrategy({
  usernameField: 'new_username',
  passwordField: 'new_password'
},
    function(new_username, new_password, done) {
      console.log('join');

      var sql1 = "SELECT * FROM web_user WHERE id=?";

      connection.query(sql1, [new_username], function (err, datas) {
        if(err) return done(err);

        if(datas.length) {
          console.log("이미 존재하는 유저입니다.");
          return done(null, false, { message: 'your email is already used'
          });
        } else {
          console.log("DB 회원가입 무결성 통과");

          var sql2 = "INSERT into web_user(id, pw) values(?,?)";

          connection.query(sql2, [new_username, new_password], function (err, datas) {
            if (err) console.log('join mysql 에러');
            return done(null, {
              'id': new_username,
              'pw': new_password
            })
          });
        }
      })
    }));

passport.use('login', new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password'
    },
    function(username, password, done) {
      console.log(username, password, done);

      var sql3 = "SELECT * FROM web_user WHERE id=? AND pw=?";
      connection.query(sql3 , [username, password], function (err, result) {
        if(err)
          console.log('mysql 에러');

        // 입력받은 ID와 비밀번호에 일치하는 회원정보가 없는 경우

        if(result.length === 0){
          console.log("결과 없음");

          return done(null, false, { message: 'Incorrect' });
        }
        else{
          console.log(result);

          var json = JSON.stringify(result[0]);
          var userinfo = JSON.parse(json);

          console.log(userinfo);

          console.log("userinfo " + userinfo.id);
          console.log("userinfo " + userinfo.pw);

          // 세션

          passport.session.user_id = userinfo.id;

          // 세션 끝

          return done(null, userinfo);  // result값으로 받아진 회원정보를 return해줌
        }
      })

    }
));

router.get('/home', function (req, res, next) {
  res.render('home', { title: 'Express' });
});

router.get('/home_afterlogin', function (req, res, next) {
  res.render('home_afterlogin', {user_id : passport.session.user_id});
});

router.get('/logout', function (req, res, next) {
  req.logout();

  res.redirect('/login');
});

router.post('/login',
    passport.authenticate('login', {
      successRedirect: '/home_afterlogin',
      failureRedirect: '/login_fail',
      failureFlash: false }),
);

router.post('/join',
    passport.authenticate('join', {
      successRedirect: '/home',
      failureRedirect: '/join_fail',
      failureFlash: false })
);

router.get('/login_fail', function(req, res, next) {
  res.render('login_fail', { title: 'Express' });
});

router.get('/data', function(req, res, next) {
  let data = {
    temp : this.temp1,
    humi : this.humidi1,
    dust : this.dust1,
    battery : this.battery1,
    latitude : this.latitude,
    longitude : this.longitude
  };

  connection.query("SELECT temp FROM test4 ORDER BY time desc limit 1;", function (err, temp) {
    if (err) throw err;

    if(temp.length > 0) {
      console.log(temp[0]);

      data.temp = temp[0].temp;
    }
  })

  connection.query("SELECT humi FROM test4 ORDER BY time desc limit 1;", function (err, humidi) {
    if (err) throw err;

    if(humidi.length > 0) {
      console.log(humidi[0]);

      data.humi = humidi[0].humi;
    }
  })

  connection.query("SELECT dust FROM test4 ORDER BY time desc limit 1;", function (err, dust) {
    if (err) throw err;

    if(dust.length > 0) {
      console.log(dust[0]);

      data.dust = dust[0].dust;
    }
  })

  connection.query("SELECT battery FROM test4 ORDER BY time desc limit 1;", function (err, battery) {
    if (err) throw err;

    if (battery.length > 0) {
      console.log(battery[0]);

      data.battery = battery[0].battery;
    }
  })

  connection.query("SELECT latitude FROM test4 ORDER BY time desc limit 1;", function (err, latitude) {
    if (err) throw err;

    if (latitude.length > 0) {
      console.log(latitude[0]);

      data.latitude = latitude[0].latitude;
    }
  })

  connection.query("SELECT longitude FROM test4 ORDER BY time desc limit 1;", function (err, longitude) {
    if (err) throw err;

    if (longitude.length > 0) {
      console.log(longitude[0]);

      data.longitude = longitude[0].longitude;
    }

    console.log(data);

    res.render('data', {
      user_id: passport.session.user_id,
      temp_1: data.temp,
      humidi_1: data.humi,
      dust_1: data.dust,
      battery_1: data.battery,
      latitude_1: data.latitude,
      longitude_1: data.longitude,
      test: "test_is_ok"});
  })
});

/*
router.post('/data', function(req, res, next) {

});
*/

router.get('/manage', function(req, res, next) {
  res.render('manage', {user_id : passport.session.user_id});
});

module.exports = router;