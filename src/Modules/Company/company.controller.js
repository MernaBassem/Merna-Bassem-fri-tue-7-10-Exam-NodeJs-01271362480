/**
 * 1. Add company 
    - apply authorization with role ( Company_HR )
 */

import Application from "../../../DB/Models/application.model.js";
import Company from "../../../DB/Models/company.model.js";
import Job from "../../../DB/Models/job.model.js";
import { ErrorClass } from "../../utils/error-class.utils.js";

/**
 * 1- check token send
 * 2- check user online
 * 3- destruct
 * 4- add company
 * 5- return company added
 */

export const createCompany = async (req, res, next) => {
  // Ensure req.authUser exists
  if (!req.authUser) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send Token in headers",
        "update Company API"
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
        "update company API"
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
  // check companyName unique
  const isCompanyName = await Company.findOne({ companyName });
  // check isCompanyName
  if (isCompanyName) {
    return next(
      new ErrorClass(
        "Company Name already exists",
        400,
        companyName,
        "create company api"
      )
    );
  }
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
 */

export const updateCompany = async (req, res, next) => {
  // Ensure req.authUser exists
  if (!req.authUser) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send Token in headers",
        "update company API"
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
        "update company API"
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
        "update company API"
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
        "update company API"
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
        "update company API"
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
  // check companyName unique
  const isCompanyName = await Company.findOne({ companyName });
  // check isCompanyName
  if (isCompanyName) {
    return next(
      new ErrorClass(
        "Company Name already exists",
        400,
        companyName,
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
  return res.status(201).json({ message: "Updated company", company });
};
//---------------------------------------------------------
/**
 * 3. Delete company data
    - only the company owner can delete the data
    - apply authorization with role ( Company_HR)
 */

/**
 * 1- check token send
 * 2- check id in params
 * 3- check company exists
 * 4- apply authorization
 * 5- check company owner
 * 6- check owner online
 * 7- delete company
 * 8- return delete  company
 */

export const deleteCompany = async (req, res, next) => {
  // Ensure req.authUser exists
  if (!req.authUser) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send Token in headers",
        "Delete Company API"
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
        "Delete Company API"
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
        "Delete Company API"
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
        "Delete Company API"
      )
    );
  }

  // Check if the company owner
  if (company.companyHR.toString() !== req.authUser._id.toString()) {
    return next(
      new ErrorClass(
        "No one other than the owner is allowed to delete this company",
        403,
        "No one other than the owner is allowed to delete this company",
        "Delete Company API"
      )
    );
  }

  // delete company
  const deleteCompany = await Company.findByIdAndDelete(req.params.id);
  // delete job related to this company
  await Job.deleteMany({ companyId: req.params.id });
  // return company is delete
  return res
    .status(200)
    .json({ message: "Company deleted successfully", deleteCompany });
};

//--------------------------------------------
/*
4. Get company data 
    - send the companyId in params to get the desired company data
    - return all jobs related to this company
 */
/*
1-check token send
2- check user online
3-check id in params
4- check company exists
5- return company
*/


export const getCompany = async (req, res, next) => {
  // Ensure req.authUser exists
  if (!req.authUser) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send Token in headers",
        "get company API"
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
        "get company API"
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
        "get company API"
      )
    );
  }

  // Check if the company exists
  const company = await Company.findById(req.params.id).populate("jobs");
  if (!company) {
    return next(
      new ErrorClass(
        "Company not found",
        404,
        "Company not found",
        "get company API"
      )
    );
  }

  // return company
  return res.status(200).json({ message: "Company found", company });
}


//--------------------------------------------------
/**
 * 5. Search for a company with a name. 
    - apply authorization with the role ( Company_HR and User)
 */

/*
1- check token send
2- check name in params or query
3- check company exists
4- apply authorization
7- return company
*/

export const searchCompany = async (req, res, next) => {
  // Ensure req.authUser exists
  if (!req.authUser) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send Token in headers",
        "search company API"
      )
    );
  }

  // check name in params or query
  if (!req.params.name && !req.query.name) {
    return next(
      new ErrorClass(
        "Company name is required",
        400,
        "Send Company name in params or query",
        "search company API"
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
        "search company API"
      )
    );
  }

  // Check if the company exists
  const company = await Company.findOne({
    companyName: { $regex: req.params.name || req.query.name, $options: "i" },
  });
  if (!company) {
    return next(
      new ErrorClass(
        "Company not found",
        404,
        "Company not found",
        "search company API"
      )
    );
  }
  // return company
  return res.status(200).json({ company });
};

/*-------------------------------------------------------------------------------------- */
/*
6. Get all applications for specific Job
    - each company Owner can take a look at the applications for his jobs only, he has no access to other companies’ application
    - return each application with the user data, not the userId
    - apply authorization with role (  Company_HR )
*/
/*
1- check token send
2- check user online
3- check jobId in params
4- check job exists
5- check addedBy is same as req.authUser
6- get all application related to this job and user info
7- return all applications
*/

export const getApplications = async (req, res, next) => {
  // Ensure req.authUser exists
  if (!req.authUser) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send Token in headers",
        "get applications API"
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
        "get applications API"
      )
    );
  } 

  // check send id job in params
  if (!req.params.id) {
    return next(
      new ErrorClass(
        "Job ID is required",
        400,
        "Send Job ID in params",
        "get applications API"
      )
    );
  }

  // Check if the job exists
  const job = await Job.findById(req.params.id);
  if (!job) {
    return next(
      new ErrorClass(
        "Job not found",
        404,
        "Job not found",
        "get applications API"
      )
    );
  }

  // check addedBy is same as req.authUser
  if (job.addedBy.toString() !== req.authUser._id.toString()) {
    return next(
      new ErrorClass(
        "You don't have access to this job",
        400,
        "You don't have access to this job",
        "get applications API"
      )
    );
  }

  // get all application related to this job and user info
  const applications = await Application.find({ jobId: job._id }).populate(
    "jobId"
  ).populate("userId");
  if (!applications) {
    return next(
      new ErrorClass(
        "Applications not found",
        404,
        "Applications not found",
        "get applications API"
      )
    );
  }
  if(applications.length === 0){
    return res.status(200).json({message:"No applications found"});
  }
  // return all applications
  return res.status(200).json({count:applications.length ,applications });
};
