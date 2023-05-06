const { Router } = require('express')
const multer = require('multer')
const router = new Router()
const upload = multer()
const chatMiddleware = require('../middleware/chat.middleware')
const { getChatMessages, createNewMessage, deleteUserMessage, editMessage } = require('../functional/message.functional')

router.use(require('../middleware/auth.middleware'))

router.get('/:chat_id', chatMiddleware, getChatMessages)
router.post('/create', upload.fields([ { name: 'media', maxCount: 10 }, { name: 'message', maxCount: 1 }, { name: 'chat_id', maxCount: 1 },{ name: 'reply_message_id', maxCount: 1 } ]), createNewMessage)
router.put('/edit', editMessage)
router.delete('/delete/:chat_id/:message_id', deleteUserMessage)

module.exports = router