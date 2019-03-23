let express = require('express');
let router = express.Router();

router.post('/', (req, res, next)=> {
    const file = req.files['files[]'];

    if (Object.keys(file).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const fileName = fileNameGenerater(file.name);
    const fileType = file.mimetype.includes('image')? 'img' : 'mov'; 

    if(fileType === 'img') {
        file.mv(`./assests/medias/images/${fileName}`, function(err) {
            if (err)
            return res.status(500).send(err);

            const resData = {type: fileType, url: `${req.headers.host}/medias/images/${fileName}`}
            
            res.send(resData);
        });
    } else {
        file.mv(`./assests/medias/videos/${fileName}`, function(err) {
            if (err)
            return res.status(500).send(err);

            const resData = {type: fileType, url: `${req.headers.host}/medias/videos/${fileName}`}
            res.send(resData);
        });
    }
    res.send('media upload request')
});

router.delete('/', (req, res) => {
    res.send('media delete action')
});

const fileNameGenerater = (oldName) => {
    const ext = oldName.split('.')[1];
    let name = Math.random().toString(36).substring(7);
    return name+'.'+ext;
}

module.exports = router;