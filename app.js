let express = require('express')
let path = require('path')

let app = express()
const port = 3000;
app.use(express.static(path.join(__dirname, '/')));


app.get('/', (req, res) => {
  res.sendFile('index.html', {root: __dirname })
})

app.listen(port, () => { console.log('You app running on', port) })