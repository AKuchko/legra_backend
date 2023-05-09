const { Router } = require('express')
const router = new Router()
const { getPesonalChat, getUserChats } = require('../functional/chat.functional')

router.use(require('../middleware/auth.middleware'))

router.get('/:user_id', getPesonalChat)
router.get('/all/:user_id', getUserChats)

module.exports = router