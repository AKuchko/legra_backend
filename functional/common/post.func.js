const db = require('../../database/db.connect')
const { selectMedia } = require('./media.func')

const SELECT_POSTS = 'SELECT post.*, user.user_name, user.profile_image FROM post INNER JOIN user ON post.user_id = ? AND user.user_id = post.user_id;'
const SELECT_POST = 'SELECT post.*, user.user_name, user.profile_image FROM post INNER JOIN user ON post.post_id = ? AND user.user_id = post.user_id;'
const INSERT_POST = 'INSERT INTO post VALUES (NULL, ?, ?, ?, ?);'
const DELETE_POST = 'DELETE FROM post WHERE post_id = ?;'
const SELECT_LIKES = 'SELECT likes.user_id, user.user_name, user.profile_image FROM likes INNER JOIN user ON likes.post_id = ? AND user.user_id = likes.user_id'
const SELECT_LIKE = 'SELECT * FROM likes WHERE user_id = ? AND post_id = ?'
const INSERT_LIKE = 'INSERT INTO likes VALUES (?, ?);'
const DELETE_LIKE = 'DELETE FROM likes WHERE user_id = ? AND post_id = ?'
const SELECT_COMMENTS_COUNT = 'SELECT count(message.message_id) as count FROM message INNER JOIN comments_chat ON comments_chat.post_id = ? AND message.chat_id = comments_chat.chat_id'

const selectPosts = async ({ user_id }) => {
    const posts = await db.query(SELECT_POSTS, [ user_id ])
    for (post of posts) {
        post.profile_image = await selectMedia({ media_id: post.profile_image })
        post.media = await selectMedia({ media_id: post.media_id })
        post.likes = await selectLikes({ post_id: post.post_id })
        post.comments_count = await selectCommentsCount({ post_id: post.post_id })
    }
    return posts
}
const selectPost = async ({ post_id }) => {
    const [ post ] = await db.query(SELECT_POST, [ post_id ])
    post.profile_image = await selectMedia({ media_id: post.profile_image })
    post.media = await selectMedia({ media_id: post.media_id })
    post.likes = await selectLikes({ post_id: post.post_id })
    post.comments_count = await selectCommentsCount({ post_id: post.post_id })
    return post
}
const createPost = async ({ user_id, media_id, caption }) => {
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ')
    return await db.query(INSERT_POST, [ user_id, media_id, caption, date ])
}
const deletePost = async ({ post_id }) => {
    await db.query(DELETE_POST, [post_id])
}
const selectLikes = async ({ post_id }) => {
    const likes = await db.query(SELECT_LIKES, [ post_id ])
    for (let like of likes) like.profile_image = await selectMedia({ media_id: like.profile_image })
    return likes
}
const selectLike = async ({ user_id, post_id }) => {
    const [like] = await db.query(SELECT_LIKE, [ user_id, post_id ])
    return like
}
const createLike = async ({ user_id, post_id }) => {
    return await db.query(INSERT_LIKE, [ user_id, post_id ])
}
const deleteLike = async ({ user_id, post_id }) => {
    return await db.query(DELETE_LIKE, [ user_id, post_id ])
}
const selectCommentsCount = async ({ post_id }) => {
    const [{count}] = await db.query(SELECT_COMMENTS_COUNT, [post_id])
    return count
}

module.exports = {
    selectPosts,
    selectPost,
    createPost,
    deletePost,
    selectLike,
    createLike,
    deleteLike,
}