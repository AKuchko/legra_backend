const ImageUtil = require('../utils/image.util')
const io = require('../socket').getIo()
const { selectPosts, selectPost, createPost, selectLike, createLike, deleteLike } = require('../functional/common/post.func')
const { createMedia, createMediaData } = require('../functional/common/media.func')
const { createCommentChat, selectCommentChat } = require('../functional/common/chat.func')
const { selectMessages } = require('./common/message.func')

const getUserPosts = async (req, res) => {
    try {
        const user_id = req.params.user_id
        const posts = await selectPosts({ user_id, res })
        res.status(200).json(posts)
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ err })
    }
}
const getUserPost = async (req, res) => {
    try {
        const { post_id } = req.params
        const post = await selectPost({ post_id })
        if (!post) return res.status(404).json({ message: "This post not found"})
        // post.likes = await selectLikes({ post_id: post.post_id })
        res.status(200).json(post)
    }
    catch (err) {
        res.status(500).json({ err })
    }
}
const createNewPost =  async (req, res) => {
    try {
        const { post_caption, post_cropper }  = req.body
        const { post_media }    = req.files
        const { user_id }       = req.user
        const cropp_data        = JSON.parse(post_cropper)

        if (!post_media) return res.status(400).json({ error: 'Empty post media' })
        const media_id = await createMedia()

        for (let i = 0; i < post_media.length; i++) {
            const { data, size } = await ImageUtil.ExtractImage(post_media[i].buffer, cropp_data[i])
            await createMediaData({ media_id, data, meme_type: 'image/jpeg', size })
        }

        const post_info = await createPost({ user_id, media_id, caption: post_caption })
        await createCommentChat({ post_id: post_info.insertId })

        res.status(201).json({ message: 'created' })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ err })
    }
}
const getPostComments = async (req, res) => {
    try {
        const { post_id } = req.params
        const chat_id = await selectCommentChat({ post_id })
        const comments = await selectMessages({ chat_id })
        res.status(200).json({ comments, chat_id })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error })
    }
}
const addLike = async (req, res) => {
    try {
        const { post_id, post_user_id } = req.body
        const { user_id } = req.user
        const alreadyLiked = await selectLike({ user_id, post_id })
        if (alreadyLiked) {
            await deleteLike({ post_id, user_id })
            io.emit(`post:like:${post_user_id}`, { action: 'unlike', post_id, user: req.user })
        }
        else {
            await createLike({ user_id, post_id })
            io.emit(`post:like:${post_user_id}`, { action: 'like', post_id, user: req.user })
        }
        res.status(200).json({ msg: 'ok' })

    } catch (error) {
        console.log(error)
        res.status(500).json({ error })
    }
}
module.exports = {
    getUserPosts,
    getUserPost,
    createNewPost,
    getPostComments,
    addLike,
}