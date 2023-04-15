const { Router } = require('express')

const database = require('../database/db.connect')
const router = new Router()

router.use(require('../middleware/auth.middleware'))

router.get('/:post_id', async (req, res) => {
    try {
        const comment_query = '\
            SELECT comment.*, user.user_name, user.profile_image \
            FROM comment \
            INNER JOIN user \
            ON comment.user_id = user.user_id and comment.post_id = ?\
        ' // запрос на комментарии поста
        const post_id = req.params.post_id

        const post_comments = await database.query(comment_query, [post_id])

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
        const { comment_text, post_id } = req.body

        if (!comment_text) return res.status(400).json({ message: 'empty comment text' })
        else if (!post_id) return res.status(400).json({ message: 'something went wrong' })

        await database.query(create_comment_query, [null, post_id, user_id, comment_text])

        res.status(201).json({ message: 'created' })
    }
    catch (err) {
        res.status(500).json({ error: err })
    }
})

router.put('/:comment_id', async (req, res) => {
    try {
        const update_comment_query = 'UPDATE comment SET comment_text = ? WHERE comment_id = ?'
        const { comment_id } = req.params
        const { comment_text } = req.body

        if (!comment_text) return res.status(400).json({ message: 'empty comment text' })

        await database.query(update_comment_query, [comment_text, comment_id])

        res.status(204).json({ message: 'updated' })
    }
    catch (err) {
        res.status(500).json({ error: err })
    }
})


router.delete('delete/:comment_id', async (req, res) => {
    try {
        const delete_comment_query = 'DELETE FROM comment WHERE comment_id = ?'
        const { comment_id } = req.params

        await database.query(delete_comment_query, [comment_id])

        res.status(204).json({ message: 'deleted' })
    }

    catch (err) {

    }
})