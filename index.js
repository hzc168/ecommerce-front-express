const express = require('express')
const app = express()

app.use(require('cors')())
app.use(express.json())

require('./plugins/db')(app)

require('./routes')(app)

app.listen(3003, () => {
    console.log('http://localhost:3003');
})