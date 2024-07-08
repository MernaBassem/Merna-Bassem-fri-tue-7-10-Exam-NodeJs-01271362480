import { Router } from "express";

import * as jobController from "./job.controller.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { authenticate } from "../../Middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../Middlewares/authorization.middleware.js";
import { roles } from "../../utils/system-roles.utils.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import { AddJobSchema, UpdateJobSchema } from "./job.schema.js";


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
export default router;
