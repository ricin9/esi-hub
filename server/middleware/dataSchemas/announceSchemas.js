const joi = require('joi')

const options = {
  abortEarly: false,
  stripUnknown: true
}
const createSchema = joi.object().keys({
  title: joi.string().min(3).max(128).required(),
  body: joi.string().min(1).max(1024).required(),
  tags: joi.array().items(joi.string()).default([]),
  visibility : joi.array().items(joi.string()).default([])
}).options(options)

const updateSchema = joi.object().keys({
  title: joi.string().min(3).max(128),
  body: joi.string().min(1).max(1024),
  tags: joi.array().items(joi.string()),
  visibility : joi.array().items(joi.string())
}).options(options)

module.exports = {
  createSchema,
  updateSchema
}