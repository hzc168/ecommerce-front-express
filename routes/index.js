module.exports = app => {
    const express = require('express')
    const router = express.Router({
        mergeParams: true
    })

    // 创建资源
    router.post('/', async(req, res) => {
        const model = await req.Model.create(req.body)
        res.send(model)
    })

    // 更新资源
    router.put('/:id', async(req, res) => {
        const model = await req.Model.findByyIdAndUpdate(req.params.id, req.body)
        res.send(model)
    })

    // 删除资源
    router.delete('/:id', async(req, res) => {
        await req.Model.findByIdAndDelete(req.params.id)
        res.send({
            success: true
        })
    })

    // 资源列表
    router.get('/', async(req, res) => {
        const items = await req.Model.find()
        res.send(items)
    })

    // 资源详情
    router.get('/:id', async(req, res) => {
        const model = await req.Model.findById(req.params.id)
        res.send(model)
    })

    // 中间件
    const resourceMiddleware = require('../middleware/resource')
    app.use('/api/:resource', resourceMiddleware(), router)

    // 错误处理函数
    app.use(async(err, req, res, next) => {
        res.status(err.statusCode || 500).send({
            message: err.message
        })
    })
}