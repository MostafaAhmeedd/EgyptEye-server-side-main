const express = require('express');
const router = express.Router();

const {Landmark, Search, Favorite} = require('../models');
const {authenticateUser} = require('../services/authenticate');



router.post('/addfavorite', authenticateUser, async(req,res)=>{
    try{
        const existingFavorite = await Favorite.findOne({
            where: {
                user_id: req.user.id,
                landmark_id: req.body.landmark_id
            },
          });
          if (existingFavorite){
            await Favorite.destroy({
                where: {
                    user_id: req.user.id,
                    landmark_id: req.body.landmark_id
                },
              });
              res.status(200).json({ message: 'Removed from favorites' });
          }else{
            Favorite.create({
                user_id: req.user.id,
                landmark_id: req.body.landmark_id
            })
            res.status(200).json({message: 'added to favorie successfully'})
          }
    }catch{
        res.status(500).json({message: 'error'})
    }
})

router.get('/getfavorites', authenticateUser, async(req,res)=>{
    
    try{
        const landmarks = await Favorite.findAll({
            where: {
                user_id: req.user.id
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