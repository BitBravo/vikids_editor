let express = require('express');
let router = express.Router();

router.put('/contents', (req, res, next)=> {
   res.send('contents save action')
});

router.put('/comments', (req, res) => {
    console.log(req.body)
    res.send('comments save action')
});

module.exports = router;
