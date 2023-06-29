const jwt = require('jsonwebtoken');

function generateToken(userId){
    const token = jwt.sign({id: userId}, "helloworld");
    return token;
}

function decodeToken(token){
    const decodedToken = jwt.verify(token, "helloworld");
    return decodedToken;
}

module.exports = {generateToken, decodeToken};