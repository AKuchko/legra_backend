const { Router }    = require('express')
// const bcrypt        = require('bcrypt')
// const jwt           = require('jsonwebtoken')
// const database      = require('../database/db.connect')
// const JWT_SECRET    = 'Asda5-weE4r-Tu0op-Cry5s'
const router        = new Router()
const { registerUser, authorizeUser, refreshToken } = require('../functional/auth.functional')

router.post('/reg', registerUser)
router.post('/login', authorizeUser)
router.post('/refresh', refreshToken)

module.exports = router

