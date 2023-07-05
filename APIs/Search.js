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

// router.get('/getlandmark/image', upload.single('image'), async(req,res)=>{


//     const projectDir = process.cwd();

//     let pyshell = new PythonShell(`${projectDir}/Model/Script.py`);
    
//         // sends a message to the Python script via stdin
//         pyshell.send(path.join(projectDir, req.file.path));
    
//         pyshell.on('message', async function (message) {
//         // received a message sent from the Python script (a simple "print" statement)
//         // res.json({result: message})
    
//             try{
//                 const landmark = await Landmark.findOne({
//                     where: {
//                     title: req.query.title
//                     },
//                     include: ['image', 'location']
//                 });
    
//                 if (landmark){
//                     Search.create({
//                         person_id: req.user.id,
//                         landmark_id: landmark.id
//                     })
//                     res.status(200).json({landmark})
//                 }else{
//                     res.status(404).json({message: 'not found'})
//                 }
    
//             }catch{
//                 res.status(500).json({message: 'error'})
    
//             }
//         });
    
//         // end the input stream and allow the process to exit
//         pyshell.end(function (err,code,signal) {
//         if (err) throw err;
//         console.log('The exit code was: ' + code);
//         console.log('The exit signal was: ' + signal);
//         console.log('finished');
//         });
//     })


router.get('/getlandmark/image', upload.single('image'), async (req, res) => { //test bas mn chatgbt el main fo2 ma3molo comment
  const projectDir = process.cwd();

  let pyshell = new PythonShell(`${projectDir}/Model/Script.py`);

  // Sends a message to the Python script via stdin
  pyshell.send(path.join(projectDir, req.file.path));

  pyshell.on('message', function (message) {
    return new Promise(async (resolve, reject) => {
      try {
        const landmark = await Landmark.findOne({
          where: {
            title: req.query.title,
          },
          include: ['image', 'location'],
        });

        if (landmark) {
          Search.create({
            person_id: req.user.id,
            landmark_id: landmark.id,
          });
          res.status(200).json({ landmark });
        } else {
          res.status(404).json({ message: 'Not found' });
        }
        resolve();
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred' });
        reject(error);
      }
    });
  });

  // End the input stream and allow the process to exit
  pyshell.end(function (err, code, signal) {
    if (err) throw err;
    console.log('The exit code was: ' + code);
    console.log('The exit signal was: ' + signal);
    console.log('Finished');
  });
});


router.get('/gethistory', authenticateUser, async(req,res)=>{
    
    try{
        const landmarks = await Search.findAll({
            where: {
                person_id: req.user.id
            },
            include: ['landmarks'],
            attributes: []
        })
        res.status(200).json({landmarks})
    }catch{
        res.status(500).json({message: 'error'})
    }
})

module.exports = router;