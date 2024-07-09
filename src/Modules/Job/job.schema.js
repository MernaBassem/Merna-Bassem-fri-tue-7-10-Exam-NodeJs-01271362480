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
    technicalSkills: Joi.array().items(Joi.string()).required().messages({
      "any.required": "technicalSkills is required",
      "array.base": "technicalSkills must be an array",
      "array.includes": "softSkills must be an array of strings",
    }),
    // softSkills valid array of string
    softSkills: Joi.array().items(Joi.string()).required().messages({
      "array.base": "softSkills must be an array",
      "any.required": "technicalSkills is required",

      "array.includes": "softSkills must be an array of strings",
    }),
    // companyId valid ObjectId
    companyId: Joi.string()
      .custom(objectIdValidation, "Object ID Validation")
      .required()
      .messages({
        "any.required": "companyId is required",
        "string.base": "companyId must be a string",
        "string.pattern": "companyId must be a valid ObjectId",
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

// Update job schema
export const UpdateJobSchema = {
  params: Joi.object({
    jobId: Joi.string().custom(objectIdValidation, "Object ID Validation").required().messages({
      "any.required": "Job ID is required",
      "string.base": "Job ID must be a string",
      "string.pattern": "Job ID must be a valid ObjectId",
    }),
  }),
  body: Joi.object({
    jobTitle: Joi.string().min(3).messages({
      "string.min": "jobTitle should have a minimum length of 3 characters",
      "string.base": "jobTitle must be a string",
    }),
    jobLocation: Joi.string()
      .valid("onsite", "remotely", "hybrid")
      .messages({
        "any.only": "jobLocation must be one of the following: onsite, remotely, hybrid",
        "string.base": "jobLocation must be a string",
        "string.empty": "jobLocation cannot be empty",
      }),
    workingTime: Joi.string()
      .valid("full-time", "part-time")
      .messages({
        "any.only": "workingTime must be one of the following: full-time, part-time",
        "string.base": "workingTime must be a string",
        "string.empty": "workingTime cannot be empty",
      }),
    seniorityLevel: Joi.string()
      .valid("Junior", "Mid-Level", "Senior", "Team-Lead", "CTO")
      .messages({
        "any.only": "seniorityLevel must be one of the following: Junior, Mid-Level, Senior, Team-Lead, CTO",
        "string.base": "seniorityLevel must be a string",
        "string.empty": "seniorityLevel cannot be empty",
      }),
    jobDescription: Joi.string().min(3).messages({
      "string.min": "jobDescription should have a minimum length of 3 characters",
      "string.base": "jobDescription must be a string",
    }),
    technicalSkills: Joi.array().items(Joi.string()).messages({
      "array.base": "technicalSkills must be an array",
      "array.includes": "technicalSkills must be an array of strings",
    }),
    softSkills: Joi.array().items(Joi.string()).messages({
      "array.base": "softSkills must be an array",
      "array.includes": "softSkills must be an array of strings",
    }),
    companyId: Joi.string()
      .custom(objectIdValidation, "Object ID Validation")
      .messages({
        "string.base": "companyId must be a string",
        "string.pattern": "companyId must be a valid ObjectId",
      }),
  }).min(1), // Require at least one field to update
  headers: Joi.object({
    token: Joi.string().required().messages({
      "string.base": "Token must be a string",
      "any.required": "Token is required",
    }),
    ...generalRules.headers,
  })
};

//----------------------------------
// delete job schema validation
/**
 * 1- check token in header
 * 2- check id in params
 */
export const DeleteJobSchema = {
  headers: Joi.object({
    token: Joi.string().required().messages({
      "string.base": "Token must be a string",
      "any.required": "Token is required",
    }),
    ...generalRules.headers,
  }),

  params: Joi.object({
    jobId: Joi.string()
      .custom(objectIdValidation, "Object Id Validation")
      .required()
      .messages({
        "any.required": "jobId is required in params",
        "string.base": "jobId must be a string",
      }),
  }),
};
//------------------------------------------------

// filter job schema validation
/**
 * 1- check token in header
 * 2- allow user to filter with workingTime , jobLocation , seniorityLevel and jobTitle,technicalSkills
 */
export const FilterJobSchema = {
  headers: Joi.object({
    token: Joi.string().required().messages({
      "string.base": "Token must be a string",
      "any.required": "Token is required",
    }),
    ...generalRules.headers,
  }),

  query: Joi.object({
    workingTime: Joi.string().valid("full-time", "part-time").messages({
      "any.only": "workingTime must be one of the following: full-time, part-time",
      "string.base": "workingTime must be a string",
      "string.empty": "workingTime cannot be empty",
    }),
    jobLocation: Joi.string().valid("onsite", "remotely", "hybrid").messages({
      "any.only": "jobLocation must be one of the following: onsite, remotely, hybrid",
      "string.base": "jobLocation must be a string",
      "string.empty": "jobLocation cannot be empty",
    }),
    seniorityLevel: Joi.string()
      .valid("Junior", "Mid-Level", "Senior", "Team-Lead", "CTO")
      .messages({
        "any.only": "seniorityLevel must be one of the following: Junior, Mid-Level, Senior, Team-Lead, CTO",
        "string.base": "seniorityLevel must be a string",
        "string.empty": "seniorityLevel cannot be empty",
      }),
    jobTitle: Joi.string().min(3).messages({
      "string.min": "jobTitle should have a minimum length of 3 characters",
      "string.base": "jobTitle must be a string",
    }),
    technicalSkills: Joi.array().items(Joi.string()).messages({
      "array.base": "technicalSkills must be an array",
      "array.includes": "technicalSkills must be an array of strings",
    }),
    softSkills: Joi.array().items(Joi.string()).messages({
      "array.base": "softSkills must be an array",
      "array.includes": "softSkills must be an array of strings",
    }),
  }).min(1).messages({
    "object.min": "At least one field is required send in query parameters sush as workingTime,jobLocation,seniorityLevel,jobTitle,technicalSkills,softSkills",
  }),
};
//----------------------------------------------------------
// schema apply job
/**
 * 1- check token in header
 * 2- check id in body { jobId, userTechSkills, userSoftSkills }
 */
export const ApplyJobSchema = {
  headers: Joi.object({
    token: Joi.string().required().messages({
      "string.base": "Token must be a string",
      "any.required": "Token is required",
    }),
    ...generalRules.headers,
  }),
  body: Joi.object({
    jobId: Joi.string()
      .custom(objectIdValidation, "Object Id Validation")
      .required()
      .messages({
        "any.required": "jobId is required in body",
        "string.base": "jobId must be a string",
      }),
    userTechSkills: Joi.array().required().items(Joi.string()).messages({
      "array.base": "userTechSkills must be an array",
      "array.includes": "userTechSkills must be an array of strings",
      "any.required": "userTechSkills is required in body",
    }),
    userSoftSkills: Joi.array().required().items(Joi.string()).messages({
      "array.base": "userSoftSkills must be an array",
      "array.includes": "userSoftSkills must be an array of strings",
      "any.required": "userSoftSkills is required in body",
    }),
  }),
};

//-----------------------
//get all jobs schema validation
/**
 * 1- check token in header
 */
export const GetAllJobsAndCompanyInfo = {
  headers: Joi.object({
    token: Joi.string().required().messages({
      "string.base": "Token must be a string",
      "any.required": "Token is required",
    }),
    ...generalRules.headers,
  }),
};
//------------------------------
// get all jobs schema validation specific company name
/*
1- check token in header
2- check company name in query
*/

export const GetAllJobsForSpecificCompanySchema = {
  headers: Joi.object({
    token: Joi.string().required().messages({
      "string.base": "Token must be a string",
      "any.required": "Token is required",
    }),
    ...generalRules.headers,
  }),
  query: Joi.object({
    companyName: Joi.string().required().messages({
      "string.base": "companyName must be a string",
      "any.required": "companyName is required in query",
    }),
  }),
};