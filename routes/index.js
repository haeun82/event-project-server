const express = require('express');
const { client } = require('../database');
const db = client.db('base');

const router = express.Router();

router.get('/', (req, res) => {
  // res.render('main');
  if (req.user) {
    res.json({
      flag: true,
      username: req.user.username
    });
  } else {
    res.json({
      flag: false
    })
  }
});

router.post('/', (req, res) => {
  // if (req.user) {
  //   res.json({
  //     flag: true,
  //   });
  // } else {
  //   res.json({
  //     flag: false
  //   })
  // }
});

router.get('/list', async (req, res) => {
  try {
    const lists = await db.collection('list').find({}).toArray();
    res.send(lists);
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;

