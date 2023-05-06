const db = require('../database/index')

// 搜索朋友
exports.search = (req, res) => {
  const userinfo = req.body
  console.log(00000, userinfo);
  const sql = 'SELECT * FROM users_table WHERE username=? OR phone=?'
  db.query(sql, [userinfo.keywords, userinfo.keywords], (err, result) => {
    if (err) return res.cc(err)
    result.length && result.map(item => {
      delete item.password
      return item
    })
    res.send({
      code: 0,
      message: '搜索成功！',
      data: result
    })
  })
}
