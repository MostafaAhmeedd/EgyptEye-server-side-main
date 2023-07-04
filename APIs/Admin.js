const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const {Landmark, Location, Image} = require('../models');
const jwt = require("../services/jwt");
const {authenticateAdmin} = require('../services/authenticate')
const createUploadMiddleware = require('../services/multer');
const upload = createUploadMiddleware('uploads');
const {User} = require('../models');
const {uploadToSpace} = require('../services/awsSpace');

router.post('/addLandmark',authenticateAdmin,upload.single('image'), async(req, res)=>{
  try{

      const newLocation = await Location.build({
          lat: req.body.lat,      
          long: req.body.long
      })
      console.log(1000)
      // upload to space
      let file = req.file
      const imgUrl = await uploadToSpace(file)
      console.log(imgUrl)
      console.log("url")


      const newImage = await Image.build({
          image: imgUrl
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

          if (newLandmark){
            const referringPage = req.headers.referer;
            const alertMessage = "Landmark added successfully!!";
            res.send(`
            <script>
                alert("${alertMessage}");
                window.location.href = "${referringPage}";
            </script>
        `);
          }
      }
  }catch (error){
    console.log(error,"fisfhiuhfueirf")
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
        const referringPage = req.headers.referer;
        const alertMessage = "User deleted successfully!";
        res.send(`
            <script>
                alert("${alertMessage}");
                window.location.href = "${referringPage}";
            </script>
        `);
    } catch (error) { 
        res.status(500).json({ error });
    }
});
router.get('/editplace/:landmarkId',authenticateAdmin, async(req,res) => {
  try{
      const landmarkId = req.params.landmarkId;
      const landmark = await Landmark.findOne({
        where: { id: landmarkId },
        include: ['image', 'location']
      });
      if (landmark) {
        res.render("editplace", { landmark: landmark });
      } else {
        res.status(404).json({ message: 'Landmark not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong' });
    }
})
router.post('/editplace/:landmarkId', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    const landmarkId = req.params.landmarkId;
    const landmark = await Landmark.findByPk(landmarkId, {
      include: ['image', 'location'],
    });

    if (landmark) {
      landmark.title = req.body.title;
      landmark.description = req.body.description;
      landmark.location.long = req.body.long;
      landmark.location.lat = req.body.lat;

      if (req.file) {
        let file = req.file
        const imgUrl = await uploadToSpace(file)
        console.log(imgUrl)
        // landmark.image.image = req.file.path;
        landmark.image.image = imgUrl;
      }
      await landmark.image.save();
      
      await landmark.location.save();
      await landmark.save();

      const alertMessage = "Landmark edited successfully!";
      const referringPage = "/APIs/getlandmarks";
      res.send(`
          <script>
              alert("${alertMessage}");
              window.location.href = "${referringPage}";
          </script>
      `);
    } else {
      res.status(404).json({ message: 'Landmark not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});
  router.post('/delete-landmark/:id', authenticateAdmin, async (req, res) => {
    try {
        const landmarkId = req.params.id;
        const landmark = await Landmark.findByPk(landmarkId, {
          include: ['image', 'location']
        });
    

        if (!landmark) {
            return res.status(404).json({ message: "Landmark not found" });
        }
        const image = landmark.image;
        const location = landmark.location;
        await landmark.update({ image_id: null, location_id: null });
        await landmark.destroy();
        if (image) {
          await image.destroy();
        } 
        if (location) {
          await location.destroy();
        }
        const referringPage = req.headers.referer;
        const alertMessage = "Landmark Deleted successfully!";
        res.send(`
            <script>
                alert("${alertMessage}");
                window.location.href = "${referringPage}";
            </script>
        `);
    } catch (error) {
        res.status(500).json({ error });
    }
});

module.exports = router
