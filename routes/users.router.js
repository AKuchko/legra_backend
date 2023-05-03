const { Router }    = require('express')

const database      = require('../database/db.connect')
const imageUtil     = require('../utils/image.util')
const router        = new Router()

router.use(require('../middleware/auth.middleware'))

// Получение информаци о пользователе по id
router.get('/id/:id', async (req, res) => {
    try {
        const get_user_query = 'SELECT * FROM user WHERE user_id = ?'
        const user_id = req.params.id

        const [user] = await database.query(get_user_query, [ user_id ])

        user.profile_image = imageUtil.ConvertToBase64(user.profile_image)
        delete user.password

        res.status(200).json(user)
    }
    catch (err) {
        res.status(404).json({ error: `404 [not found]: ${err}` })
    }
})

// получение информации о текущем пользователе
router.get('/me', async (req, res) => {
    try {
        const me_query  = 'SELECT * FROM user WHERE user_id = ?'
        const user_id   = req.user.user_id

        // достаем информацию о пользователе 
        const [user] = await database.query(me_query, [ user_id ])

        if (!user) res.status(404).json({ error: `404 [not found]: ${err}` })

        // конвертиуем фото пофиля и удаляем поля с важной информацией
        if (user.profile_image) user.profile_image = imageUtil.ConvertToBase64(user.profile_image)
        delete user.password

        res.status(200).json(user)
    }
    catch (err) {
        res.status(500).json({ error: err })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const delete_user_query = 'DELETE FROM user WHERE user_id = ?'
        const user_id = req.params.id
        
        await database.query(delete_user_query, [ user_id ])

        res.status(204).json({ message: 'deleted' })
    }
    catch (err) {
        res.status(400).json({ error: err })
    }
})

router.put('bio/:id', async (req, res) => {
    try {
        const user_id = req.params.id
        const { profile_name, profile_description } = req.body
        const update_user_query = 'UPDATE user SET user_name = ?, profile_name = ?, profile_description = ? WHERE user_id = ?'

        if (!user_name)
            return res.status(400).json({ message: 'Profile name is empty' })

        const user_name = `@_${profile_name.toLowerCase()}_${user_id}`

        await database.query(update_user_query, [ user_name, profile_name, profile_description, user_id ])

        res.status(204).json({ message: 'updated' })
    }
    catch (err) {
        res.status(500).json({ error: err })
    }
})

module.exports = router