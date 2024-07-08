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