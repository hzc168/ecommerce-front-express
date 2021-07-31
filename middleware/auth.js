module.exports = options => {
    const assert = require('http-assert')
    const jwt = require('jsonwebtoken')
    const User = require('../models/Sign')

    return async (req, res, next) => {
        const token = String(req.headers.authorization || '').split(' ').pop()
        try {
            assert(token, 401, '请先登录')
        } catch (e) {
            return next(e)
        }
        const { id } = jwt.verify(token, req.app.get('secret'))
        try {
            assert(id, 401, 'id不正确，请先登录')
        } catch (e) {
            return next(e)
        }
        req.user = await User.findById(id)
        try {
            assert(req.user, 401, '请先登录')
        } catch (e) {
            return next(e)
        }
        await next()
    }
}