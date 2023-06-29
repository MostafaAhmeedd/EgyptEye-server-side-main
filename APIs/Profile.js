const express = require('express');
const router = express.Router();

const {User} = require('../models');

const {authenticateUser, authenticateAdmin} = require('../services/authenticate');


router.get('/', (authenticateUser || authenticateAdmin), async(req,res)=>{
    res.status(200).json(req.user)
})

router.put('/edit', (authenticateUser || authenticateAdmin), async(req,res)=>{

    try{
        const user = await User.findByPk(req.user.id);

        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        if (req.body.firstName){
            user.firstName = req.body.firstName;
        }

        if (req.body.lastName){
            user.lastName = req.body.lastName;
        }

        if (req.body.email){
            user.email = req.body.email;
        }

        await user.save();

        res.status(200).json({ message: 'User data updated successfully' });

    }catch{
        res.status(500).json({ message: 'Internal server error' });
    }
    
})

module.exports = router;
