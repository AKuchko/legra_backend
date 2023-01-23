const jwt = require('jsonwebtoken')

function checkAuth(req, res, next) {
    try {
        const token = req.cookies.access
        const user = jwt.verify(token,  `${process.env.JWT_SECRET}`)
        req.user = user
        next()
    }
    catch (err) {
        res.clearCookie('access')
        return res.status(401).json({ error: 'unathtorized' })
    }
}

module.exports = checkAuth