const { Router } = require('express')
const router = new Router()
const { getPesonalChat, getUserChats, deleteUserChat } = require('../functional/chat.functional')

router.use(require('../middleware/auth.middleware'))

router.get('/:user_id', getPesonalChat)
router.get('/all/:user_id', getUserChats)
router.delete('/:chat_id', deleteUserChat)

module.exports = router