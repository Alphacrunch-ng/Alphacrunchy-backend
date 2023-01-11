
exports.serverError = async (res, error) => {
    return res.status(500).json({
        status: 'failed',
        message: 'An error occured, we are working on it',
        error: error.message
    });
}

exports.createOtp = () =>{
    return Math.floor(Math.random() * 900000) + 100000;
}