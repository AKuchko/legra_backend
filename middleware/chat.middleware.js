const database = require('../database/db.connect')

const chatMiddleware = async (req, res, next) => {
    try {
        const chat_member_query = 'SELECT user_id FROM chat_member WHERE chat_id = ? AND user_id = ?'
        const create_chat_member = 'INSERT INTO chat_member VALUES (?, ?, ?)'
        const chat_query = 'SELECT * FROM chat WHERE chat_id = ?'

        const { chat_id } = req.params
        const { user_id } = req.user

        const [ chat ] = await database.query(chat_query, [ chat_id ])
        const [ chat_member ] = await database.query(chat_member_query, [ chat_id, user_id ])

        if (!chat) return res.status(404).json({ message: 'chat not found' })
        else if (!chat_member & chat.type_id !== 1) return res.status(304).json({ message: 'access denied' })
        else if (chat.type_id === 1 & chat.private) return res.status(304).json({ message: 'comments are locked' })
        else if (!chat_member) await database.query(create_chat_member, [ chat_id, user_id, 'customer' ])

        next()
    }
    catch (err) {
        res.status(500).json({ err })
    }
}

module.exports = chatMiddleware