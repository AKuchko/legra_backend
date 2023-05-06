const app = require('./app')
const http = require('http')
const server = http.createServer(app)
const io = require('./socket')(server)

app.use('/api/users', require('./routes/users.router'))
app.use('/api/posts', require('./routes/posts.router'))
app.use('/api/auth', require('./routes/auth.router'))
// app.use('/api/comment', require('./routes/comment.router'))
// app.use('/api/chat', require('./routes/chat.router'))
app.use('/api/message', require('./routes/message.router'))

io.on('connection', (socket) => {
  console.log('connection: ' + socket.id)
})

server.listen(app.get('port'), () => {
  console.log(`Legram app listening on port ${app.get('port')}`)
})
