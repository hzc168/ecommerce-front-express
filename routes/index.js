const signModel = require('../models/Sign')
module.exports = app => {
    const express = require('express')
    const assert = require('http-assert')
    const jwt = require('jsonwebtoken')
    const bcrypt = require('bcrypt')

    const router = express.Router({
        mergeParams: true
    })

    // 创建资源
    router.post('/', async (req, res) => {
        const model = await req.Model.create(req.body)
        res.send(model)
    })

    // 更新资源
    router.put('/:id', async (req, res) => {
        const model = await req.Model.findByyIdAndUpdate(req.params.id, req.body)
        res.send(model)
    })

    // 删除资源
    router.delete('/:id', async (req, res) => {
        await req.Model.findByIdAndDelete(req.params.id)
        res.send({
            success: true
        })
    })

    // 资源列表
    router.get('/', async (req, res) => {
        const items = await req.Model.find()
        res.send(items)
    })

    // 资源详情
    router.get('/:id', async (req, res) => {
        const model = await req.Model.findById(req.params.id)
        res.send(model)
    })

    // 中间件
    const authMiddleware = require('../middleware/auth')
    const resourceMiddleware = require('../middleware/resource')
    app.use('/api/reset/:resource', authMiddleware(), resourceMiddleware(), router)

    app.use('/api/signin', async (req, res, next) => {
        const { email, password } = req.body
        // 1. 根据邮箱找用户
        const user = await signModel.findOne({ email }).select('+password')
        // if (!user) {
        //     res.status(422).send({ message: '用户不存在' });
        //     return;
        // }
        try {
            assert(user, 422, '用户不存在')
        } catch(e) {
            next(e)
        }
        // 2. 校验密码
        const isValid = require('bcrypt').compareSync(password, user.password)
        // if (!isValid) {
        //     res.status(422).send({ message: '密码错误' });
        //     return;
        // }
        try {
            assert(isValid, 422, '密码错误')
        } catch(e) {
            next(e)
        }
        // 3. 返回token
        const token = jwt.sign({ id: user._id }, app.get('secret'))
        res.send({ token, user })
        return
    })

    // 错误处理函数
    app.use(async (err, req, res, next) => {
        console.log("接收到错误")
        res.status(err.statusCode || 500).send({
            message: err.message
        })
    })
}