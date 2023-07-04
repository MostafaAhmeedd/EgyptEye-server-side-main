const {decodeToken} = require("./jwt");
const {User} = require('../models')

const authenticateAdmin = async(req,res,next) => {
    try{ 
        const token = req.cookies.token;
        req.headers["authenticate"] = token
        const decodedToken = decodeToken(req.headers["authenticate"])
        const user = await User.findByPk(decodedToken.id);

        if (user){
            if (user.type == "admin"){
                req.user = user;
                return next()
            }else{
                res.status(401).json({message:'unauthorized'})
            }
             
        }else{
            res.status(401).json({message:'didnot find it'})
        }
    }catch{
        res.status(403).json({message:'unauthorized'})
    }
}

const authenticateUser = async(req,res,next) => {
    try{
         const decodedToken = decodeToken(req.headers["authenticate"])
        const user = await User.findByPk(decodedToken.id);
        if (user){
            if (user.type == "user"){
                req.user = user;
                return next()
            }else{
                res.status(401).json({message:'unauthorized'})
            }
            
        }else{
            res.status(401).json({message:'didnot find it'})
        }
    }catch{
        res.status(403).json({message:'unauthorized'})
    }
}

module.exports = {authenticateAdmin, authenticateUser}