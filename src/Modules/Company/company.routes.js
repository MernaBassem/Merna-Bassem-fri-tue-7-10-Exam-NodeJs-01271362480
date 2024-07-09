import { Router } from "express";

import * as companyController from "./company.controller.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { authenticate } from "../../Middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../Middlewares/authorization.middleware.js";
import { roles } from "../../utils/system-roles.utils.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import {
  CreateCompanySchema,
  DeleteCompanySchema,
  GetApplicationSchema,
  GetCompanySchema,
  SearchCompanySchema,
  UpdateCompanySchema,
} from "./company.schema.js";

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
router.put(
  "/updateCompany/:id",
  errorHandler(authenticate()),
  errorHandler(authorizationMiddleware(roles.COMPANY_HR)),
  errorHandler(validationMiddleware(UpdateCompanySchema)),
  errorHandler(companyController.updateCompany)
);

// deleteCompany api
router.delete(
  "/deleteCompany/:id",
  errorHandler(authenticate()),
  errorHandler(authorizationMiddleware(roles.COMPANY_HR)),
  errorHandler(validationMiddleware(DeleteCompanySchema)),
  errorHandler(companyController.deleteCompany)
);

// getCompany api
router.get(
  "/getCompany/:id",
  errorHandler(authenticate()),
  errorHandler(authorizationMiddleware(roles.COMPANY_HR)),
  errorHandler(validationMiddleware(GetCompanySchema)),
  errorHandler(companyController.getCompany)
);

// searchCompany api
router.get(
  "/searchCompany/:name?",
  errorHandler(authenticate()),
  errorHandler(authorizationMiddleware(roles.USER_COMPANY_HR)),
  errorHandler(validationMiddleware(SearchCompanySchema)),
  errorHandler(companyController.searchCompany)
);

// get application
router.get(
  "/getApplication/:id",
  errorHandler(authenticate()),
  errorHandler(authorizationMiddleware(roles.COMPANY_HR)),
  errorHandler(validationMiddleware(GetApplicationSchema)),
  errorHandler(companyController.getApplications)
);
export default router;
