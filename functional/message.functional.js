const ImageUtil     = require('../utils/image.util')
const { selectMessage, selectMessages, createMessage, updateMessageText, deleteMessage } = require('./common/message.func')
const { createMedia, createMediaData, selectMedia } = require('../functional/common/media.func')
const io = require('../socket').getIo()

const getChatMessages = async (req, res) => {
    try {
        const { chat_id } = req.params
        const messages = await selectMessages({ chat_id })
        res.status(200).json(messages)
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ err })
    }
}
const createNewMessage = async (req, res) => {
    try {
        console.log(req.user);
        const { chat_id, message, forward_obj, reply_message_id } = req.body
        const { media } = req.files
        const { user_id, user_name, profile_image } = req.user
        const date = new Date().toISOString().slice(0, 19).replace('T', ' ')
        // const socket_msg = {}
        let forward_id = null
        let media_id = null
        let reply_msg_id = reply_message_id === 'undefined' ? null : reply_message_id

        if (!chat_id || (!message & !media & !forward_obj)) return res.status(400).json({ err: 'empty message or chat not exist'})
        if (forward_obj) forward_id = await createForward({ forward_obj }) 
        if (media) media_id = await createMedia()
        const message_id = await createMessage({ user_id, chat_id, media_id, reply_message_id: reply_msg_id, message, forward_id, date })

        // socket_msg.message_id = message_id
        // socket_msg.message = message
        // socket_msg.chat_id = chat_id
        // socket_msg.from_id = user_id
        // socket_msg.user_name = user_name
        // socket_msg.profile_image = await selectMedia({ media_id: profile_image })
        // socket_msg.media = []
        
        const media_length = media ? media.length : 0

        for (let i = 0; i < media_length; i++){
            const { data, size } = await ImageUtil.CompressImage(media[i].buffer)
            const new_media = await createMediaData({ media_id, data, meme_type: 'image/jpeg', size })
            // socket_msg.media.push({ data: ImageUtil.ConvertToBase64(data, 'image/jpeg'), meme_type: 'image/jpeg', size })
        }

        const socket_msg = await selectMessage({ message_id })
        io.emit(`message:add:${chat_id}`, socket_msg)
        res.status(200).json({ ok: 'ok' })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ err })
    }
}
const deleteUserMessage =  async (req, res) => {
    try {
        const { chat_id, message_id } = req.params;
        await deleteMessage({ message_id })
        io.emit(`message:delete:${chat_id}`, { message_id })
        res.status(204).json({ message: 'deleted' })
    }
    catch (err) {
        res.status(500).json({ err })
    }
}
const editMessage = async (req, res) => {
    try {
        const { chat_id, message_id, message } = req.body
        await updateMessageText({ message_id, message })
        io.emit(`message:edit:${chat_id}`, { message_id, fields_to_edit: { message }})
        res.status(204).json({ message: 'updated' })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ err })
    }
}
module.exports = {
    getChatMessages,
    createNewMessage,
    editMessage,
    deleteUserMessage,
}