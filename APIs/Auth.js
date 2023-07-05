const express = require('express');
const router = express.Router();

const {User} = require('../models');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

const jwt = require("../services/jwt");

router.post("/signup", async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    try {
      const newUser = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        type: 'user',
        email: req.body.email, 
        password: hashedPassword,
        phoneNumber: req.body.phoneNumber
      });
  
      if (newUser) {
        const user = await User.findOne({ where: { email: req.body.email } });
        if (user) {
          const userId = user.id;
          const token = jwt.generateToken(userId);
          res.json({ token });
          console.log("Token:", token);
        } else {
          res.status(404).send('User not found');
        }
      } else {
        res.status(400).send('Error in creating new user');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error in creating user');
    }
  });



  router.post("/admin/signup", async (req, res) => {
    try {
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { email: req.body.email },
            { phoneNumber: req.body.phoneNumber }
          ]
        }
      });
  
      if (existingUser) {
        if (existingUser.email === req.body.email) {
          return res.send("<script>alert('Email already exists');window.location.href = '/admin-signup';</script>");
        } else {
          return res.send("<script>alert('Phone number already exists');window.location.href = '/admin-signup';</script>");
        }
      }
  
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
  
      const newUser = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        type: 'admin',
        email: req.body.email, 
        password: hashedPassword,
        phoneNumber: req.body.phoneNumber
      });
  
      if (newUser) {
        const userId = newUser.id;
        const token = jwt.generateToken(userId);
        res.render('login');
      } else {
        res.status(400).json({ error: 'Error in creating new user' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error in creating user' });
    }
  });
  router.post("/login", async(req, res) => {
    try{
      const user = await User.findOne({where: {email: req.body.email}});
      // console.log("iddddd", user)

      if (user){
        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (isPasswordMatch){
          const token = jwt.generateToken(user.id);
          res.cookie("token", token);
          res.redirect(`/main`);
          // res.json({token: token})
        }else{
          res.status(400).json({error: "Wrong Creditials"})
        }
      }else{
        res.status(404).json({ error: 'User not found' });
      }
    }catch{
      res.status(500).json({error: "Something went wrong"})
    }
  })


  router.post("/user/login", async(req, res) => {
    try{
      const user = await User.findOne({where: {email: req.body.email}});
      // console.log("iddddd", user)

      if (user){
        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (isPasswordMatch){
          const token = jwt.generateToken(user.id);
          res.json({token: token})
        }else{
          res.status(400).json({error: "Wrong Creditials"})
        }
      }else{
        res.status(404).json({ error: 'User not found' });
      }
    }catch{
      res.status(500).json({error: "Something went wrong"})
    }
  })

module.exports = router;
