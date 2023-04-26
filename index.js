const app = require('./app')
const http = require('http')
const server = http.createServer(app)
const io = require('./socket')(server)

app.use('/api/users', require('./routes/users.router'))
app.use('/api/posts', require('./routes/posts.router'))
app.use('/api/auth', require('./routes/auth.router'))
app.use('/api/comment', require('./routes/comment.router'))

io.on('connection', (socket) => {
  console.log('connection: ' + socket.id)
  // require('./socket/handlers/comment.handler')(io, socket)
  // registerMessageHandler(io, socket)
  // registerCommentHandler(io, socket)
})

server.listen(app.get('port'), () => {
  console.log(`Legram app listening on port ${app.get('port')}`)
})
