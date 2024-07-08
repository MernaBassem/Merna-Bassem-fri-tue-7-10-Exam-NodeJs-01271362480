// company validation api
import Joi from "joi";

import {
  generalRules,
  objectIdValidation,
} from "../../utils/general-rules.utils.js";

// create company validation

export const CreateCompanySchema = {
  body: Joi.object({
    companyName: Joi.string().min(3).max(15).required().messages({
      "string.min": "companyName should have a minimum length of 3 characters",
      "string.max": "companyName should have a maximum length of 15 characters",
      "any.required": "companyName is required",
      "string.base": "companyName must be a string",
    }),
    description: Joi.string().min(3).required().messages({
      "any.required": "description is required",
      "string.base": "description must be a string",
      "string.min": "description should have a minimum length of 3 characters",
    }),
    industry: Joi.string().min(3).required().messages({
      "any.required": "industry is required",
      "string.base": "industry must be a string",
      "string.min": "industry should have a minimum length of 3 characters",
    }),
    address: Joi.string().min(3).required().messages({
      "any.required": "address is required",
      "string.base": "address must be a string",
      "string.min": "address should have a minimum length of 3 characters",
    }),
    // rang     match: /^[0-9]+-[0-9]+$/
    numberOfEmployees: Joi.string()
      .pattern(/^[0-9]+-[0-9]+$/)
      .required()
      .messages({
        "any.required": "numberOfEmployees is required",
        "string.base": "numberOfEmployees must be a string",
        "string.pattern.base":
          "numberOfEmployees must be a range such as 11-20",
      }),
    companyEmail: Joi.string()
      .email({
        minDomainSegments: 2,
        maxDomainSegments: 4,
        tlds: { allow: ["com", "net", "org"] },
      })
      .required()
      .messages({
        "string.email": "Company Email is not valid",
        "any.required": "Company Email is required",
        "string.base": "Company Email must be a string",
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
//-------------------------------------------------------
// update company schema validation
/**
 * 1- check body data
 * 2- check token in header
 * 3- check id in params
 */

export const UpdateCompanySchema = {
  body: Joi.object({
    companyName: Joi.string().min(3).max(15).messages({
      "string.min": "companyName should have a minimum length of 3 characters",
      "string.max": "companyName should have a maximum length of 15 characters",
      "string.base": "companyName must be a string",
    }),
    description: Joi.string().min(3).messages({
      "string.base": "description must be a string",
      "string.min": "description should have a minimum length of 3 characters",
    }),
    industry: Joi.string().min(3).messages({
      "string.base": "industry must be a string",
      "string.min": "industry should have a minimum length of 3 characters",
    }),
    address: Joi.string().min(3).messages({
      "string.base": "address must be a string",
      "string.min": "address should have a minimum length of 3 characters",
    }),
    numberOfEmployees: Joi.string()
      .pattern(/^[0-9]+-[0-9]+$/)
      .messages({
        "string.base": "numberOfEmployees must be a string",
        "string.pattern.base":
          "numberOfEmployees must be a range such as 11-20",
      }),
    companyEmail: Joi.string()
      .email({
        minDomainSegments: 2,
        maxDomainSegments: 4,
        tlds: { allow: ["com", "net", "org"] },
      })
      .messages({
        "string.email": "Company Email is not valid",
        "string.base": "Company Email must be a string",
      }),
  }),

  headers: Joi.object({
    token: Joi.string().required().messages({
      "string.base": "Token must be a string",
      "any.required": "Token is required",
    }),
    ...generalRules.headers,
  }),

  params: Joi.object({
    id: Joi.string()
      .custom(objectIdValidation, "Object Id Validation")
      .required()
      .messages({
        "any.required": "ID is required in params",
        "string.base": "ID must be a string",
      }),
  }),
};
//----------------------------------
// delete company schema validation
/**
 * 1- check token in header
 * 2- check id in params
 */
export const DeleteCompanySchema = {
  headers: Joi.object({
    token: Joi.string().required().messages({
      "string.base": "Token must be a string",
      "any.required": "Token is required",
    }),
    ...generalRules.headers,
  }),


  params: Joi.object({
    id: Joi.string()
      .custom(objectIdValidation, "Object Id Validation")
      .required()
      .messages({
        "any.required": "ID is required in params",
        "string.base": "ID must be a string",
      }),
  }),

}