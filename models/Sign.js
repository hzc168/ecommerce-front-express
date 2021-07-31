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
    role: { type: Number, default: 0 },
})

module.exports = mongoose.model('Sign', schema)