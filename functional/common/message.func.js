const db = require('../../database/db.connect')
const { selectMedia } = require('./media.func')
const { selectPost } = require('./post.func')

const SELECT_MESSAGES = 'SELECT message.*, user.user_name, user.profile_image FROM message INNER JOIN user ON message.from_id = user.user_id AND message.chat_id = ? ORDER BY message.created'
const SELECT_MESSAGE = 'SELECT message.*, user.user_name, user.profile_image FROM message INNER JOIN user ON message.from_id = user.user_id AND message.message_id = ?;'
const SELECT_MSG_REPLY = 'SELECT messag_id FROM message WHERE reply_message_id = ?;'
const SELECT_FORWARD = 'SELECT * FROM forward WHERE forward_id = ?;'
const SELECT_LAST_MSG = 'SELECT message, created FROM message WHERE chat_id = ? ORDER BY created DESC LIMIT 1'
const INSERT_MESSAGE = 'INSERT INTO message VALUES (?, ?, ?, ?, ?, ?, ?, ?);'
const INSERT_FORWARD = 'INSERT INTO forward VALUES (NULL, ?, ?, ?, ?, ?);'
const UPDATE_MESSAGE = 'UPDATE message SET message = ? WHERE message_id = ?;'
const REMOVE_MESSAGE_REPLY = 'UPDATE message SET reply_message_id = NULL WHERE reply_message_id = ?;'
const DELETE_MESSAGE = 'DELETE FROM message WHERE message_id = ?;'
const DELETE_FORWARD = 'DELETE FROM forward WHERE post_id = ?;'

const selectMessages = async ({ chat_id }) => {
    const messages = await db.query(SELECT_MESSAGES, [ chat_id ])

    for (let msg of messages) {
        msg.profile_image = await selectMedia({ media_id: msg.profile_image })
        msg.media = await selectMedia({ media_id: msg.media_id  })
        if (msg.reply_message_id) msg.embeded_message = await selectMessage({ message_id: msg.reply_message_id })
        if (msg.forward_id) {
            const forward_obj = await selectForward({ forward_id: msg.forward_id })
            msg.media = forward_obj.media
            msg.message = forward_obj.message || forward_obj.caption
            msg.forward_obj = {
                from_id: forward_obj.from_id || forward_obj.user_id,
                user_name: forward_obj.user_name,
            }
        }
    }

    return messages
}
const selectMessage = async ({ message_id }) => {
    const [msg] = await db.query(SELECT_MESSAGE, [ message_id ])
    msg.profile_image = await selectMedia({ media_id: msg.profile_image })
    msg.media = await selectMedia({ media_id: msg.media_id  })
    if (msg.reply_message_id) msg.embeded_message = await selectMessage({ message_id: msg.reply_message_id })
    if (msg.forward_id) {
        const forward_obj = await selectForward({ forward_id: msg.forward_id })
        msg.media = forward_obj.media
        msg.message = forward_obj.messages || forward_obj.caption
        msg.forward_obj = {
            from_id: forward_obj.from_id || forward_obj.user_id,
            user_name: forward_obj.user_name,
        }
    }
    return msg
}
const createMessage = async ({ user_id, chat_id, media_id, reply_message_id, forward_id, message, date }) => {
    const insertedMessage = await db.query(INSERT_MESSAGE, [null, chat_id, user_id, forward_id, reply_message_id, message, media_id, date])
    return insertedMessage.insertId
}
const updateMessageText = async ({ message_id, message }) => {
    return await db.query(UPDATE_MESSAGE, [ message, message_id ])
}
const selectForward = async ({ forward_id }) => {
    [frwrd] = await db.query(SELECT_FORWARD, [forward_id])
    if (frwrd.type === 'msg') return await selectMessage({ message_id: frwrd.message_id });
    else return await selectPost({ post_id: frwrd.post_id })
}
const createForward = async ({ forward_obj }) => {
    let message_id = null, post_id = null
    if (forward_obj.type === "msg") message_id = forward_obj.post_id
    else post_id = forward_obj.post_id
    const frwrd = await db.query(INSERT_FORWARD, [forward_obj.from, post_id, message_id, forward_obj.user_name, forward_obj.type])
    return frwrd.insertId
}
const deleteMessage = async ({ message_id }) => {
    await db.query(REMOVE_MESSAGE_REPLY, [ message_id ])
    await db.query(DELETE_FORWARD, [ message_id ])
    await db.query(DELETE_MESSAGE, [ message_id ])
}
const selectLastMessage = async ({ chat_id }) => {
    const [ msg ] = await db.query(SELECT_LAST_MSG, [ chat_id ])
    return msg
}

module.exports = {
    selectMessages,
    selectMessage,
    selectLastMessage,
    createMessage,
    createForward,
    updateMessageText,
    deleteMessage,
}