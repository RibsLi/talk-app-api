const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken') // 生成 Token 字符串
const db = require('../database/index')
const config = require('../config')

// 注册用户
exports.register = (req, res) => {
  const userinfo = req.body
  // 判断表单数据是否合法
  if (!userinfo.username || !userinfo.password) return res.cc('用户名或密码不能为空！')

  // 判断 SQL 数据库中用户名是否被占用
  const sql1 = 'SELECT * FROM users_table WHERE username=?'
  db.query(sql1, userinfo.username, (err1, result1) => {
    // 执行 SQL 语句失败
    if (err1) return res.cc(err1)
    // 用户名被占用
    if (result1.length) return res.cc('用户名被占用，请更换其他用户名！')

    // 验证通过继续流程
    // 使用 bcryptjs 加密密码
    userinfo.password = bcrypt.hashSync(userinfo.password, 10)
    // 将用户数据插入到 SQL 数据库中
    const sql2 = 'INSERT INTO users_table SET ?'
    db.query(sql2, { username: userinfo.username, password: userinfo.password }, (err2, result2) => {
      // 执行 SQL 语句失败
      if (err2) return res.cc(err2)
      // SQL 语句执行成功，但影响行数不等于 1
      if (result2.affectedRows !== 1) return res.cc('注册用户失败，请稍后再试！')
      // 注册成功
      res.send({ code: 0, message: '注册成功！' })
    })
  })
}

// 登录
// 检测表单数据是否合法
// 根据用户名查询用户的数据
// 判断用户输入的密码是否正确
// 生成 JWT 的 Token 字符串
exports.login = (req, res) => {
  const userinfo = req.body
  const sql = 'SELECT * FROM users_table WHERE username=?'
  db.query(sql, userinfo.username, (err, result) => {
    if (err) return res.cc(err)
    if (!result.length) return res.cc('登录失败：用户不存在！')
    // 拿用户输入的密码，和数据库中存储的密码进行对比
    if(!bcrypt.compareSync(userinfo.password, result[0].password)) return res.cc('密码错误')
    
    // 剔除用户密码和头像
    delete result[0].password
    const userData = JSON.parse(JSON.stringify(result[0]))
    const { id, username } = result[0]
    // 将用户信息生成 Token 字符串
    const token = jwt.sign({ id, username }, config.jwtSecretKey, { expiresIn: '24h' })
    res.send({
      code: 0,
      message: '登录成功！',
      data: {...userData, token: `Bearer ${token}`},
      // 为了方便客户端使用 Token，在服务器端直接拼接上 Bearer 的前缀
      token: `Bearer ${token}`,
    })
  })
}

// 获取用户信息
exports.getUserinfo = (req, res) => {
  // const sql = 'SELECT id, username, nickname, email, avatar FROM users_table WHERE id=?'
  const sql = 'SELECT * FROM users_table WHERE id=?'
  // 注意：req 对象上的 user 属性，是 Token 解析成功，express-jwt 中间件帮我们挂载上去的
  db.query(sql, req.auth.id, (err, result) => {
    if (err) return res.cc(err)
    if (!result.length) return res.cc('获取用户信息失败！')
    delete result[0].password
    res.send({
      code: 0,
      message: '获取用户基本信息成功！',
      data: result[0]
    })
  })
}

// 更新用户信息
exports.updateUserinfo = (req, res) => {
  const sql = 'UPDATE users_table SET ? WHERE id=?'
  // 注意此处使用的 id 是 token 中的id，为了安全不应该前端传用户id
  console.log(req.body, req.auth);
  db.query(sql, [req.body, req.auth.id], (err, result) => {
    if (err) return res.cc(err)
    if (result.affectedRows !== 1) return res.cc('修改信息失败！')
    res.cc('修改信息成功！', 0)
  })
}

// 重置用户密码
exports.updatePassword = (req, res) => {
  // 根据 id 查询用户是否存在
  const sql1 = 'SELECT * FROM users_table WHERE id=?'
  db.query(sql1, req.auth.id, (err1, result1) => {
    if (err1) return res.cc(err1)
    // 检查指定 id 的用户是否存在
    if (!result1.length) return res.cc('用户不存在！')
    // 判断提交的 旧密码 是否正确
    // 即可使用 bcrypt.compareSync(提交的密码，数据库中的密码) 方法验证密码是否正确
    // compareSync() 函数的返回值为布尔值，true 表示密码正确，false 表示密码错误
    if (!bcrypt.compareSync(req.body.oldPassword, result1[0].password)) return res.cc('原密码错误！')
    
    const sql2 = 'UPDATE users_table SET password=? WHERE id=?'
    // 对新密码进行 bcrypt 加密之后，更新到数据库中
    const newPwd = bcrypt.hashSync(req.body.newPassword, 10)
    // 注意此处使用的 id 是 token 中的id，为了安全不应该前端传用户id
    db.query(sql2, [newPwd, req.auth.id], (err2, result2) => {
      if (err2) return res.cc(err2)
      if (result2.affectedRows !== 1) return res.cc('修改密码失败！')
      res.cc('修改密码成功！', 0)
    })
  })
}

// 更新用户头像
exports.updateAvatar = (req, res) => {
  // 根据 id 查询用户是否存在
  const sql1 = 'SELECT * FROM users_table WHERE id=?'
  db.query(sql1, req.auth.id, (err1, result1) => {
    if (err1) return res.cc(err1)
    // 检查指定 id 的用户是否存在
    if (!result1.length) return res.cc('用户不存在！')

    const sql2 = 'UPDATE users_table SET avatar=? WHERE id=?'
    // 注意此处使用的 id 是 token 中的id，为了安全不应该前端传用户id
    db.query(sql2, [req.body.avatar, req.auth.id], (err2, result2) => {
      if (err2) return res.cc(err2)
      if (result2.affectedRows !== 1) return res.cc('修改头像失败！')
      res.cc('修改头像成功！', 0)
    })
  })
}