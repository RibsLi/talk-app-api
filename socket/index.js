const ws = require('ws')
const server = new ws.Server({ port: 3100 })

module.exports = () => {
  server.on('connection', e => {
    console.log('connection',);
    e.on('message', data => {
      console.log('message', data.toString());
      e.send(data.toString())
    })
  })
  
  server.on('open', () => {
    console.log('open');
  })
  
  server.on('close', () => {
    console.log('close');
  })
  
  server.on('error', () => {
    console.log('error');
  })
}