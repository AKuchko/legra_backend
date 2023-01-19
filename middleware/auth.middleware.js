function checkAuth(req, res, next) {
    if (req.params.is_auth) {
        next()
    }
    else {
        res.json({ error: '401 not authorized' })
    }
}

module.exports = checkAuth