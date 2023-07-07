const express = require('express');
const router = express.Router();

const {Landmark, Search} = require('../models');
const {authenticateUser} = require('../services/authenticate');
const { Op } = require('sequelize');
const createUploadMiddleware = require('../services/multer');
const upload = createUploadMiddleware('searchesImages');
const { PythonShell } = require('python-shell');
const path = require('path');
const projectDir = process.cwd();


router.get('/landmark', authenticateUser, async(req,res)=>{
    
    try{
        let whereQuery = {};
        
        if (req.query.search) {
            whereQuery = {
                where: {
                    title: {
                        [Op.like]: `%${req.query.search}%`
                    }
                }
            };
        }

        let query = {
            attributes: ['id','title'],
            ...whereQuery //... is used to to spread the whereQuery in the query
        };
        const landmarks = await Landmark.findAll(query);
        console.log(landmarks)
        res.status(200).json({landmarks});
    }catch{
        res.json(500).json({message: 'server internal error'});
    }
})

router.get('/getlandmark', authenticateUser, async(req, res)=>{
    try{
        const landmark = await Landmark.findByPk(req.query.id, {
            include: ['image', 'location']
        })
        if (landmark){
            Search.create({
                person_id: req.user.id,
                landmark_id: landmark.id
            })
            res.status(200).json({landmark})
        }else{
            res.status(404).json({message: 'not found'})
        }
    }catch{
        res.status(500).json({message: 'error'})
    }
})
router.post('/getlandmark/image',authenticateUser, upload.single('image'), async(req,res)=>{

    const projectDir = process.cwd();
    let pyshell = new PythonShell(`${projectDir}/Model/Script.py`);
        // sends a message to the Python script via stdin
        pyshell.send(path.join(projectDir, req.file.path));
        pyshell.on('message', async function (message) {
            try {
                const title = message;
                const landmark = await Landmark.findOne({
                    where: {
                        // title: req.query.title
                        title: title
                    },
                    include: ['image', 'location']
                });
                // if (landmark) {
                    const search = await Search.create({
                        person_id: req.user.id,
                        landmark_id: landmark.id
                    });
                    res.status(200).json({ landmark });
                // } //else {
                //     res.status(404).json({ message: 'not found' });
                // }
            } catch (err) {
                console.log(err);
                res.status(500).json({ message: 'error' });
            }
        });
        // end the input stream and allow the process to exit
        pyshell.end(function (err,code,signal) {
        if (err) throw err;
        console.log('The exit code was: ' + code);
        console.log('The exit signal was: ' + signal);
        console.log('finished');
        });
    });
  
    router.get('/gethistory', authenticateUser, async (req, res) => {
        try {
          const landmarks = await Search.findAll({
            where: {
              person_id: req.user.id
            },
          });
          
          // Extract the title from the landmarks
        const landmarkIds = landmarks.map(landmark => landmark.landmark_id);
        const landmark = await Landmark.findAll({
        where: {
            id: landmarkIds
        },
        });

        res.status(200).json({ landmark});
        } catch (error) {
          res.status(500).json({ message: 'Error retrieving history' });
        }
      });
      
      

module.exports = router;