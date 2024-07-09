// job controllers
/*
1. Add Job 
2. apply authorization with the role ( Company_HR )
*/

import Application from "../../../DB/Models/application.model.js";
import Company from "../../../DB/Models/company.model.js";
import Job from "../../../DB/Models/job.model.js";
import { ErrorClass } from "../../utils/error-class.utils.js";

/*
1. check token send
2- check user online
3- destruct 
4-Add Job
5- return created job

*/

export const addJob = async (req, res, next) => {
  // Ensure req.authUser exists
  if (!req.authUser) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send Token in headers",
        "add job API"
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
        "add job API"
      )
    );
  }

  // Destruct data from req.body
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    companyId,

  } = req.body;
  // check company exists
  const company = await Company.findById(companyId);
  if (!company) {
    return next(
      new ErrorClass("Company not found", 400, "Company not found", "add job API")
    );
  }
  // check companyHR in company is same as req.authUser._id
  if (company.companyHR.toString() !== req.authUser._id.toString()) {
    return next(
      new ErrorClass(
        "This job with this company cannot be added to the company owner companyHR is not same as req.authUser._id",
        400,
        "This job with this company cannot be added to the company owner companyHR is not same as req.authUser._id",
        "add job API"
      )
    );
  }
  // Create new job
  // create new company
  const jobInstance = new Job({
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    companyId,
    addedBy : req.authUser._id,
  });
  // save company
 const newJob = await jobInstance.save();

  // return created job
  return res.status(201).json({ newJob });
}
//---------------------------------------------------------
/*
2. Update Job
    - apply authorization with the role ( Company_HR )
*/
/*
1- check send token
2- check user online
3- check job exists
4- destruct
5- check addedBy is same as req.authUser
6- update Job
5- return updated job
*/


export const updateJob = async (req, res, next) => {
  // Ensure req.authUser exists
  if (!req.authUser) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send Token in headers",
        "update job API"
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
        "update job API"
      )
    );
  }

  // Destruct data from req.body
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    companyId

  } = req.body;
  // Check if job exists
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    return next(
      new ErrorClass("Job not found", 404, "Job not found", "update job API")
    );
  }
  // Check if addedBy is same as req.authUser
  if (job.addedBy.toString() !== req.authUser._id.toString()) {
    return next(
      new ErrorClass(
        "You are not authorized to update this job",
        403,
        "You are not authorized to update this job",
        "update job API"
      )
    );
  }
  // check companyId exist or not in company model
  const company = await Company.findById(companyId);
  if (!company) {
    return next(
      new ErrorClass("Company not found", 400, "Company not found", "update job API")
    );
  }
  // check companyHR in company is same as req.authUser._id
  if (company.companyHR.toString() !== req.authUser._id.toString()) {
    return next(
      new ErrorClass(
        "This job with this company cannot be added to the company owner",
        400,
        "This job with this company cannot be added to the company owner",
        "update job API"
      )
    );
  }
  // update Job use save
   if(jobTitle) job.jobTitle = jobTitle
   if(jobLocation) job.jobLocation = jobLocation
   if(workingTime) job.workingTime = workingTime
   if(seniorityLevel) job.seniorityLevel = seniorityLevel
   if(jobDescription) job.jobDescription = jobDescription
   if(technicalSkills) job.technicalSkills = technicalSkills
   if(softSkills) job.softSkills = softSkills
   if(companyId) job.companyId = companyId
   const updatedJob = await job.save();
   // return updated job
   return res.status(200).json({ updatedJob });
}
//---------------------------------------------------------
/*
3. Delete Job
    - apply authorization with the role ( Company_HR )
*/
/*
1- send token
2- check user online
3- check job exists
4- check addedBy is same as req.authUser
5- delete job
6- return deleted job
*/
export const deleteJob = async (req, res, next) => {
  // Ensure req.authUser exists
  if (!req.authUser) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send Token in headers",
        "delete job API"
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
        "delete job API"
      )
    );
  }

  // Check if job exists
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    return next(
      new ErrorClass("Job not found", 404, "Job not found", "delete job API")
    );
  }
  // Check if addedBy is same as req.authUser
  if (job.addedBy.toString() !== req.authUser._id.toString()) {
    return next(
      new ErrorClass(
        "You are not authorized to delete this job",
        403,
        "You are not authorized to delete this job",
        "delete job API"
      )
    );
  }

  // delete job
  const deletedJob = await Job.findByIdAndDelete(req.params.jobId);
  // delete application related to this job
  await Application.deleteMany({jobId: req.params.jobId});
  // return deleted job
  return res.status(200).json({ message : "Job deleted successfully",deletedJob });
}
//----------------------------------
/*
4. Get all Jobs with their company’s information.
    - apply authorization with the role ( User , Company_HR )
*/

/*
 1- check send token
 2- check user online
 3- get all jobs with their company’s information
 4- return all jobs
*/

export const getAllJobsAndCompanyInfo = async (req, res, next) => {
  // Ensure req.authUser exists
  if (!req.authUser) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send Token in headers",
        "get all jobs API"
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
        "get all jobs API"
      )
    );
  }
  // get all jobs with their company’s information
  const jobs = await Job.find().populate("companyId");
  // return all jobs
  return res.status(200).json({ count: jobs.length, jobs });
};

//-------------------------------------------------------------------
/*
5. Get all Jobs for a specific company.
    - apply authorization with the role ( User , Company_HR )
    - send the company name in the query and get this company jobs.
*/
/*
1- check send token
2- check user online
3- destructure query and get company name
4- get all jobs for a specific company
5- return all jobs
*/

export const getAllJobsForSpecificCompany = async (req, res, next) => {
  // Ensure req.authUser exists
  if (!req.authUser) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send Token in headers",
        "get all jobs for specific company API"
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
        "get all jobs for specific company API"
      )
    );
  }

  // destructure query
  const { companyName } = req.query;
  // check if company name is provided
  if (!companyName) {
    return next(
      new ErrorClass(
        "Company name is required",
        400,
        "Send Company name in query",
        "get all jobs for specific company API"
      )
    );
  }
  // find company name id
  const company = await Company.findOne({ companyName });
  if (!company) {
    return next(
      new ErrorClass(
        "Company not found",
        404,
        "Company not found",
        "get all jobs for specific company API"
      )
    );
  }

  // get all jobs for a specific company
  const jobs = await Job.find({ companyId: company._id }).populate("companyId");
  // if length job 0 
  if (jobs.length === 0) {
    return next(
      new ErrorClass(
        "No jobs found for this company",
        404,
        "No jobs found for this company",
        "get all jobs for specific company API"
      )
    );
  }
  // return all jobs  
  return res.status(200).json({ count: jobs.length, jobs });
};


//-------------------------------------------------------------------
// 6. Filter Jobs
/*
1- check send token
2- check user online
 - allow user to filter with workingTime , jobLocation , 
    seniorityLevel and jobTitle,technicalSkills
3- get all jobs that match the following filters 
4- return all jobs
*/

export const filterJobs = async (req, res,next) => {
    
  // Ensure req.authUser exists
  if (!req.authUser) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send Token in headers",
        "filter jobs API"
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
        "filter jobs API")
    );
  }
   // destructure query
    const { 
        workingTime,
         jobLocation,
          seniorityLevel, 
          jobTitle, 
          technicalSkills 
        } = req.query;
    // create filters
    let filters = {};
    // check workingTime exists
    if (workingTime) {
        filters.workingTime = workingTime;
    }
     //check jobLocation exists
    if (jobLocation) {
        filters.jobLocation = jobLocation;
    }
// check seniorityLevel exists
    if (seniorityLevel) {
        filters.seniorityLevel = seniorityLevel;
    }
// check jobTitle exists
    if (jobTitle) {
        filters.jobTitle = { $regex: jobTitle, $options: 'i' }; // Case-insensitive search
    }
// check technicalSkills exists
    if (technicalSkills) {
        filters.technicalSkills = { $all: technicalSkills.split(',') }; // Match all specified skills
    }
    const jobs = await Job.find(filters);
    return res.status(200).json({ count: jobs.length, jobs });
};
//---------------------------------------------------
/*
7. Apply to Job
    - This API will add a new document in the application Collections with the new data
    - apply authorization with the role ( User )

Application :
1. jobId ( the Job Id )
2. userId ( the applier Id )
3. userTechSkills ( array of the applier technical Skills )
4. userSoftSkills ( array of the applier soft Skills )

*/

/*
1- check send token
2- check user online
- destruct req.body
3- check job exists
3- create new application
4- return application
*/

export const applyToJob = async (req, res, next) => {
  // Ensure req.authUser exists
  if (!req.authUser) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send Token in headers",
        "apply to job API"
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
        "apply to job API"
      )
    );
  }
  // destruct req.body
  const { jobId, userTechSkills, userSoftSkills } = req.body;
  // check job exists
  const job = await Job.findOne({ _id: jobId });
  if (!job) {
    return next(
      new ErrorClass(
        "Job not found",
        400,
        "Job not found",
        "apply to job API"
      )
    );
  }
  // create new application
  const application = new Application({
    jobId,
    userId: req.authUser._id,
    userTechSkills,
    userSoftSkills,
  });
  // save application
  await application.save();
  // return application
  return res.status(200).json({ application });
}