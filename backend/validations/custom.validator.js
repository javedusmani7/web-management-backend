const Joi = require('joi');
const mongoose = require('mongoose');

// Custom ObjectId validator for Joi
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

const motherPanelValidationSchema = Joi.object({
  name: Joi.string().required(),
  url_address1: Joi.string().required(),
  url_address2: Joi.string().allow(null, ''), 
  country: Joi.string().required()
});

module.exports = motherPanelValidationSchema;
