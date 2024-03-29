const db = require('../../database/db.connect')
const { selectMedia } = require('./media.func')

const INSERT_USER = 'INSERT INTO user VALUES (NULL, ?, ?, ?, ?, NULL, NULL);'
const SELECT_USER = 'SELECT * FROM user WHERE user_id = ?'
const SELECT_USER_EMAIL = 'SELECT * FROM user WHERE email = ?;'
const UPDATE_USER_INFO = 'UPDATE user SET user_name = ?, description = ?, profile_name = ? WHERE user_id = ?;'
const PUT_USER_MEDIA = 'UPDATE user SET profile_image = ? WHERE user_id = ?'
const DELETE_USER = 'DELETE FROM user WHERE user_id = ?'
const SELECT_BY_USR_NAME = 'SELECT * FROM user WHERE profile_name LIKE ? or user_name LIKE ?;'

const GET_FOLLOWERS = 'SELECT follower.following_id as user_id, user.user_name, user.profile_image FROM follower INNER JOIN user ON follower.followed_id = ? AND user.user_id = follower.followed_id;'
const GET_FOLLOWING = 'SELECT follower.followed_id as user_id, user.user_name, user.profile_image FROM follower INNER JOIN user ON follower.following_id = ? AND user.user_id = follower.followed_id;'
const CREATE_FOLLOW = 'INSERT INTO follower VALUES (?, ?);'
const DELETE_FOLLOW = 'DELETE FROM follower WHERE following_id = ? AND followed_id = ?;'
const CHECK_FOLLOW = 'SELECT count(*) as count FROM follower WHERE following_id = ? AND followed_id = ?;'

const GET_POST_COUNT = 'SELECT COUNT(post_id) as count FROM post WHERE user_id = ?'

const createUser = async ({email, password, user_name, profile_name}) => {
    await db.query(INSERT_USER, [email, password, user_name, profile_name])
}
const selectUser = async ({ user_id }) => {
    const [ user ] = await db.query(SELECT_USER, [ user_id ])
    user.followers = await selectFollowers({ user_id })
    user.follwing = await selectFollowing({ user_id })
    user.posts_count = await selectPostsCount({ user_id })
    user.profile_image = await selectMedia({ media_id: user.profile_image })
    delete user.password
    return user
}
const selectUserByEmail = async ({ email }) => {
    const [user] = await db.query(SELECT_USER_EMAIL, [email])
    return user
}
const selectUsersByName = async ({ user_name }) => {
    const users = await db.query(SELECT_BY_USR_NAME, [user_name, user_name])
    for (let usr of users) {
        usr.profile_image = await selectMedia({ media_id: usr.profile_image })
        delete usr.password
    }
    return users
}
const updateUserInfo = async ({ user_id, user_name, profile_name, description }) => {
    return await db.query(UPDATE_USER_INFO, [user_name, description, profile_name, user_id])
}
const setUserProfileImage = async ({ user_id, media_id }) => {
    return await db.query(PUT_USER_MEDIA, [media_id, user_id])
}
const deleteUser = async ({ user_id }) => {
    return await db.query(DELETE_USER, [ user_id ])
}

const checkFollow = async ({ following_id, followed_id }) => {
    const [{ count }] = await db.query(CHECK_FOLLOW, [ following_id, followed_id ])
    return count > 0
}
const createFollow = async ({ followed_id, following_id }) => {
    const follow_exist = await checkFollow({followed_id, following_id})
    if (!follow_exist) await db.query(CREATE_FOLLOW, [ following_id, followed_id ])
    const followers = await selectFollowers({ user_id: followed_id })
    return followers
}
const deleteFollow = async ({ followed_id, following_id }) => {
    await db.query(DELETE_FOLLOW, [ following_id, followed_id ])
    const followers = await selectFollowers({ user_id: followed_id })
    return followers
}
const selectFollowers = async ({ user_id }) => {
    const followers = await db.query(GET_FOLLOWERS, [ user_id ])
    for (let follow of followers) {
        follow.profile_image = await selectMedia({ media_id: follow.profile_image})
    }
    return followers
}
const selectFollowing = async ({ user_id }) => {
    const following = await db.query(GET_FOLLOWING, [ user_id ])
    for (let follow of following) {
        follow.profile_image = await selectMedia({ media_id: follow.profile_image})
    }
    return following
}

const selectPostsCount = async ({ user_id }) => {
    const [{ count }] = await db.query(GET_POST_COUNT, [ user_id ])
    return count
}

module.exports = {
    createUser,
    selectUser,
    selectUserByEmail,
    selectUsersByName,
    updateUserInfo,
    setUserProfileImage,
    deleteUser,
    createFollow,
    deleteFollow,
}