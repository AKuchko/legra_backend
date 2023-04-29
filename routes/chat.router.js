const { Router }    = require('express')
const multer        = require('multer')
const sharp         = require('sharp')

const database      = require('../database/db.connect')
const ImageUtil     = require('../utils/image.util')
const router        = new Router()
const io            = require('../socket').getIo()
const upload        = multer()

router.use(require('../middleware/auth.middleware'))

router.get('/messages/:chat_id', async (req, res) => {
    try {
        const messages_query = 'SELECT message.*, user.user_name, user.profile_image\
                                FROM message\
                                INNER JOIN user\
                                ON message.user_id = user.user_id AND message.chat_id = ? ORDER BY message.created'
        const message_media_query = 'SELECT * FROM message_media WHERE message_id = ?'

        const chat_id = req.params.chat_id
        const messages = await database.query(messages_query, [chat_id])

        for (let message of messages) {
            const media = await database.query(message_media_query, [message.message_id])
            message.media = media.map(media => {
                let tempData = ImageUtil.ConvertToBase64(media.data, media.ext)
                media.data = tempData
                delete media.ext
                delete media.message_id
                return media
            })
            message.profile_image  = ImageUtil.ConvertToBase64(message.profile_image, 'image/webp')
        }

        res.status(200).json(messages)
    }
    catch (err) {
        res.status(500).json({ err })
    }
})

router.post(
    '/message/create', 
    upload.fields(
        [
            { name: 'message_media', maxCount: 10 }, 
            { name: 'message_text', maxCount: 1 }, 
            { name: 'chat_id', maxCount: 1 }
        ]
    ), 
    async (req, res) => {
        try {
            const create_message = 'INSERT INTO message VALUES (?, ?, ?, ?, ?)' // (msg_id, chat_id, user_id, msg_text, created)
            const create_message_media = 'INSERT INTO message_media VALUES (?, ?, ?, ?)' // (media_id, msg_id, data, ext)
            const get_user = 'SELECT user_name, profile_image FROM user WHERE user_id = ?'

            const { chat_id, message_text } = req.body
            const { message_media } = req.files
            const { user_id } = req.user
            const date = new Date().toISOString().slice(0, 19).replace('T', ' ')

            if (!chat_id || (!message_text & !message_media)) return res.status(400).json({ err: 'empty message or chat not exist'})

            const new_msg = await database.query(create_message, [null, chat_id, user_id, message_text, date])
            const [user_info] = await database.query(get_user, [user_id]);

            const socket_msg = {
                message_id: new_msg.insertId,
                chat_id,
                user_id,
                message_text,
                created: date,
                user_name: user_info.user_name,
                profile_image: ImageUtil.ConvertToBase64(user_info.profile_image, 'image/jpeg'),
                media: [],
            }
            
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
            res.status(500).json({ err })
        }
    }
)

router.delete('/message/delete/:message_id', async (req, res) => {
    try {
        const delete_message = 'DELETE FROM message WHERE message_id = ?'
        const { message_id } = req.params;

        await database.query(delete_message, [message_id])

        res.status(204).json({ message: 'deleted' })
    }
    catch (err) {
        res.status(500).json({ err })
    }
})

module.exports = router