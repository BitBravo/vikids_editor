let express = require('express');
let router = express.Router();

router.post('/contents', (req, res, next)=> {
   res.send('contents save action')
});

router.post('/comments', (req, res) => {
    console.log(req.body)
    res.send('comments save action')
});

module.exports = router;
