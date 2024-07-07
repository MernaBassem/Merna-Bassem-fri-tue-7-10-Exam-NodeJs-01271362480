import Joi from "joi";
import { systemRoles } from "../../utils/system-roles.utils.js";

/* user schema validation all input before the arrive to api sign_up user
  the validation only data in body
*/
export const SignUpSchema = {
  body: Joi.object({
    firstName: Joi.string().min(3).max(15).required().messages({
      "string.min": "firstName should have a minimum length of 3 characters",
      "string.max": "firstName should have a maximum length of 15 characters",
      "any.required": "firstName is required",
      "string.base": "firstName must be a string",
    }),
    lastName: Joi.string().min(3).max(15).required().messages({
      "string.min": "lastName should have a minimum length of 3 characters",
      "string.max": "lastName should have a maximum length of 15 characters",
      "any.required": "lastName is required",
      "string.base": "lastName must be a string",
    }),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        maxDomainSegments: 4,
        tlds: { allow: ["com", "net", "org"] },
      })
      .required()
      .messages({
        "string.email": "Email is not valid",
        "any.required": "Email is required",
        "string.base": "Email must be a string",
      }),
    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must have at least one lowercase letter, one uppercase letter, one number and one special character",
        "any.required": "You need to provide a password",
        "string.min": "Password should have a minimum length of 3 characters",
        "string.base": "Password must be a string",
      }),
    recoveryEmail: Joi.string()
      .email({
        minDomainSegments: 2,
        maxDomainSegments: 4,
        tlds: { allow: ["com", "net", "org"] },
      })
      .required()
      .messages({
        "any.required": "Recovery Email",

        "string.email": "Recovery Email is not valid",
        "string.base": "Recovery Email must be a string",
      }),
    DOB: Joi.date().iso().messages({
      "date.base": "User birthDate is not valid",
      "date.format":
        "User birthDate must be in ISO 8601 date format (YYYY-MM-DD)",
    }),
    mobileNumber: Joi.string()
      .pattern(/^(\+20|0)?1[0125]\d{8}$/)
      .required()
      .messages({
        "string.pattern.base": "Mobile Number is Valid",
        "any.required": "You need to provide a mobile number",
        "string.base": "mobile number must be a string",
      }),
    role: Joi.string()
      .valid(...Object.values(systemRoles))
      .required()
      .messages({
        "any.only": "Role must be one of user or company_HR",
        "any.required": "Role is required",
      }),
    status: Joi.string().valid("online", "offline").messages({
      "any.only": "Status must be either online or offline",
    }),
  }),
};
//------------------------------------------------------
export const SignInSchema = {
  body: Joi.object({
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        maxDomainSegments: 4,
        tlds: { allow: ["com", "net", "org"] },
      }).messages({
        "string.email": "Email is not valid",
        "string.base": "Email must be a string",
        "any.required": "Email is required",
      }),
    mobileNumber: Joi.string()
      .pattern(/^(\+20|0)?1[0125]\d{8}$/)
      .messages({
        "string.pattern.base": "Mobile Number is Valid",
        "any.required": "You need to provide a mobile number",
        "string.base": "mobile number must be a string",
      }),
    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must have at least one lowercase letter, one uppercase letter, one number and one special character",
        "any.required": "You need to provide a password",
        "string.min": "Password should have a minimum length of 3 characters",
        "string.base": "Password must be a string",
      }),
  }).xor("email", "mobileNumber"),
};
//------------------------------------------------------------------