const express = require('express');
const { getAll, create, getOne, remove, update, verifyCode, login } = require('../controllers/user.controllers.js');
const userRouter = express.Router()

userRouter.route('/')
  .get(getAll)
  .post(create);

userRouter.route('/login')
  .post(login)  

userRouter.route('/verify/:code')
  .get(verifyCode);

userRouter.route('/:id')
  .get(getOne)
  .delete(remove)
  .put(update);

module.exports = userRouter;