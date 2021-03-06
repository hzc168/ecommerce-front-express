const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    category: { type: mongoose.SchemaTypes.ObjectId, ref: 'Category' },
    quantity: { type: Number },
    shipping: { type: Number },
    price: { type: Number },
    createdAt: { type: String },
    photo: {
        data: Buffer,
        contentType: String
    }
})

module.exports = mongoose.model('Product', schema)