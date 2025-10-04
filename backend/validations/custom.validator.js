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
  url_address2: Joi.string().allow(null, ''), // allow null or empty string
  country: Joi.string().required(),
  server_account: Joi.string().custom(objectId).required(),
  cloudflore_account: Joi.string().custom(objectId).required(),
  domain_account: Joi.string().custom(objectId).required(),
  company_name: Joi.string().required(),
  company_master_account: Joi.string().custom(objectId).required(),
  company_agent_account: Joi.string().custom(objectId).required(),
});

module.exports = motherPanelValidationSchema;
