const fs = require('fs')
const formidable = require('formidable')
const signModel = require('../models/Sign')
const productModel = require('../models/Product')
module.exports = app => {
    const express = require('express')
    const assert = require('http-assert')
    const jwt = require('jsonwebtoken')
    const bcrypt = require('bcrypt')

    const bodyParser = require('body-parser')
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }))

    const router = express.Router({
        mergeParams: true
    })

    // 创建资源
    router.post('/', async (req, res) => {
        if (req.Model.modelName === 'Product') {
            let Product = await req.Model;
            // 创建上传表单对象
            let form = new formidable.IncomingForm()
            // 保留原有文件后缀
            form.keepExtensions = true
            // 解析上传表单对象
            form.parse(req, (err, fields, files) => {
                // 上传失败
                if (err) return res.status(400).json({ error: '图片上传失败' })

                // 创建产品
                let product = new Product(fields)

                // 1kb = 1000
                // 1mb = 1000000

                // 如果上传了图像
                if (files.photo) {
                    // 如果图像大小超过了 10mb
                    if (files.photo.size > 10000000) {
                        // 响应
                        return res.status(400).json({ error: "图片大于了1mb" })
                    }
                    product.photo.data = fs.readFileSync(files.photo.path)
                    product.photo.contentType = files.photo.type
                }

                // 将产品插入数据库
                product.save((err, result) => {
                    // 如果插入失败
                    if (err) {
                        // 响应错误
                        return res.status(400).json({ error: errorHandler(err) })
                    }
                    // 响应产品
                    res.json(result)
                })

            })
            return;
        }
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
        console.log(req.Model.modelName)
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


    // 获取商品图片
    app.use('/api/products/photo/:id', async (req, res) => {
        const { id } = req.params;
        let data = await productModel.findOne({ _id: id })
        res.set("Content-Type", data.photo.contentType)
        return res.send(data.photo.data)
    })

    // 获取商品列表
    app.use('/api/products', async (req, res) => {
        const { order = "asc", sortBy = "_id", limit = '10' } = req.query
        let allowOrderValue = ["desc", "asc"]
        if (!allowOrderValue.includes(order))
            return res.status(400).json({ message: "请检查升降序参数" })

        productModel.find()
            .select('-photo')
            .populate('category')
            .sort([[sortBy, order]])
            .limit(parseInt(limit))
            .exec((error, products) => {
                if (error) return res.status(400).json({ message: "商品没有找到" })
                res.json(products)
            })
    })


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
        } catch (e) {
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
        } catch (e) {
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