const { selectUserChats, selectPersonalChat, deletePersonalChat } = require('./common/chat.func')
const { selectMessages } = require('./common/message.func')
const { selectUser } = require('./common/user.func')
// const { selectMedia } = require('./common/media.func')

const getPesonalChat = async (req, res) => {
    try {
        const member1_id = req.user.user_id
        const member2_id = req.params.user_id

        const user = await selectUser({ user_id: member2_id })
        if (!user) return res.status(404).json({ message: 'user not exist' })

        const personal_chat = await selectPersonalChat(member1_id, member2_id)
        if (!personal_chat) {
            const chat = {
                chat_name: user.user_name,
                chat_image: user.profile_image,
                messages: [],
            }
            return res.status(200).json(chat)
        } 
        
        personal_chat.messages = await selectMessages({ chat_id: personal_chat.chat_id })
        res.status(200).json(personal_chat)
    } catch (error) {
        console.log(error);
        res.status(500).json({ error })
    }
}
const getUserChats = async (req, res) => {
    try {
        const { user_id } = req.params
        const chats = await selectUserChats({ user_id })
        res.status(200).json(chats)
    } catch (error) {
        console.log(error);
        res.status(500).json({ error })
    }
}

const deleteUserChat = async (req, res) => {
    try {
        const { chat_id } = req.params
        await deletePersonalChat({ chat_id })
        res.status(204).json({ message: "deleted" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error })
    }
}

module.exports = {
    getPesonalChat,
    getUserChats,
    deleteUserChat,
}