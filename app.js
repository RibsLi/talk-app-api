const express = require('express')
const cors = require('cors')
const joi = require('joi')
const { expressjwt } = require("express-jwt") // 解析 token 的中间件
const config = require('./config')
const userRouter = require('./router/user')
const friendRouter = require('./router/friend')
const socket = require('./socket')
const app = express()
socket()

// cors 中间件解决跨域问题
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// 处理响应数据的中间件
app.use((req, res, next) => {
  // code = 0 为成功； code = 1 为失败； 默认将 code 的值设置为 1，方便处理失败的情况
  res.cc = (err, code = 1) => {
    res.send({
      // 状态
      code,
      // 状态描述，判断 err 是 错误对象 还是 字符串
      message: err instanceof Error ? err.message : err,
    })
  }
  next()
})

app.use(expressjwt({ secret: config.jwtSecretKey, algorithms: ['HS256'] }).unless({ path: ['/api/register', '/api/login'] }))

app.use('/api', [userRouter, friendRouter])

// 错误级别中间件
app.use((err, req, res, next) => {
  if (err instanceof joi.ValidationError) return res.cc(err)
  // 捕获身份认证失败的错误
  if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
  // 未知错误
  res.cc(err)
})
app.listen(3000, function () {
  console.info('api server running at http://127.0.0.1:3000')
})