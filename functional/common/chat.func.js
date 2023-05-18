const db = require('../../database/db.connect')
const { selectLastMessage } = require('./message.func')
const { selectMedia } = require('./media.func')

const SELECT_PERSONAL_CHAT = 'SELECT m1.chat_id, user.user_name as chat_name, user.profile_image as chat_image FROM chat_member m1 INNER JOIN chat_member m2 ON  (m2.user_id = ?) INNER JOIN user ON user.user_id = m1.user_id WHERE m1.user_id = ? AND m1.chat_id = m2.chat_id;'
const INSERT_PERSONAL_CHAT = 'INSERT INTO personal_chat VALUES (?);'
const SELECT_USER_CHATS = 'SELECT m1.chat_id, u.user_id, u.user_name as chat_name, u.profile_image as chat_image FROM chat_member m1 INNER JOIN chat_member m2 ON (m2.user_id = ?) INNER JOIN user u ON (u.user_id = m1.user_id) WHERE m1.chat_id = m2.chat_id and m1.user_id != m2.user_id;'
const DELETE_PERSONAL_CHAT = 'DELETE FROM chat WHERE chat_id = ?'
const INSERT_CHAT = 'INSERT INTO chat VALUES (NULL);'
const INSERT_COMMENT_CHAT = 'INSERT INTO comments_chat VALUES (?, ?);'
const SELECT_COMMENT_CHAT  = 'SELECT chat_id FROM comments_chat WHERE post_id = ?;'
const INSERT_MEMBER = 'INSERT INTO chat_member VALUES (?, ?, ?);'

const createChat = async () => {
    const { insertId } = await db.query(INSERT_CHAT)
    return insertId
}
const createCommentChat = async ({ post_id }) => {
    const chat_id = await createChat()
    return await db.query(INSERT_COMMENT_CHAT, [ chat_id, post_id ])
}
const selectCommentChat = async({ post_id }) => {
    const [{ chat_id }] = await db.query(SELECT_COMMENT_CHAT, [post_id])
    return chat_id
}
const createPersonalChat = async () => {
    const chat_id = await createChat()
    await db.query(INSERT_PERSONAL_CHAT, [ chat_id ])
    return chat_id
}
const selectPersonalChat = async (member1_id, member2_id) => {
    const [ pers_chat ] = await db.query(SELECT_PERSONAL_CHAT, [ member1_id, member2_id ])
    pers_chat.chat_image = pers_chat.chat_image ? await selectMedia({ media_id: pers_chat.chat_image }) : null
    return pers_chat
}
const selectUserChats = async ({ user_id }) => {
    const chats = await db.query(SELECT_USER_CHATS, [ user_id ])
    for (let chat of chats) {
        chat.last_message = await selectLastMessage({  chat_id: chat.chat_id })
        chat.chat_image = chat.chat_image ? await selectMedia({ media_id: chat.chat_image }) : null
    }
    return chats
}
const createChatMember = async ({ user_id, chat_id }) => {
    await db.query(INSERT_MEMBER, [null, chat_id, user_id])
}
const deletePersonalChat = async ({ chat_id }) => {
    await db.query(DELETE_PERSONAL_CHAT, [ chat_id ])
}

module.exports = {
    createChat,
    createCommentChat,
    selectCommentChat,
    selectUserChats,
    selectPersonalChat,
    createPersonalChat,
    createChatMember,
    deletePersonalChat,
}

