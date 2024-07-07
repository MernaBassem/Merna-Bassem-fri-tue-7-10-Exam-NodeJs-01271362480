import Joi from "joi";

const objectIdValidation = (value, helper) => {
  const isValid = Types.ObjectId.isValid(value);
  return isValid ? value : helper.message("Invalid ObjectId");
};

export const generalRules = {
  objectId: Joi.string().custom(objectIdValidation),
  headers: {
    "content-type": Joi.string(),
    accept: Joi.string().valid("application/json"),
    "accept-encoding": Joi.string(),
    host: Joi.string(),
    "conetnt-length": Joi.string(),
    "user-agent": Joi.string(),
    "accept-language": Joi.string(),
    "accept-charset": Joi.string(),
    "postman-token": Joi.string(),
    "postman-id": Joi.string(),
  },
};
