/**
 * 1. Add company 
    - apply authorization with role ( Company_HR )
 */

import Company from "../../../DB/Models/company.model.js";
import { ErrorClass } from "../../utils/error-class.utils.js";

/**
 * 1- check token send
 * 2- add company
 * 3- return company added
 */

export const createCompany = async (req, res, next) => {
  // Ensure req.authUser exists
  if (!req.authUser) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send Token in headers",
        "update account API"
      )
    );
  }

  // Check if the user is online
  if (req.authUser.status !== "online") {
    return next(
      new ErrorClass(
        "User must be online",
        400,
        "User must be online",
        "update account API"
      )
    );
  }

  // destruct data from body

  const {
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
  } = req.body;

  // check companyEmail unique
  const isCompanyEmail = await Company.findOne({ companyEmail });
  // check isCompanyEmail
  if (isCompanyEmail) {
    return next(
      new ErrorClass(
        "Company Email already exists",
        400,
        companyEmail,
        "create company api"
      )
    );
  }
  // create new company
  const companyInstance = new Company({
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
    companyHR: req.authUser._id,
  });
  // save company
  await companyInstance.save();
  // return company
  return res.status(201).json({ company: companyInstance });
};
//----------------------------------------------------------
/**
2. Update company data
    - only the company owner can update the data
    - apply authorization with role (  Company_HR )
*/
/**
 * 1- check token send
 * 2- check id in params
 * 3- check company exists
 * 4- apply authorization
 * 5- check company owner
 * 6- check owner online 
 * 7- update company
 * 8- return updated company
 * 
 *  
 * 
 */

export const updateCompany = async (req, res, next) => {
  // Ensure req.authUser exists
  if (!req.authUser) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send Token in headers",
        "update account API"
      )
    );
  }
  // check send id company in params
  if (!req.params.id) {
    return next(
      new ErrorClass(
        "Company ID is required",
        400,
        "Send Company ID in params",
        "update account API"
      )
    );
  }
  // Check if the user is online
  if (req.authUser.status !== "online") {
    return next(
      new ErrorClass(
        "User must be online",
        400,
        "User must be online",
        "update account API"
      )
    );
  }

  // Check if the company exists
  const company = await Company.findById(req.params.id);
  if (!company) {
    return next(
      new ErrorClass(
        "Company not found",
        404,
        "Company not found",
        "update account API"
      )
    );
  }

  // Check if the company owner
  if (company.companyHR.toString() !== req.authUser._id.toString()) {
    return next(
      new ErrorClass(
        "No one other than the owner is allowed to updated this company",
        403,
        "No one other than the owner is allowed to updated this company",
        "update account API"
      )
    );
  }

  // destruct data from body
  const {
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
  } = req.body;
  // check companyEmail unique
  const isCompanyEmail = await Company.findOne({ companyEmail });
  // check isCompanyEmail
  if (isCompanyEmail) {
    return next(
      new ErrorClass(
        "Company Email already exists",
        400,
        companyEmail,
        "create company api"
      )
    );
  }
  // Update company fields if they are provided, otherwise retain old values
  if (companyName) company.companyName = companyName;
  if (description) company.description = description;
  if (industry) company.industry = industry;
  if (address) company.address = address;
  if (numberOfEmployees) company.numberOfEmployees = numberOfEmployees;
  // save company
  await company.save();
  // return company
  return res.status(201).json({ message : "Updated company", company });
}