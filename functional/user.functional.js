const { selectUser, deleteUser, createFollow, deleteFollow } = require('./common/user.func')
const io = require('../socket').getIo()

const getUser = async (req, res) => {
    try {
        const { user_id } = req.params
        const user = await selectUser({ user_id })
        if (!user) res.status(404).json({ message: '404 not found' })
        res.status(200).json(user)
    } catch (error) {
        console.log(error);
        res.status(500).json({ error })
    }
}
const getMe = async (req, res) => {
    try {
        const { user_id } = req.user
        const user = await selectUser({ user_id})
        if (!user) res.status(404).json({ message: '404 not found' })
        res.status(200).json(user)
    } catch (error) {
        console.log(error);
        res.status(500).json({ error })
    }
}
const deleteUserAccount = async (req, res) => {
    try {
        const {user_id} = req.params
        await deleteUser({ user_id })
        res.status(200).json({ message: 'deleted' })
    } catch (error) {
        res.status(500).json({ error })
    }
}
const followUser = async (req, res) => {
    try {
        const followed_id = req.body.user_id
        const following_id = req.user.user_id

        if (followed_id === following_id) return res.status(400)

        const new_followers = await createFollow({ followed_id, following_id })
        // console.log(new_followers);
        io.emit(`user:edit:${followed_id}`, { field: 'followers', value: new_followers })
        res.status(201).json({ message: 'created' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error })
    }
}
const unfollowUser = async (req, res) => {
    try {
        const followed_id = req.params.user_id
        const following_id = req.user.user_id
        const new_followers = await deleteFollow({ following_id, followed_id })
        io.emit(`user:edit:${followed_id}`, { field: 'followers', value: new_followers })
        res.status(203).json({ message: 'deleted' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error })
    }
}

module.exports = {
    getUser,
    getMe,
    deleteUserAccount,
    followUser,
    unfollowUser,
}
