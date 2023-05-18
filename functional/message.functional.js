const ImageUtil     = require('../utils/image.util')
const { selectMessage, selectMessages, createMessage, updateMessageText, deleteMessage, createForward } = require('./common/message.func')
const { createMedia, createMediaData } = require('../functional/common/media.func')
const { createPersonalChat, createChatMember, selectPersonalChat } = require('./common/chat.func')
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
        const { chat_id, message, reply_message_id } = req.body
        const { media } = req.files
        const { user_id, user_name, profile_image } = req.user
        const meta = JSON.parse(req.body.meta)
        const date = new Date().toISOString().slice(0, 19).replace('T', ' ')
        // const forward_obj = meta.forward_obj

        let forward_id = null
        let media_id = null
        let _chat_id = chat_id
        let reply_msg_id = reply_message_id === 'undefined' ? null : reply_message_id

        if (!chat_id || (!message & !media)) return res.status(400).json({ err: 'empty message or chat not exist'})
        // if (forward_obj) forward_id = await createForward({ forward_obj }) 
        if (media) media_id = await createMedia()
        if (chat_id === 'undefined') {
            _chat_id = await createPersonalChat() 
            await createChatMember({ user_id: meta.to, chat_id: _chat_id })
            await createChatMember({ user_id, chat_id: _chat_id })
        }
        
        const message_id = await createMessage({ user_id, chat_id: _chat_id, media_id, reply_message_id: reply_msg_id, message, forward_id, date })
        const media_length = media ? media.length : 0

        for (let i = 0; i < media_length; i++){
            const { data, size } = await ImageUtil.CompressImage(media[i].buffer)
            await createMediaData({ media_id, data, meme_type: 'image/jpeg', size })
        }

        const socket_msg = await selectMessage({ message_id })

        if (chat_id === 'undefined') io.emit(`chat:start:${meta.to}`, { chat_id: _chat_id, message: socket_msg })
        else io.emit(`message:add:${chat_id}`, socket_msg)
        
        res.status(200).json({ ok: 'ok' })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ err })
    }
}
const forwardMessage = async (req, res) => {
    try {
        const { forward_obj, to } =  req.body
        const { user_id } = req.user
        const forward_id = await createForward({ forward_obj })
        const date = new Date().toISOString().slice(0, 19).replace('T', ' ')
        let {chat_id} = await selectPersonalChat(user_id, to)
        if (!chat_id) {
            chat_id = await createPersonalChat() 
            await createChatMember({ user_id: meta.to, chat_id: _chat_id })
            await createChatMember({ user_id, chat_id: _chat_id })
        }
        const message_id = await createMessage({ user_id, chat_id, media_id: null, reply_message_id: null, message: null, forward_id, date })
        const socket_msg = await selectMessage({ message_id })
        if (chat_id === 'undefined') io.emit(`chat:start:${meta.to}`, { chat_id: _chat_id, message: socket_msg })
        else io.emit(`message:add:${chat_id}`, socket_msg)
        res.status(200).json({ ok: 'ok' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error })
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
    forwardMessage,
}