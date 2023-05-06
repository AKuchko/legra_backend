const { Router }    = require('express')
const database      = require('../database/db.connect')
const router        = new Router()
const { getUser, getMe, deleteUserAccount, followUser, unfollowUser } = require('../functional/user.functional')

router.use(require('../middleware/auth.middleware'))

router.get('/id/:user_id', getUser)
router.get('/me', getMe)
router.post('/follow/', followUser)
router.delete('/:user_id', deleteUserAccount)
router.delete('/unfollow/:user_id', unfollowUser)

module.exports = router