const bcrypt        = require('bcrypt')
const jwt           = require('jsonwebtoken')
const JWT_SECRET    = 'Asda5-weE4r-Tu0op-Cry5s'
const { createUser, selectUserByEmail } = require('./common/user.func')

const registerUser = async (req, res) => {
    try {
        const { email, password, user_name } = req.body
        if (!email || !password) return res.status(400).json({ message: 'empty fields' })

        const user = await selectUserByEmail({ email })
        if (user) return res.status(400).json({ messagee: "user already registered" })

        const hashedPassword = await bcrypt.hash(password, 11)
        const profile_name =  '@' + user_name.toLowerCase().split(' ').join('')

        await createUser({ email, password: hashedPassword, user_name, profile_name })
        res.status(201).json({ message: 'Created' })
    } catch (error) {
        res.status(500).json({ error })
    }
}
const authorizeUser = async (req, res) => {
    try {
        const { email, password } = req.body 
        if (!email || !password) return res.status(400).json({ error: 'Empty fields' })

        const user = await  selectUserByEmail({ email })
        if (!user) return res.status(404).json({ error: 'invalid login'})

        const is_password_valid = await bcrypt.compare(password, user.password)
        if (!is_password_valid) return res.status(400).json({ error: 'invalid password' })
                
        delete user.password

        const token_access  = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' })
        const token_refresh = jwt.sign(user, JWT_SECRET, { expiresIn: '2h' })
        
        res.status(200).json({ access: token_access, refresh: token_refresh })
    } catch (error) {
        res.status(500).json({ error })
    }
}
const refreshToken = async (req, res) => {
    try {
        const { refresh } = req.body
        const user = jwt.verify(refresh, JWT_SECRET)
        
        delete user.iat
        delete user.exp
        
        const token_access  = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' })
        const token_refresh = jwt.sign(user, JWT_SECRET, { expiresIn: '2h' })

        res.status(200).json({ access: token_access, refresh: token_refresh })
    } catch (error) {
        res.status(500).json({ error })
    }
}

module.exports = {
    registerUser,
    authorizeUser,
    refreshToken,
}