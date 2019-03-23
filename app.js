let express = require('express')
let path = require('path')
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileUpload = require('express-fileupload');
var cors = require('cors');

var blogRouter = require('./server/routes/blog');
var mediaRouter = require('./server/routes/media');


let app = express()
app.use(cors());
const port = 8080;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/')));
app.use(fileUpload());


app.use('/blog', blogRouter);
app.use('/media', mediaRouter);

app.get('/', (req, res, next) => {
    res.render('index.html');
});

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
module.exports = app; 