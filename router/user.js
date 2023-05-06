const express = require('express')
// 1. 导入验证表单数据的中间件
const expressJoi = require('@escook/express-joi')
const userHandler = require('../router_handler/user')
// 2. 导入需要的验证规则对象
const { reg_login_schema, update_password_schema, update_avatar_schema } = require('../schema/user')

const router = express.Router()

// 注册新用户
// 在注册新用户的路由中，声明局部中间件，对当前请求中携带的数据进行验证
// 数据验证通过后，会把这次请求流转给后面的路由处理函数
// 数据验证失败后，终止后续代码的执行，并抛出一个全局的 Error 错误，进入全局错误级别中间件中进行处理
router.post('/register', expressJoi(reg_login_schema), userHandler.register)

// 登录
router.post('/login', expressJoi(reg_login_schema), userHandler.login)

// 获取用户信息
router.get('/getUserinfo', userHandler.getUserinfo)

// 更新用户的基本信息
router.post('/updateUserinfo', userHandler.updateUserinfo)

// 重置用户密码
router.post('/updatePassword', expressJoi(update_password_schema), userHandler.updatePassword)

// 更新用户头像
router.post('/updateAvatar', expressJoi(update_avatar_schema), userHandler.updateAvatar)

module.exports = router