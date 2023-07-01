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
        console.log(newLocation)
        if(newLocation && newImage) {

            const newLandmark = await Landmark.create({
                title: req.body.title,
                description: req.body.description,
                image_id: newImage.id,
                location_id: newLocation.id
            })

            if (newLandmark){
                res.redirect("/addplace")
            }
        }
    }catch (error){
        res.status(500).json({error})
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
router.get('/profile-admin', authenticateAdmin, async (req, res) => {
    try {
      const user = await User.findOne({ where: { email: req.user.email } });
      if (user) {
        res.render("profile-admin", { user: user });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });
  router.get('/View-users', authenticateAdmin, async (req, res) => {
    try {
      const user = await User.findAll({ where: { type:'user'} });
      if (user) {
        res.render("viewuser", { user: user });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });
  router.post('/delete-user/:id', authenticateAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await user.destroy();
        const ALLusers = await User.findAll({ where: { type:'user'} });

        const referringPage = req.headers.referer;
        console.log(referringPage)
        res.redirect(referringPage);
    } catch (error) { 
        res.status(500).json({ error });
    }
});
  router.post('/delete-landmark/:id', authenticateAdmin, async (req, res) => {
    try {
        const landmarkId = req.params.id;

        // Find the landmark by its ID
        const landmark = await Landmark.findByPk(landmarkId, {
          include: ['image', 'location'] // Include associated tables for deletion
        });
    

        if (!landmark) {
            // If landmark not found, return an error
            return res.status(404).json({ message: "Landmark not found" });
        }
        // Delete the landmark and associated records
        await landmark.image_id.destroy();
        await landmark.location_id.destroy();
        await landmark.destroy();

        // Redirect or return a success message
        res.redirect("getlandmarks"); // Redirect to the landmarks page
        // Alternatively, you can return a JSON success message
        // res.status(200).json({ message: "Landmark deleted successfully" });
    } catch (error) {
        res.status(500).json({ error });
    }
});

module.exports = router
