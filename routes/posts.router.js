const { Router }    = require('express')
const multer        = require('multer')
const { getUserPost, getUserPosts, createNewPost, getPostComments, addLike } = require('../functional/post.functional')
const upload        = multer()
const router        = new Router()
const io            = require('../socket').getIo()

router.use(require('../middleware/auth.middleware'))

router.get('/user/:user_id', getUserPosts)
router.get('/post/:post_id', getUserPost)
router.get('/comments/:post_id', getPostComments)
router.post('/create', upload.fields([{ name: 'post_media', maxCount: 10 }, { name: 'post_cropper', maxCount: 10 }, { name: 'post_caption', maxCount: 1 }]), createNewPost)
router.post('/like', addLike)
router.put('/:id', async (req, res) => {})
router.delete('/:id', async (req, res) => {
    try {
        const delete_post_query = 'DELETE FROM post WHERE post_id = ?'
        const post_id = req.params.id
    
        await database.query(delete_post_query, [ post_id ])
    
        res.status(204).json({ message: 'Deleted' })
    }
    catch (err) {
        res.status(204).json({ err })
    }
})

module.exports = router

// fuckROBOTS666