const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name: { type: String },
    email: { type: String },
    password: { 
        type: String,
        select: false,
        set(val) {
            return require('bcrypt').hashSync(val, 10)
        }
     },
    message: { type: String },
})

module.exports = mongoose.model('Sign', schema)