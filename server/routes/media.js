let express = require('express');
let router = express.Router();

router.post('/:id', (req, res, next)=> {
   res.send('media upload request')
});

router.delete('/:id', (req, res) => {
    console.log(req.params)
    res.send('media delete action')
});

module.exports = router;
