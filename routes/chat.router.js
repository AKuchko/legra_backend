// const { Router }    = require('express')
// // const multer        = require('multer')

// // const database      = require('../database/db.connect')
// const router        = new Router()
// // const io            = require('../socket').getIo()
// // const upload        = multer()
// // const chatMiddleware = require('../middleware/chat.middleware')

// router.use(require('../middleware/auth.middleware'))

// // CHAT ROUTES
// // router.get('/:chat_id', async (req, res) => {})
// // router.post('/create', async (req, res) => {})
// // router.delete('/:chat_id', async (req, res) => {})
// // router.get('/privileges/:chat_id', async (req, res) => {
// //     try {
// //         const chat_member_query = 'SELECT role FROM chat_member WHERE chat_id = ? AND user_id = ?'
// //         const { user_id } = req.user
// //         const { chat_id } = req.params

// //         const [ user_role ] = await database.query(chat_member_query, [ chat_id, user_id ])

// //         if (!user_role) return res.status(404).json({ message: 'chat member not found' })

// //         res.status(200).json({ user_role: user_role.role })
// //     }
// //     catch (err) {
// //         res.status(500).json({ err })
// //     }
// // })

// // MESSAGE ROUTES
// // router.get('/messages/:chat_id', chatMiddleware, getMessages)
// // router.post('/message/create', upload.fields([ { name: 'media', maxCount: 10 }, { name: 'message', maxCount: 1 }, { name: 'chat_id', maxCount: 1 },{ name: 'reply_message_id', maxCount: 1 } ]), createMessage)
// // router.put('/message/edit', editMessage)
// // router.delete('/:chat_id/message/delete/:message_id', deleteMessage)

// module.exports = router