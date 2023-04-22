const { Router }    = require('express')

const database      = require('../database/db.connect')
const ImageUtil     = require('../utils/image.util')
const router        = new Router()

router.use(require('../middleware/auth.middleware'))

router.get('/post/:post_id', async (req, res) => {
    try {
        const comment_query     = 'SELECT comment.*, user.user_name, user.profile_image FROM comment INNER JOIN user ON comment.user_id = user.user_id and comment.post_id = ?' // запрос на комментарии поста
        const message_query     = 'SELECT message_text FROM message WHERE message_id = ?'   // Запрос на получения mmessage 
        const msg_media_query   = 'SELECT media, ext FROM message_media WHERE message_id = ?' // Запрос на получение медиа сообщения

        const { post_id }   = req.params
        const post_comments = await database.query(comment_query, [post_id])

        for (comment of post_comments) {
            const [message] = await database.query(message_query, [comment.message_id]) // Получаем 'message' (хранит в себе msg_id и текст сообщения)
            message.media   = await database.query(msg_media_query, [comment.message_id]) // получем 'mssage_mmedia' (хранит в себе массив {BLOB, ext})

            message_media = message.media.map(media => ImageUtil.ConvertToBase64(media.media, media.ext)) // конвертируем media_message в base64
            message.media = message_media

            comment.message         = message // Запихиваем 'message' в comment
            comment.profile_image   = ImageUtil.ConvertToBase64(comment.profile_image, 'image/jpeg') // Конвертируем изображение профиля в base64
        }

        res.status(200).json(post_comments)
    }
    catch (err) {
        res.status(500).json({ error: err })
    }
})

router.post('/create', async (req, res) => {
    try {
        const create_comment_query = 'INSERT INTO comment VALUES (?, ?, ?, ?)'
        const user_id = req.user.user_id
        const { message_text, post_id } = req.body

        if (!message_text) return res.status(400).json({ message: 'empty comment text' })
        else if (!post_id) return res.status(400).json({ message: 'something went wrong' })

        await database.query(create_comment_query, [null, post_id, user_id, message_text])

        res.status(201).json({ message: 'created' })
    }
    catch (err) {
        res.status(500).json({ error: err })
    }
})

router.put('/update', async (req, res) => {
    try {
        const update_comment_query = 'UPDATE comment SET message_text = ? WHERE comment_id = ?'
        const { comment_id, message_text } = req.body

        if (!message_text) return res.status(400).json({ message: 'empty comment text' })

        await database.query(update_comment_query, [message_text, comment_id])

        res.status(204).json({ message: 'updated' })
    }
    catch (err) {
        res.status(500).json({ error: err })
    }
})


router.delete('/delete', async (req, res) => {
    try {
        const delete_comment_query = 'DELETE FROM comment WHERE comment_id = ?'
        const { comment_id } = req.body

        await database.query(delete_comment_query, [comment_id])

        res.status(204).json({ message: 'deleted' })
    }
    catch (err) {
        res.status(500).json({ error: err })
    }
})

module.exports = router