const { Router }    = require('express')
const database      = require('../database/db.connect')
const router        = new Router()

router.use(require('../middleware/auth.middleware'))

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

// router.post('/update/:id', async (req, res) => {
//     try {
   
//     }
//     catch {

//     }
// })

module.exports = router