const express = require('express');
const multer = require('multer');
const path = require('path');

module.exports = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb){
            cd(null,'../public/');
        },
        filename: function(req, file,cb){
            cb(null, new Date().toISOString()+"."+ file.extname());
        }
    }),
    fileFilter: (req, file, cb)=>{
        let fileSize = file.size();
        if (file.mimetype !== 'image/jpeg' || file.mimetype !== 'image/png') {
            cb({message:"This file type is not supported"}, false)
            return;
          }
        if (fileSize > 1024*1024) {
            cb({message:"file too large. File should be less than 1MB"},false);
            return;
        }
          cb(null, true);
    }
})

