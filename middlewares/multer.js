const multer = require('multer');
const path = require('path');

module.exports = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb)=>{
      let ext = path.extname(file.originalname);
      if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.svg') {
        cb(new Error("This file type is not supported"), false)
        return;
      }
        if (file.size > 1024*1024) {
            cb({message:"file too large. File should be less than 1MB"},false);
            return;
        }
          cb(null, true);
    }
})

