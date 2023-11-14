const EmailCode = require('../models/EmailCode.js');
const User = require('../models/User.js');
const catchError = require('../utils/catchError.js');
const sendEmail = require('../utils/sendEmail.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const getAll = catchError(async(req, res) => {
  const user = await User.findAll();
  return res.status(200).json(user);
});

const create = catchError(async(req, res) => {
  const { firstName, lastName, email, password, country, image, frontBaseUrl } = req.body;
  const encryptPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: encryptPassword,
    country,
    image
  });
  
  const code = require('crypto').randomBytes(32).toString("hex");

  await EmailCode.create({
    code,
    userId: user.id
  });

  const link = `${frontBaseUrl}/auth/verify_email/${code}`;

  await sendEmail({
    to: email,
    subject: "Verificate email for user app.",
    html: `
      <h1>Hello ${firstName} ${lastName}</h1>
      <a href="${link}">${link}</a>
      <br>
      <p>Thanks for sign up in User App.</p>
    `
  });
  return res.status(201).json(user);
});

const getOne = catchError(async(req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  return res.status(200).json(user);
});

const remove = catchError(async(req, res) => {
  const { id } = req.params;
  const user = await User.destroy({ where: { id } });
  return res.status(204).json(user);  
});

const update = catchError(async(req, res) => {
  const { id } = req.params;
  const { firstName, lastName, country, image } = req.body;
  const user = await User.update(
    { where: { id }, returning: true },
    { firstName, lastName, country, image }
  );
  return res.status(200).json(user[1][0]);
});

const verifyCode = catchError(async(req, res) => {
  const { code } = req.params;
  const emailCode = await EmailCode.findOne({ where: { code } }); 
  if(!emailCode) return res.status(401).json({ message: "Code not found." });
  const user = await User.findByPk(emailCode.userId);
  user.isVerified = true;
  await user.save();
  await emailCode.destroy();
  return res.json(user);
});

const login = catchError(async(req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if(!user) return res.status(401).json({ message: "Invalid credentials." });
  const isValid = await bcrypt.compare(password, user.password);
  if(!isValid) return res.status(401).json({ message: "Invalid credentials." });
  if(user.isVerified === false) return res.json({ message: "Your account is not verified" });

  const token = jwt.sign(
    { user },
    process.env.TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  return res.json({ user, token });
});

module.exports = {
  getAll,
  create,
  getOne,
  remove,
  update,
  verifyCode,
  login
}