const express = require('express')
const userHandler = require('../router_handler/friend')

const router = express.Router()

// 更新用户的基本信息
router.post('/search', userHandler.search)

module.exports = router