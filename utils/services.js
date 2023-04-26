const crypto = require('crypto');

function generateRandomString(length) {
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,length);   // return required number of characters
}

exports.serverError = async (res, error) => {
    return res.status(500).json({
        success: false,
        message: 'An error occured, we are working on it',
        error: error.message
    });
}

exports.createOtp = () =>{
    return Math.floor(Math.random() * 900000) + 100000;
}

exports.createWalletNumber = (length) =>{
    return generateRandomString(length).toUpperCase();
}

exports.connectChat = (socket) => {
    socket.on('admin', (user)=>{
        socket.join(user);
        socket.on('chat', (message, user) => {
            console.log(message);
            console.log(user);
            socket.emit('chat', message);
        });
        console.log(`${user} has joined been connected`);
    })

    
}