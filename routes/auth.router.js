const { Router }    = require('express')
const bcrypt        = require('bcrypt')
const jwt           = require('jsonwebtoken')
const database      = require('../database/db.connect')

const router        = new Router()
const cookieOptions = {
    httpOnly: true,
}

router.post('/reg', async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password ) return res.status(400).json({ error: 'Empty fields!' })
    
        const is_registered = await database.query(`SELECT count(id) as count FROM users WHERE email='${email}'`)
        if (is_registered[0].count) return res.status(400).json({ error: 'User already registered' })

        const hash = await bcrypt.hash(password, 11)
        const query = `INSERT INTO users (id, email, password, profile_image, username) VALUES (${null}, '${email}', '${hash}', ${null}, '${'Username'}')`
        await database.query(query)

        res.status(201).json({ message: 'Created' })
    }
    catch (err) {
        res.status(400).json({ error: err })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body 
        if (!email || !password) return res.status(400).json({ error: 'Empty fields' })

        const [user] = await database.query(`SELECT * FROM users WHERE email='${email}'`)
        if (!user) return res.status(404).json({ error: 'invalid login'})
        if (!(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: 'invalid password' })
        
        delete user.password
        const token_access = jwt.sign(user, `${process.env.JWT_SECRET}`, { expiresIn: '5m' })
        const token_refresh = jwt.sign(user, `${process.env.JWT_SECRET}`, { expiresIn: '10m' })

        res.cookie('access', token_access, cookieOptions)
        res.cookie('refresh', token_refresh, cookieOptions)
        res.status(200).json({ access: token_access, refresh: token_refresh })
    }
    catch (err) {
        res.status(400).json({ error: err })
    }
})

router.get('/refresh', async (req, res) => {
    try {
        const refresh = req.cookies.refresh
        const user = jwt.verify(refresh, process.env.JWT_SECRET)

        const token_access = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '2m'})
        const token_refresh = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '5m'})

        res.cookie('access', token_access, cookieOptions)
        res.cookie('refresh', token_refresh, cookieOptions)
        res.status(200).json({ access: token_access, refresh: token_refresh })
    }
    catch (err) {

    }
})

module.exports = router

