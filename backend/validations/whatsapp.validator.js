const Joi = require('joi');

const addWhatsappSchema = Joi.object({
  type: Joi.string().valid('channel', 'group').required(),
  name: Joi.string().min(3).max(100).required(),
  link: Joi.string().uri().required(),
  admin_name: Joi.string().min(2).max(100).required(),
  admin_number: Joi.string().pattern(/^[0-9+\-()\s]+$/).required(),
  admin_email: Joi.string().email().required(),
  purpose: Joi.string().min(3).required()
});


// 🔁 For update: all fields optional, but still validated
const updateWhatsappSchema = Joi.object({
  id: Joi.string().length(24).hex().required(),
  type: Joi.string().valid('channel', 'group'),
  name: Joi.string().min(3).max(100),
  link: Joi.string().uri(),
  admin_name: Joi.string().min(2).max(100),
  admin_number: Joi.string().pattern(/^[0-9+\-()\s]+$/),
  admin_email: Joi.string().email(),
  purpose: Joi.string().min(3).max(255)
}).min(1); // At least one field must be provided


// 🔁 For update: all fields optional, but still validated
const viewWhatsappSchema = Joi.object({
  id: Joi.string().length(24).hex().required()
})

module.exports = {
  addWhatsappSchema,
  updateWhatsappSchema,
  viewWhatsappSchema,
};
