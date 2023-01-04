const express = require('express');
const redis = require('../redis')
const router = express.Router();

const configs = require('../util/config')

let visits = 0

/* GET index data. */
router.get('/', async (req, res) => {
  visits++

  res.send({
    ...configs,
    visits
  });
});

router.get('/statistics', async (req, res) => {
    //await redis.setAsync("added_todos", 1)
    todos = await redis.getAsync("added_todos")
    todos = parseInt(todos)
    res.json({"added_todos": todos})
})

module.exports = router;
