const { Router }    = require('express')
const router        = new Router()
const { registerUser, authorizeUser, refreshToken } = require('../functional/auth.functional')

router.post('/reg', registerUser)
router.post('/login', authorizeUser)
router.post('/refresh', refreshToken)

module.exports = router

