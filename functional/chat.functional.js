const database = require('../database/db.connect')
const ImageUtil = require('../utils/image.util')
const io = require('../socket').getIo()
const sharp = require('sharp')

const select_media = async (_id, query) => {
    const media = await database.query(query, [ _id ])
    return media.map(m => {
        const tempData = ImageUtil.ConvertToBase64(m.data, m.ext)
        return { media_id: m.media_id, data: tempData }
    })
}
const select_forward_post = async (_id) => {
    const select_post_query = 'SELECT * FROM post WHERE post_id = ?'
    const [ post ] = await database.query(select_post_query, [ _id ])
    post.media = await select_media(post_id, 'SELECT * FROM post_media WHERE post_id = ?')
    return post
}
const select_forward_msg = async (_id) => {
    const select_msg_query = 'SELECT message.*, user.user_name FROM message INNER JOIN user ON message.user_id = user.user_id AND message.message_id = ?'
    const [ msg ] = await database.query(select_msg_query, [ _id ])
    msg.media = await select_media(msg.message_id, 'SELECT * FROM message_media WHERE message_id = ?')
    return msg
}

const getMessages = async (req, res) => {
    const messages_query = 'SELECT message.*, user.user_name, user.profile_image FROM message INNER JOIN user ON message.user_id = user.user_id AND message.chat_id = ? ORDER BY message.created'
    try {
        const { chat_id } = req.params
        const messages = await database.query(messages_query, [ chat_id ])

        for (let message of messages) {
            switch (message.type_id) {
                case 1:
                    message.media = await select_media(message.message_id, 'SELECT * FROM message_media WHERE message_id = ?')
                    if (message.reply_to) message.embeded_message = await select_forward_msg(message.reply_to)
                    break;

                case 2:
                    message.forward_post = select_forward_post(message.forward_post)
                    break;

                case 3:
                    message.forward_message = select_forward_msg(message.forward_message)
                    break;

                default:
                    break;
            }
            if (message.profile_image) message.profile_image = ImageUtil.ConvertToBase64(message.profile_image, 'image/jpeg')
            delete message.reply_to
        }

        res.status(200).json(messages)
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ err })
    }
}
const createMessage = async (req, res) => {
    try {
        const create_message = 'INSERT INTO message VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)' // (msg_id, chat_id, user_id, msg_text, created)
        const create_message_media = 'INSERT INTO message_media VALUES (?, ?, ?, ?)' // (media_id, msg_id, data, ext)
        const get_user = 'SELECT user_name, profile_image FROM user WHERE user_id = ?'

        const { chat_id, message_text, forward_msg, forward_post, reply, msg_type } = req.body
        const { message_media } = req.files
        const { user_id } = req.user
        const date = new Date().toISOString().slice(0, 19).replace('T', ' ')

        let data_to_load = [
            null, 
            chat_id, 
            user_id, 
            message_text, 
            date, 
            msg_type, 
            forward_post !== 'undefined' ? forward_post : null, 
            forward_msg !== 'undefined' ? forward_msg : null, 
            reply !== 'undefined' ? reply : null
        ]
        
        if (!chat_id || (!message_text & !message_media)) return res.status(400).json({ err: 'empty message or chat not exist'})

        const new_msg = await database.query(create_message, data_to_load)
        const [user_info] = await database.query(get_user, [user_id]);

        const socket_msg = {
            message_id: new_msg.insertId,
            chat_id,
            user_id,
            message_text,
            created: date,
            user_name: user_info.user_name,
            profile_image: user_info.profile_image ? ImageUtil.ConvertToBase64(user_info.profile_image, 'image/jpeg') : null,
            message_type: msg_type,
            media: [],
        }

        if (msg_type === 2) socket_msg.forward_post = await select_forward_post(forward_post)
        else if (msg_type === 3) socket_msg.forward_message = await select_forward_msg(forward_msg)
        else if (reply !== 'undefined') socket_msg.embeded_message = await select_forward_msg(reply)
        
        const media_length = message_media ? message_media.length : 0

        for (let i = 0; i < media_length; i++){
            const data = await sharp(message_media[i].buffer).jpeg({ quality: 70, mozjpeg: true }).toBuffer()
            const new_media = await database.query(create_message_media, [null, new_msg.insertId, data, 'image/jpeg'])
            socket_msg.media.push({ data: ImageUtil.ConvertToBase64(data, 'image/jpeg'), media_id: new_media.insertId })
        }

        io.emit(`message:add:${chat_id}`, socket_msg)
        res.status(200).json({ ok: 'ok' })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ err })
    }
}
const deleteMessage =  async (req, res) => {
    try {
        const delete_message = 'DELETE FROM message WHERE message_id = ?'
        const select_references = 'SELECT * FROM message WHERE reply_to = ? OR forward_message = ?'
        const { chat_id, message_id } = req.params;
        const messages_to_update = []

        const references_to_message = await database.query(select_references, [message_id, message_id])

        for (message of references_to_message) {
            if (message.reply_to) {
                await database.query('UPDATE message SET reply_to = ?, forward_message = ? WHERE message_id = ?', [ null, null, message.message_id ])
                io.emit(`message:edit:${chat_id}`, { message_id: message.message_id, fields_to_edit: { embeded_message: null }})
            }
            else if (message.forward_message) {
                await database.query(delete_message, [message.message_id])
                io.emit(`message:delete:${message.chat_id}`, { message_id })
            }
        }

        await database.query(delete_message, [message_id])
        io.emit(`message:delete:${chat_id}`, { message_id })
        res.status(204).json({ message: 'deleted' })
    }
    catch (err) {
        res.status(500).json({ err })
    }
}
const editMessage = async (req, res) => {
    try {
        const edit_query = 'UPDATE message SET message_text = ? WHERE message_id = ?'
        const { chat_id, message_id, message_text } = req.body

        await database.query(edit_query, [message_text, message_id])

        io.emit(`message:edit:${chat_id}`, { message_id, fields_to_edit: { message_text }})
        res.status(204).json({ message: 'updated' })
    }
    catch (err) {
        res.status(500).json({ err })
    }
}
module.exports = {
    getMessages,
    createMessage,
    editMessage,
    deleteMessage,
}