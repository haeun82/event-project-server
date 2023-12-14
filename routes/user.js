const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { client } = require('../database/index');
const { isNotLoggedIn, isLoggedIn, inputCheck } = require('../middlewares');
const { ObjectId } = require('mongodb');
const db = client.db('base');  // board 데이터베이스에 연결. 없으면 생성됨

const router = express.Router();

router.get('/register', (req, res) => {
  res.send('dd');
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const existUser = await db.collection('user').findOne({ username });
    if (existUser) {
      throw new Error('존재하는 사용자');
    }

    const hash = await bcrypt.hash(password, 12);
    await db.collection('user').insertOne({
      username,
      password : hash,
      email
    });
    res.json({
      flag: true,
      message: '회원 가입 성공'
    });
  } catch (err) {
    console.error(err);
    res.json({
      flag: false,
      message: err.message
    });
  }
});
// 로그인 로그아웃 라우터
router.get('/login', isNotLoggedIn, (req, res) => {
  // console.log(req.user);
  // res.render('login');
  // res.send('dsf');
  if (req.user) {
    res.json({
      flag: true,
    });
  } else {
    res.json({
      flag: false
    })
  }
});

// POST /user/login
router.post('/login', isNotLoggedIn, inputCheck, (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    // user: 성공 시 로그인한 사용자 정보
    // info: 실패 시 이유
    if (authError) {
      console.error(authError);
      return res.status(500).json(authError);
    }
    if (!user) return res.status(401).json(info.message);
    // res.send('sdfssdf');
    // login(): 사용자 정보를 세션에 저장하는 작업을 시작
    // passport.serializeUser가 호출됨
    // user 객체가 serializeUser로 넘어가게 됨(index.js)
    req.login(user, (loginError) => {
      if (loginError) {
        console.log(loginError);
        return next(loginError);
      }
      res.json({
        flag: true,
        message: 'login success',
        // id: req.user._id,
        // username: req.user.username
        user: req.user,
      });
      // res.redirect('/');  // 로그인 완료 시 실행할 코드, 동기식으로 보냈기 때문에 redirect, 비동기면 res.json보냄
    });
  })(req, res, next);
});

router.post('/loginCheck', async (req, res, next) => {
  const { id } = req.body;
  const result = await db.collection('sessions').findOne({ _id: id });
  // const info = JSON.parse(result.session).passport.user;
  // console.log(info);
  if (result) {
    res.json({
      user: req.user,
    })
  }
});

// GET /user/logout
// 우발적, 악의적 로그아웃을 방지하려면 GET 요청 대신 POST 또는 DELETE 요청 사용하면 좋음
router.post('/logout', (req, res, next) => {
  // logout: req.user 객체와 req.session 객체를 제거
  req.logout((logoutError) => {  // 두 객체 제거 후 콜백 함수가 실행됨
    if (logoutError) return next(logoutError);
    res.redirect('/');  // 로그아웃 완료 시 실행할 코드
  });
});


module.exports = router;