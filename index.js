const express   = require('express')
const morgan    = require('morgan')
// const body_parser = require('body-parser')

const app       = express()
const port      = 3000

app.set('port', port)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use('/users', require('./routes/users.router'))
app.use('/posts', require('./routes/posts.router'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})