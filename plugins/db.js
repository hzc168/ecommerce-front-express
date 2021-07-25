module.exports = app => {
    const mongoose = require("mongoose")
    mongoose.connect('mongodb://127.0.0.1:27017/ecommerce-front', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, err => {
        if (err) {
            console.log("连接失败", err);
        } else {
            console.log("连接成功");
        }
    })

    require('require-all')(__dirname + '/../models')
}