const express   = require('express')
const morgan    = require('morgan')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app       = express()
const port      = 3000
const corsOptions = {
  credentials: true,
  origin:
  process.env.NODE_ENV === "production"
    ? process.env.CLIENT_URL
    : "http://localhost:8080",
}

app.set('port', port)

app.use(cookieParser())
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use('/users', require('./routes/users.router'))
app.use('/posts', require('./routes/posts.router'))
app.use('/api/auth', require('./routes/auth.router'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})