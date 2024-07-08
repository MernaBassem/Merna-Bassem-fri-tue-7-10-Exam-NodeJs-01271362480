// job validation api
import Joi from "joi";
import {
  generalRules,
  objectIdValidation,
} from "../../utils/general-rules.utils.js";
// add job

export const AddJobSchema = {
  body: Joi.object({
    jobTitle: Joi.string().min(3).required().messages({
      "string.min": "jobTitle should have a minimum length of 3 characters",
      "any.required": "jobTitle is required",
      "string.base": "jobTitle must be a string",
    }),
    //resolve value of jobLocation enum: ["onsite", "remotely", "hybrid"],
    jobLocation: Joi.string()
      .valid("onsite", "remotely", "hybrid")
      .required()
      .messages({
        "any.only":
          "jobLocation must be one of the following: onsite, remotely, hybrid",
        "any.required": "jobLocation is required",
        "string.base": "jobLocation must be a string",
        "string.valid":
          "jobLocation must be one of the following: onsite, remotely, hybrid",
        "string.empty": "jobLocation cannot be empty",
      }),
    // resolve value of jobType enum: ["full-time", "part-time"]
    workingTime: Joi.string()
      .valid("full-time", "part-time")
      .required()
      .messages({
        "any.only":
          "workingTime must be one of the following: full-time, part-time",
        "any.required": "workingTime is required",
        "string.base": "workingTime must be a string",
        "string.valid":
          "workingTime must be one of the following: full-time, part-time",
        "string.empty": "workingTime cannot be empty",
      }),
    //resolve value of seniorityLevel enum: ["Junior", "Mid-Level", "Senior", "Team-Lead", "CTO"]
    seniorityLevel: Joi.string()
      .valid("Junior", "Mid-Level", "Senior", "Team-Lead", "CTO")
      .required()
      .messages({
        "any.only":
          "seniorityLevel must be one of the following: Junior, Mid-Level, Senior, Team-Lead, CTO",
        "any.required": "seniorityLevel is required",
        "string.base": "seniorityLevel must be a string",
        "string.valid":
          "seniorityLevel must be one of the following: Junior, Mid-Level, Senior, Team-Lead, CTO",
        "string.empty": "seniorityLevel cannot be empty",
      }),
    jobDescription: Joi.string().min(3).required().messages({
      "string.min":
        "jobDescription should have a minimum length of 3 characters",
      "any.required": "jobDescription is required",
      "string.base": "jobDescription must be a string",
    }),
    // technicalSkills valid array of string
    technicalSkills: Joi.array().required().messages({
      "any.required": "technicalSkills is required",
      "array.base": "technicalSkills must be an array",
      "string.base": "technicalSkills must be a string",
    }),
    // softSkills valid array of string
    softSkills: Joi.array().required().messages({
      "any.required": "softSkills is required",
      "array.base": "softSkills must be an array",
      "string.base": "softSkills must be a string",
    }),
  }),
  headers: Joi.object({
    token: Joi.string().required().messages({
      "string.base": "Token must be a string",
      "any.required": "Token is required",
    }),
    ...generalRules.headers,
  }),
};
//-------------------------------------------------------------------