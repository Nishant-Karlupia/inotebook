const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "computercseuiet";
const fetchuser=require("../middleware/finduser");// used every time to authenticate

// route 1: creating a user at "/api/auth"
router.post('/createUser', [
  body('name', "Enter name with min-length 3").isLength({ min: 3 }),
  body('email', "Enter a valid email-address").isEmail(),
  body('password').isLength({ min: 8 }),
], async (req, res) => {
  // return errors if exist
  let success=false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({success, errors: errors.array() });
  }
  // checking for existing user-email
  try {

    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({success, error: "User with same email already exists" });
    }
    // create new user
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);
    user = await User.create({
      name: req.body.name,
      password: secPass,
      email: req.body.email
    })
    const data = {
      user: {
        id: user.id
      }
    }
    success=true;
    const authToken = jwt.sign(data, JWT_SECRET);
    res.json({success, authToken });
  }
  catch (error) {
    // res.json({status:error});
    res.status(500).send("Internal server error!!!");
  }
})

// route 2: login user

router.post('/login', [
  body('email', "Enter a valid email-address").isEmail(),
  body("password", "Password can't be blank").exists()
], async (req, res) => {
  // return errors if exist
  let success=false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success,errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({success, error: "Login with right credentials" });
    }
    const passwordcmp = await bcrypt.compare(password, user.password);
    if (!passwordcmp) {
      return res.status(400).json({success, error: "Login with right credentials" });
    }
    const data = {
      user: {
        id: user.id
      }
    }
    success=true;
    const authToken = jwt.sign(data, JWT_SECRET);
    res.json({success, authToken });
  }
  catch (error) {
    // res.json({status:error});
    res.status(500).send("Internal server error!!!");
  }
})

// route 3 :get user details:login required
router.post('/getuser',fetchuser, async (req, res) => {
  try {
    const userid = req.user.id;
    const user = await User.findById(userid).select("-password");
    res.send(user);

  }
  catch (error) {
    // res.json({status:error});
    res.status(500).send("Internal server error!!!");
  }


})



module.exports = router;

