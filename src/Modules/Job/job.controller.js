import { ErrorClass } from "../../utils/error-class.utils.js";

import Application from "../../../DB/Models/application.model.js";
import Company from "../../../DB/Models/company.model.js";
import Job from "../../../DB/Models/job.model.js";

// add job

/*
answer :
after authentication , authorization , validation

1- check user online
2- destruct  jobTitle,jobLocation,workingTime,seniorityLevel,jobDescription,technicalSkills,softSkills,companyId from req.body
3- check company exists
4- check companyHR in company is same as req.authUser._id
5- create new instance of Job
6- save new instance of Job
5- return created job
*/

export const addJob = async (req, res, next) => {
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
      new ErrorClass(
        "Company not found",
        400,
        "Company not found",
        "add job API"
      )
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

  // create new instance from Job
  const jobInstance = new Job({
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    companyId,
    addedBy: req.authUser._id,
  });

  // save company
  const newJob = await jobInstance.save();

  // return created job
  return res.status(201).json({ message: "Job added successfully", newJob });
};

//---------------------------------------------------------

// update Job

/*
answer :
after authentication , authorization , validation

1- check user online
2- check jobId in params
3- destruct jobTitle,jobLocation,workingTime,seniorityLevel,jobDescription, technicalSkillsToAdd, technicalSkillsToRemove,softSkillsToAdd,softSkillsToRemove ,companyId from req.body
4- check job exists 
5-check addedBy is same as req.authUser
6- if chang compayId then check company exists and companyHR in company is same as req.authUser._id
6- update Job
5- return updated job
*/

export const updateJob = async (req, res, next) => {
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
    technicalSkillsToAdd,
    technicalSkillsToRemove,
    softSkillsToAdd,
    softSkillsToRemove,
    companyId,
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
  if (companyId) {
    const company = await Company.findById(companyId);
    if (!company) {
      return next(
        new ErrorClass(
          "Company not found",
          400,
          "Company not found",
          "update job API"
        )
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
    job.companyId = companyId;
  }

  // update Job use save
  if (jobTitle) job.jobTitle = jobTitle;
  if (jobLocation) job.jobLocation = jobLocation;
  if (workingTime) job.workingTime = workingTime;
  if (seniorityLevel) job.seniorityLevel = seniorityLevel;
  if (jobDescription) job.jobDescription = jobDescription;

  // Dynamic updates for technicalSkills
  if (technicalSkillsToAdd) {
    job.technicalSkills = [
      ...new Set([...job.technicalSkills, ...technicalSkillsToAdd]),
    ]; // Add unique items
  }
  if (technicalSkillsToRemove) {
    job.technicalSkills = job.technicalSkills.filter(
      (skill) => !technicalSkillsToRemove.includes(skill)
    ); // Remove items
  }

  // Dynamic updates for softSkills
  if (softSkillsToAdd) {
    job.softSkills = [...new Set([...job.softSkills, ...softSkillsToAdd])]; // Add unique items
  }
  if (softSkillsToRemove) {
    job.softSkills = job.softSkills.filter(
      (skill) => !softSkillsToRemove.includes(skill)
    ); // Remove items
  }

  // save job
  const updatedJob = await job.save();
  
  // return updated job
  return res.status(200).json({message:"Job updated successfully", updatedJob });
};


//---------------------------------------------------------

// delete Job


/*
answer :
after authentication , authorization , validation

1- check user online
2- check jobId in params
3- check job exists
4- check addedBy is same as req.authUser
5- delete job
6- delete application related to job
6- return deleted job
*/

export const deleteJob = async (req, res, next) => {

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
  await Application.deleteMany({ jobId: req.params.jobId });

  // return deleted job
  return res
    .status(200)
    .json({ message: "Job deleted successfully", deletedJob });
};


//-------------------------------------------------------------------


// Get all Jobs with their company’s information.


/*
answer:
after authentication , authorization , validation

 1- check user online
 2- get all jobs with their company’s information
 3- return all jobs
*/

export const getAllJobsAndCompanyInfo = async (req, res, next) => {

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


//------------------------------------------------------------------------------


//Get all Jobs for a specific company  send the company name in the query and get this company jobs.

/*
answer:
after authentication , authorization , validation
1- check user online
2- destructure query and get company name
3- check if company name is provided
4- find company data from db by company name
5- get all jobs for a specific company by company id
6- if no jobs found return not found
6- else return all jobs
*/

export const getAllJobsForSpecificCompany = async (req, res, next) => {

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
  return res.status(200).json({message:"All jobs for this company", companyName, count: jobs.length, jobs });
};

//-------------------------------------------------------------------

// 6. Filter Jobs


/*
answer:
after authentication , authorization , validation
1- check user online
2- destruct from req.query
3- allow user to filter with workingTime , jobLocation , 
    seniorityLevel and jobTitle,technicalSkills
4- get all jobs that match the following filters 
5- if no jobs found return not found
6- else return all jobs
*/

export const filterJobs = async (req, res, next) => {

  // Check if the user is online
  if (req.authUser.status !== "online") {
    return next(
      new ErrorClass(
        "User must be online",
        400,
        "User must be online",
        "filter jobs API"
      )
    );
  }

  // destructure query
  const {
    workingTime,
    jobLocation,
    seniorityLevel,
    jobTitle,
    technicalSkills,
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
    filters.jobTitle = { $regex: jobTitle, $options: "i" }; // Case-insensitive search
  }

  // check technicalSkills exists
  if (technicalSkills) {
    filters.technicalSkills = { $all: technicalSkills.split(",") }; // Match all specified skills
  }

  // get all jobs that match the filters
  const jobs = await Job.find(filters);

  // check length
  if (jobs.length === 0) {
    return next(
      new ErrorClass(
        "No jobs found",
        404,
        "No jobs found",
        "filter jobs API"
      )
    );
  }

  // return all jobs
  return res.status(200).json({ count: jobs.length, jobs });

};


//---------------------------------------------------


//  Apply to Job

/*
Application :
1. jobId ( the Job Id )
2. userId ( the applier Id )
3. userTechSkills ( array of the applier technical Skills )
4. userSoftSkills ( array of the applier soft Skills )
*/

/*
answer :
after authentication , authorization , validation


1- check user online
2- destruct req.body
3- check job exists
4- create new instance of application
4- return application
*/

export const applyToJob = async (req, res, next) => {

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
      new ErrorClass("Job not found", 400, "Job not found", "apply to job API")
    );
  }

  // create new instance of application
  const application = new Application({
    jobId,
    userId: req.authUser._id,
    userTechSkills,
    userSoftSkills,
  });

  // save application
  await application.save();

  // return application
  return res.status(200).json({message:"Application created successfully", application });
};
