const express = require('express')
const bodyParser = require("body-parser")
const app = express()

app.set('secret', 'qwertyuiop')

app.use(require('cors')())
// app.use(express.json())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

require('./plugins/db')(app)

require('./routes')(app)

app.listen(3003, () => {
    console.log('http://localhost:3003');
})