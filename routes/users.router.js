const { Router }    = require('express')
const database      = require('../database/db.connect')
const router        = new Router()
const multer = require('multer')
const upload = multer()
const { getUser, getMe, updateUser, deleteUserAccount, followUser, unfollowUser } = require('../functional/user.functional')
const updateFields = upload.fields([
    { name: "user_name", maxCount: 1 }, 
    { name: "description", maxCount: 1 }, 
    { name: "profile_image", maxCount: 1 },
    { name: "crop_data", maxCount: 1 },
])
router.use(require('../middleware/auth.middleware'))

router.get('/id/:user_id', getUser)
router.get('/me', getMe)
router.post('/follow/', followUser)
router.put('/update', updateFields, updateUser)
router.delete('/:user_id', deleteUserAccount)
router.delete('/unfollow/:user_id', unfollowUser)

module.exports = router