const express = require('express')
const compression = require('compression')

const app = express()
app.use(compression())
app.use(express.static('../frontend/build', {maxage: '1h'}))
const port = 3000

app.get('/*', function(req, res) {
    res.sendFile('/index.html', {root: '../frontend/build'})
})

app.listen(port, () => {
    console.log(`Webserver listening at http://localhost:${port}`)
  })
