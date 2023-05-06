// const { Router }    = require('express')
// const multer        = require('multer')

// const database      = require('../database/db.connect')
// const ImageUtil     = require('../utils/image.util')
// const router        = new Router()
// const io            = require('../socket').getIo()
// const upload        = multer()

// router.use(require('../middleware/auth.middleware'))

// // Получение комментов поста
// router.get('/post/:post_id', async (req, res) => {
//     try {
//         const comment_query     = 'SELECT comment.*, user.user_name, user.profile_image FROM comment INNER JOIN user ON comment.user_id = user.user_id and comment.post_id = ?' // запрос на комментарии поста
//         const comment_media_query   = 'SELECT media, ext FROM comment_media WHERE comment_id = ?' // Запрос на получение медиа сообщения

//         const { post_id }   = req.params

//         // Достаем комменты
//         const post_comments = await database.query(comment_query, [post_id])

//         // достаем 'media'
//         for (comment of post_comments) {
//             comment.media = await database.query(comment_media_query, [comment.comment_id]) // получем 'comment_mmedia' (хранит в себе массив {BLOB, ext})
//             const temp_media = comment.media.map(media => ImageUtil.ConvertToBase64(media.media, media.ext)) // конвертируем media комментариев в base64
//             comment.media = temp_media // сохраняем результат
//             comment.profile_image   = ImageUtil.ConvertToBase64(comment.profile_image, 'image/jpeg') // Конвертируем изображение профиля в base64
//         }

//         res.status(200).json(post_comments)
//     }
//     catch (err) {
//         res.status(500).json({ error: err })
//     }
// })

// // Создание комментария
// router.post(
//     '/create', 
//     upload.fields(
//         [
//             { name: 'comment_media', maxCount: 10 }, 
//             { name: 'comment_text', maxCount: 1 }, 
//             { name: 'post_id', maxCount: 1 }
//         ]
//     ), 
//     async (req, res) => {
//         try {
//             const create_comment_query = 'INSERT INTO comment VALUES (?, ?, ?, ?)'
//             const create_mssage_query = 'INSERT INTO comment_message VALUES (?, ?, ?)'

//             const user_id = req.user.user_id
//             const { comment_media } = req.files
//             const { comment_text, post_id } = req.body
//             const date = new Date().toISOString().slice(0, 19).replace('T', ' ')
            
//             if (!comment_text) return res.status(400).json({ message: 'empty comment text' })
//             else if (!post_id) return res.status(400).json({ message: 'something went wrong' })

//             const new_comment = await database.query(create_comment_query, [null, post_id, user_id, date])
//             const new_message = await database.query(create_mssage_query, [null, new_comment.insertId, comment_text])

//             res.status(201).json({ message: 'created' })
//         }
//         catch (err) {
//             res.status(500).json({ error: err })
//         }
//     }
// )

// router.put('/update', async (req, res) => {
//     try {
//         const update_comment_query = 'UPDATE comment SET message_text = ? WHERE comment_id = ?'
//         const { comment_id, message_text } = req.body

//         if (!message_text) return res.status(400).json({ message: 'empty comment text' })

//         await database.query(update_comment_query, [message_text, comment_id])

//         res.status(204).json({ message: 'updated' })
//     }
//     catch (err) {
//         res.status(500).json({ error: err })
//     }
// })


// router.delete('/delete', async (req, res) => {
//     try {
//         const delete_comment_query = 'DELETE FROM comment WHERE comment_id = ?'
//         const { comment_id } = req.body

//         await database.query(delete_comment_query, [comment_id])

//         res.status(204).json({ message: 'deleted' })
//     }
//     catch (err) {
//         res.status(500).json({ error: err })
//     }
// })

// module.exports = router