const { Router }    = require('express')
const database      = require('../database/db.connect')
const router        = new Router()

// router.use(require('../middleware/auth.middleware'))

router.get('/user/:user_id', async (req, res) => {
    try {
        const user_id = req.params.user_id
        const [user_posts] = await database.query(`SELECT * FROM posts WHERE user_id = ${user_id}`)

        res.status(200).json(user_posts)
    }
    catch (err) {
        res.status(404).json({error: 'Bad request.'})
    }
})

router.get('/post/:id', async (req, res) => {
    try {
        const post_id = req.params.id
        const [post] = await database.query(`SELECT * FROM posts WHERE id = ${post_id}`)
        res.status(200).json(post)
    }
    catch (err) {
        res.status(404).json('404')
    }
})

router.post('/create', async (req, res) => {
    const { post_image, post_note } = req.body

    if (!post_image) return res.status(400).json({ error: 'Empty image' })

    
})

module.exports = router