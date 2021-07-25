const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name: { type: String },
    email: { type: String },
    password: { type: String },
    message: { type: String },
})

module.exports = mongoose.model('Sign', schema)