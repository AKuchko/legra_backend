const { Router }    = require('express')
const bcrypt        = require('bcrypt')
const jwt           = require('jsonwebtoken')
const database      = require('../database/db.connect')

const JWT_SECRET    = 'Asda5-weE4r-Tu0op-Cry5s'
const router        = new Router()

router.post('/reg', async (req, res) => {
    try {
        const check_register_query  = 'SELECT count(user_id) as count FROM user WHERE email = ?'
        const insert_user_query     = 'INSERT INTO user VALUES (?, ?, ?, ?, ?, ?, ?)'

        const { email, password } = req.body

        if (!email || !password ) 
            return res.status(400).json({ error: 'Empty fields!' })
    
        const is_registered = await database.query(check_register_query, [ email ])

        if (is_registered[0].count) 
            return res.status(400).json({ error: 'User already registered' })

        const hash = await bcrypt.hash(password, 11)

        await database.query(insert_user_query, [ null, email, hash, 'Username', '@_username', null, null ])

        res.status(201).json({ message: 'Created' })
    }
    catch (err) {
        res.status(500).json({ error: err })
    }
})

router.post('/login', async (req, res) => {
    try {
        const select_user_query = 'SELECT * FROM user WHERE email = ?'
        
        const { email, password } = req.body 
        if (!email || !password) return res.status(400).json({ error: 'Empty fields' })

        const [user] = await database.query(select_user_query, [ email ])
        if (!user) return res.status(404).json({ error: 'invalid login'})

        const is_password_valid = await bcrypt.compare(password, user.password)
        if (!is_password_valid) return res.status(400).json({ error: 'invalid password' })
                
        delete user.password
        delete user.profile_image

        const token_access  = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' })
        const token_refresh = jwt.sign(user, JWT_SECRET, { expiresIn: '2h' })
        
        res.status(200).json({ access: token_access, refresh: token_refresh })
    }
    catch (err) {
        res.status(400).json({ error: err })
    }
})

router.post('/refresh', async (req, res) => {
    try {
        const { refresh } = req.body
        const user = jwt.verify(refresh, JWT_SECRET)
        
        delete user.iat
        delete user.exp
        
        const token_access  = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' })
        const token_refresh = jwt.sign(user, JWT_SECRET, { expiresIn: '2h' })

        res.status(200).json({ access: token_access, refresh: token_refresh })
    }
    catch (err) {
        res.status(406).json({ error: 'token is invalid' })
    }
})

module.exports = router

