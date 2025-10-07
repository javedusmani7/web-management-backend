const Joi = require('joi');
const mongoose = require('mongoose');


const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

const addUserValidationSchema = Joi.object({
  user_name: Joi.string().min(1).max(100).required(),
  user_email: Joi.string().email().required(),
  userId: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  number: Joi.string().pattern(/^[0-9+ -]{7,15}$/).required(), // Adjust pattern as needed for phone numbers
  googleAuthVerification: Joi.boolean().required(),
  emailVerification: Joi.boolean().required(),
});


const updateUserValidationSchema = Joi.object({
  _id: Joi.string().custom(objectId).required(),
  data: Joi.object({
    user_name: Joi.string().min(1).max(100).required(),
    user_email: Joi.string().email().required(),
    userId: Joi.string().alphanum().min(3).max(30).required(),
    // password: Joi.string()
    //   .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,}$'))
    //   .message('Password must be at least 8 characters long, include uppercase, lowercase, number and special character')
    //   .required(),
    number: Joi.string()
      .pattern(/^[0-9+ -]{7,15}$/)
      .message('Number must be valid phone number format')
      .required(),
    googleAuthVerification: Joi.boolean().required(),
    emailVerification: Joi.boolean().required(),
  }).required(),
  googleOtp: Joi.string()   
    .pattern(/^[0-9]{6}$/)   // optional: ensure 6-digit numeric OTP
    .required(),
});

module.exports = {
  addUserValidationSchema,
  updateUserValidationSchema,
};
