const db = require('../../database/db.connect')

const INSERT_CHAT = 'INSERT INTO chat VALUES (NULL);'
const INSERT_COMMENT_CHAT = 'INSERT INTO comments_chat VALUES (?, ?);'
const SELECT_COMMENT_CHAT  = 'SELECT chat_id FROM comments_chat WHERE post_id = ?;'

const createChat = async () => {
    return await db.query(INSERT_CHAT)
}
const createCommentChat = async ({ post_id }) => {
    const chat = await createChat()
    return await db.query(INSERT_COMMENT_CHAT, [chat.insertId, post_id])
}
const selectCommentChat = async({ post_id }) => {
    const [{ chat_id }] = await db.query(SELECT_COMMENT_CHAT, [post_id])
    return chat_id
}

module.exports = {
    createChat,
    createCommentChat,
    selectCommentChat,
}

