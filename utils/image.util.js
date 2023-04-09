const fs = require('fs')
const path = require('path')

class ImageUtil {
    readFile(_path) {
        fs.readFile(_path, (err, data)=>{
            // error handle
            if(err) {
                throw err;
            }
            
            // get image file extension name
            const extensionName = path.extname(_path);
            
            // convert image file to base64-encoded string
            const base64Image = Buffer.from(data, 'binary').toString('base64');
            
            // combine all strings
            const base64ImageStr = `data:image/${extensionName.split('.').pop()};base64,${base64Image}`;
        })
    }

    ConvertToBase64(_buff, _ext = 'image/jpeg') {
        const base64Image = Buffer.from(_buff, 'binary').toString('base64')
        const base64ImageStr = `data:${_ext};base64,${base64Image}`;
        return base64ImageStr
    }

    getDefaultImage() {
        return this.readFile('assets/gray.png')
    }
}


module.exports = new ImageUtil()