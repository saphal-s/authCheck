const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/UserModel");
const UserVerification = require("../models/UserVerification");

// email handler
const nodemailer = require("nodemailer");
// unique string
const { v4: uuidv4 } = require("uuid");
// evn variables
require("dotenv").config();

const createToken = (user) => {
  return jwt.sign({ user }, process.env.SECRET, {
    expiresIn: "2d",
  });
};

module.exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (name == "" || email == "" || password == "") {
    res.json({
      status: "FAILED",
      message: "Empty input fields!",
    });
  } else if (!emailRegex.test(email)) {
    res.json({
      status: "FAILED",
      message: "Invalid email entered!",
    });
  } else if (password.length < 8) {
    res.json({
      status: "FAILED",
      message: "Password is too short. Atleast 8 character required!",
    });
  } else {
    try {
      const checkUser = await User.findOne({ email });
      if (checkUser) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Email is already exit" }] });
      }
      //hash passowrd
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      try {
        const user = await User.create({
          name,
          email,
          password: hash,
        });
        const token = createToken(user);
        return res
          .status(200)
          .json({ msg: "Your account has been created", user, token });
      } catch (error) {
        return res.status(500).json({ errors: error });
      }
    } catch (error) {
      return res.status(500).json({ errors: error });
    }
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const matched = await bcrypt.compare(password, user.password);
      if (matched) {
        const token = createToken(user);
        return res.json({ msg: "Successfully login!", token });
      } else {
        return res
          .status(401)
          .json({ errors: [{ msg: "Passowrd is incorrect" }] });
      }
    } else {
      return res
        .status(404)
        .json({ errors: [{ msg: "User does not exit with that email" }] });
    }
  } catch (error) {
    return res.status(500).json({ errors: error });
  }
};
