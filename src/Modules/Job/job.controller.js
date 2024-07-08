// job controllers
/*
1. Add Job 
2. apply authorization with the role ( Company_HR )
*/

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

  } = req.body;
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

  // update Job use save
   if(jobTitle) job.jobTitle = jobTitle
   if(jobLocation) job.jobLocation = jobLocation
   if(workingTime) job.workingTime = workingTime
   if(seniorityLevel) job.seniorityLevel = seniorityLevel
   if(jobDescription) job.jobDescription = jobDescription
   if(technicalSkills) job.technicalSkills = technicalSkills
   if(softSkills) job.softSkills = softSkills
   const updatedJob = await job.save();
   // return updated job
   return res.status(200).json({ updatedJob });
}
//---------------------------------------------------------
