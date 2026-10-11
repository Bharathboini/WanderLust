const Joi = require("joi");
module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().trim().required(),
    description: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().min(0).required(),
    location: Joi.string().required(),
    image: Joi.object({ url: Joi.string().uri().allow("") }).unknown(true),
  })
    .unknown(false)
    .required(),
});
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().trim().required(),
  }).required(),
});
