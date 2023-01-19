const { Router }    = require('express')
const database      = require('../database/db.connect')
const router        = new Router()

router.get('/', async (req, res) => {
    try {
        const users = await database.query('SELECT * FROM `users`')
        res.json( users )
    }
    catch (err) {
        res.status(500).json({message: `ERROR: ${err}`})
    }
})

router.get('/:id', async (req, res) => {
    try {
        let user_id = req.params.id
        const [user] = await database.query(`SELECT * FROM users WHERE id = ${user_id}`)
        res.status(200).json(user)
    }
    catch (err) {
        res.status(404).json({ error: `404 [not found]: ${err}` })
    }
})

router.post('/reg', async (req, res) => {
    try {
        const { email, password } = req.body
    
        if (!email || !password ) return res.status(400).json({ error: 'Empty fields!' })
    
        const is_registered = await database.query(`SELECT count(id) as count FROM users WHERE email='${email}'`)

        if (is_registered[0].count) return res.status(400).json({ error: 'User already registered' })
    
        const query = `INSERT INTO users (id, email, password, profile_image, username) VALUES (${null}, '${email}', '${password}', ${null}, '${'Username'}')`
        await database.query(query)

        res.status(201).json({ message: 'Created' })
    }
    catch (err) {
        res.status(400).json({ error: err })
    }
})



module.exports = router
