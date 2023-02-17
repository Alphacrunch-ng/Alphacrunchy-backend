const cloudinary = require('../middlewares/cloudinary.js');
const { serverError } = require("../utils/services");


// controller for uploading images like converting the giftcard to url.
exports.uploadImage = async (req, res) => {
    try {
            const cloudFile = await cloudinary.uploader.upload(req.file.path,{folder: "Alphacrunch/images"});
            return res.status(201).json({
                data: cloudFile,
                status: 'success',
                message: 'image successfully uploaded.'
            })
    } catch (error) {
        return serverError(res, error);
    }
}

// controller for deleting uploaded images
exports.deleteUploadedImage = async (req, res) => {
    const {public_id} = req.body;
    console.log(public_id);
    try {
        const cloudFile = await cloudinary.uploader.destroy(public_id).then(result=>
            {
                console.log(result)
                return res.status(201).json({
                    data: result,
                    status: 'success',
                    message: 'image successfully deleted.'
                })
            });
    } catch (error) {
        return serverError(res, error);
    }
}


