const { Router }    = require('express')
const multer        = require('multer')
const sharp         = require('sharp')

const database      = require('../database/db.connect')
const ImageUtil     = require('../utils/image.util')
const upload        = multer()
const router        = new Router()

router.use(require('../middleware/auth.middleware'))

// Получение постов юзера
router.get('/user/:user_id', async (req, res) => {
    try {
        const posts_query = 'SELECT post.*, user.user_name, user.profile_image \
                            FROM post \
                            INNER JOIN user \
                            ON post.user_id = user.user_id AND post.user_id = ?'    // запрос на получение постов
        const media_query = 'SELECT media_id, data, ext FROM post_media WHERE post_id = ?' // запрос на медиа файлы поста

        const user_id = req.params.user_id

        const user_posts = await database.query(posts_query, [ user_id ])    // досстаем список постов

        for (let post of user_posts) {
            // Для каждого поста запрашиваем список медиафайлов и комментарев
            post_media    = await database.query(media_query, [post.post_id])

            // добавляем информацию к посту
            post.media = post_media.map(media => {
                const temp_media = ImageUtil.ConvertToBase64(media.data, media.ext)
                media.data = temp_media
                delete media.ext
                return media
            })
            post.profile_image  = ImageUtil.ConvertToBase64(post.profile_image, 'image/jpeg')
        }

        res.status(200).json(user_posts)
    }
    catch (err) {
        res.status(404).json({error: err})
    }
})

router.get('/post/:post_id', async (req, res) => {
    try {
        const get_post_query = 'SELECT post.*, user.user_name, user.profile_image \
                                FROM post \
                                INNER JOIN user \
                                ON post.post_id = ? AND user.user_id = post.user_id'
        const media_query = 'SELECT media_id, data, ext FROM post_media WHERE post_id = ?'
        const post_id = req.params.post_id

        const [ post ] = await database.query(get_post_query, [post_id])

        if (!post) return res.status(404).json({ message: "This post not found"})

        post_media = await database.query(media_query, [post_id])
        post.media = post_media.map(media => {
            const temp_media = ImageUtil.ConvertToBase64(media.data, media.ext)
            media.data = temp_media
            delete media.ext
            return media
        })

        res.status(200).json(post)
    }
    catch (err) {
        res.status(500).json({ error: err })
    }
})

// Создание нового поста
router.post(
    '/create', 
    upload.fields(
        [
            { name: 'post_media', maxCount: 10 }, 
            { name: 'post_cropper', maxCount: 10 }, 
            { name: 'post_caption', maxCount: 1 }
        ]
    ), 
    async (req, res) => {
        try {
            const insert_post_query     = 'INSERT INTO post VALUES (?, ?, ?, ?, ?, ?)'   // Запрос на созддание поста (post_id, user_id, chat_id, caption, likes, created)
            const insert_media_query    = 'INSERT INTO post_media VALUES (?, ?, ?, ?)' // Запрос на создание медиа для поста (media_id, post_id, data, ext)
            const create_comment_chat   = 'INSERT INTO chat VALUES (?, ?)' // Запрос для создания чата (chat_id, private)

            const { post_caption, post_cropper }  = req.body
            const { post_media }    = req.files
            const user_id           = req.user.user_id
            const date              = new Date().toISOString().slice(0, 19).replace('T', ' ')
            const cropp_data        = JSON.parse(post_cropper)

            if (!post_media) return res.status(400).json({ error: 'Empty post media' })

            const comment_chat = await database.query(create_comment_chat, [null, 0])
            const post_info = await database.query(insert_post_query, [ null, user_id, comment_chat.insertId, post_caption, 0, date ]) // создаем запись о посте

            // // создаем новую запись в базе данных для каждого загруженного файла
            for (let i = 0; i < post_media.length; i++) {
                let sharp_options = {
                    left: Math.round(cropp_data[i].x),
                    top: Math.round(cropp_data[i].y),
                    width: Math.round(cropp_data[i].width),
                    height: Math.round(cropp_data[i].height),
                }
                const {data, info} = await sharp(post_media[i].buffer)
                    .toFormat('webp')
                    .extract(sharp_options)
                    .toBuffer({ resolveWithObject: true })

                await database.query(insert_media_query, [ null, post_info.insertId, data, 'image/webp' ])
            }

            res.status(201).json({ message: 'created' })
        }
        catch (err) {
            res.status(500).json({ error: err })
        }
    }
)

// Обновление поста (Изменение описания)
router.put('/:id', async (req, res) => {
    try {
        const update_post_query = 'UPDATE post SET post_caption = ? WHERE post_id = ?'
        const { post_caption }  = req.body
        const post_id           = req.params.id

        await database.query(update_post_query, [post_caption, post_id])
        res.status(200)
    }
    catch (err) {
        res.status(400).json({ error: err })
    }
})

// Удаление поста
router.delete('/:id', async (req, res) => {
    try {
        const delete_post_query     = 'DELETE FROM post WHERE post_id = ?'
        const post_id               = req.params.id
    
        await database.query(delete_post_query, [ post_id ])
    
        res.status(204).json({ message: 'Deleted' })
    }
    catch (err) {
        res.status(204).json({ error: err })
    }
})

module.exports = router

// fuckROBOTS666