import { Router } from "express";

import * as jobController from "./job.controller.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { authenticate } from "../../Middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../Middlewares/authorization.middleware.js";
import { roles } from "../../utils/system-roles.utils.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import {
  AddJobSchema,
  ApplyJobSchema,
  DeleteJobSchema,
  FilterJobSchema,
  GetAllJobsAndCompanyInfo,
  UpdateJobSchema,
} from "./job.schema.js";

const router = Router();
// addJob api
router.post(
  "/addJob",
  errorHandler(authenticate()),
  errorHandler(authorizationMiddleware(roles.COMPANY_HR)),
  errorHandler(validationMiddleware(AddJobSchema)),
  errorHandler(jobController.addJob)
);
// updateJob api
router.patch(
  "/updateJob/:jobId",
  errorHandler(authenticate()),
  errorHandler(authorizationMiddleware(roles.COMPANY_HR)),
  errorHandler(validationMiddleware(UpdateJobSchema)),
  errorHandler(jobController.updateJob)
);
// delete job api
router.delete(
  "/deleteJob/:jobId",
  errorHandler(authenticate()),
  errorHandler(authorizationMiddleware(roles.COMPANY_HR)),
  errorHandler(validationMiddleware(DeleteJobSchema)),
  errorHandler(jobController.deleteJob)
);
// get all jobs api
router.get(
  "/getAllJobsAndCompanyInfo",
  errorHandler(authenticate()),
  errorHandler(authorizationMiddleware(roles.USER_COMPANY_HR)),
  errorHandler(validationMiddleware(GetAllJobsAndCompanyInfo)),
  errorHandler(jobController.getAllJobsAndCompanyInfo)
);
// filter job api
router.get(
  "/filterJob",
  errorHandler(authenticate()),
  errorHandler(authorizationMiddleware(roles.USER_COMPANY_HR)),
  errorHandler(validationMiddleware(FilterJobSchema)),
  errorHandler(jobController.filterJobs)
);
// apply job api
router.post(
  "/applyJob",
  errorHandler(authenticate()),
  errorHandler(authorizationMiddleware(roles.USER)),
  errorHandler(validationMiddleware(ApplyJobSchema)),
  errorHandler(jobController.applyToJob)
);
export default router;
