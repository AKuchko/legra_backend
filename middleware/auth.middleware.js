const jwt = require('jsonwebtoken')
const JWT_SECRET = 'Asda5-weE4r-Tu0op-Cry5s'

function checkAuth(req, res, next) {
    const token = req.cookies.token
    try {
        const user = jwt.verify(token, JWT_SECRET)
        req.user = user
        next()
    }
    catch (err) {
        return res.status(401).json({ error: 'unathtorized' })
    }
    // jwt.verify(token, JWT_SECRET, (err, verifiedJWT) => {
    //     if (err) return res.status(401).json({ error: 'unathtorized' })
    //     else {
    //         req.user = verifiedJWT
    //         next()
    //     }
    // })
}

module.exports = checkAuth