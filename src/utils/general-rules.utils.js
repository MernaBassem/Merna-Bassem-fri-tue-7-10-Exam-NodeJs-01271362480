
import Joi from "joi";
import { Types } from "mongoose";

// validate ObjectId 
export const objectIdValidation = (value, helper) => {
  const isValid = Types.ObjectId.isValid(value);
  return isValid ? value : helper.message("Invalid ObjectId");
};

// general rules use in validation
export const generalRules = {
  objectId: Joi.string().custom(objectIdValidation),
  headers: {
    "content-type": Joi.string(),
    accept: Joi.string().valid("application/json"),
    "accept-encoding": Joi.string(),
    host: Joi.string(),
    "content-length": Joi.string(),
    "connection": Joi.string(),
    "accept": Joi.string(),
    "user-agent": Joi.string(),
    "accept-language": Joi.string(),
    "accept-charset": Joi.string(),
    "postman-token": Joi.string(),
    "postman-id": Joi.string(),
  },
};
