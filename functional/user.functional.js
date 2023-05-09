const { selectUser, deleteUser, updateUserInfo, createFollow, deleteFollow } = require('./common/user.func')
const { createMediaData } = require('./common/media.func')
const { ExtractImage, ConvertToBase64 } = require('../utils/image.util')
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
const updateUser = async (req, res) => {
    try {
        const { user_name, description, crop_data } = req.body
        const { user_id } = req.user
        const { profile_image } = req.files
        const crop_options =  JSON.parse(crop_data)

        if (!user_name & !description) return res.status(400).json({ message: 'no changes' })
        if (!profile_image) {
            const profile_name = '@' + user_name.toLowerCase().split(' ').join('')
            await updateUserInfo({ user_id, user_name, description, profile_name })
            res.status(201).json({ profile_name, user_name, description })
        }
        else {
            const media_id = req.user.profile_image
            const ext = profile_image[0].mimetype.split('/')[1]
            const { data, size } = await ExtractImage(profile_image[0].buffer, crop_options, ext)
            await createMediaData({ media_id, data, meme_type: profile_image[0].mimetype, size })
            const base64data = ConvertToBase64(data, profile_image.mimetype)
            res.status(201).json({ profile_image: base64data })
        }

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
    updateUser,
    deleteUserAccount,
    followUser,
    unfollowUser,
}
