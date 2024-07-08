import { Router } from "express";

import * as companyController from "./company.controller.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { authenticate } from "../../Middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../Middlewares/authorization.middleware.js";
import { roles } from "../../utils/system-roles.utils.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import { CreateCompanySchema, UpdateCompanySchema } from "./company.schema.js";

const router = Router();
// createCompany api
router.post(
  "/createCompany",
  errorHandler(authenticate()),
  errorHandler(authorizationMiddleware(roles.COMPANY_HR)),
  errorHandler(validationMiddleware(CreateCompanySchema)),
  errorHandler(companyController.createCompany)
);
// updateCompany api
router.patch(
  "/updateCompany/:id",
  errorHandler(authenticate()),
  errorHandler(authorizationMiddleware(roles.COMPANY_HR)),
  errorHandler(validationMiddleware(UpdateCompanySchema)),
  errorHandler(companyController.updateCompany)
)
export default router;
