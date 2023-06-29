const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const {Landmark, Location, Image} = require('../models');
const jwt = require("../services/jwt");
const {authenticateAdmin} = require('../services/authenticate')
const createUploadMiddleware = require('../services/multer');
const upload = createUploadMiddleware('uploads');
const {User} = require('../models');

router.post('/addLandmark',authenticateAdmin,upload.single('image'), async(req, res)=>{
    try{

        const newLocation = await Location.build({
            lat: req.body.lat,      
            long: req.body.long
        })

        const newImage = await Image.build({
            image: req.file.path
        })
        await newImage.save();
        await newLocation.save()
        if(newLocation && newImage) {

            const newLandmark = await Landmark.create({
                title: req.body.title,
                description: req.body.description,
                image_id: newImage.id,
                location_id: newLocation.id
            })
            console.log(newLandmark)
            if (newLandmark){
                res.redirect("/addplace")
            }
        }
    }catch (error){
        res.status(500).json({error: "error"})
    }
})
router.get('/getlandmarks',authenticateAdmin, async(req,res) => {
    try{
        const landmarks = await Landmark.findAll({
        include: ['image', 'location']
       });
        res.render("getlandmarks",{landmarks:landmarks});
    }catch{
        res.status(500).json({message: "something went wrong"});
    }
})
// router.get('/viewuser',authenticateAdmin, async(req,res) => {
//     try{
//         const users = await User.findAll({
//        });
//         res.render("viewuser",{users:users});
//     }catch{
//         res.status(500).json({message: "something went wrong"});
//     }
// })

module.exports = router
