import { Router } from "express";

import * as userController from "./user.controller.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import {
  SignUpSchema,
  SignInSchema,
  generalSchemaCheckOnlyToken,
  profileSchema,
  updatePasswordSchema
} from "./user.schema.js";
import { authenticate } from "../../Middlewares/authentication.middleware.js";

const router = Router();
// sign-up api
router.post(
  "/sign-up",
  errorHandler(validationMiddleware(SignUpSchema)),
  errorHandler(userController.signUp)
);
// confirm email api
router.get("/confirm-email/:token", errorHandler(userController.confirmEmail));
// sign-in api
router.post(
  "/sign-in",
  errorHandler(validationMiddleware(SignInSchema)),
  errorHandler(userController.signIn)
);
// logout api
router.post(
  "/log-out",
  errorHandler(authenticate()),
  errorHandler(validationMiddleware(generalSchemaCheckOnlyToken)),
  errorHandler(userController.logOut)
);
// delete user api
router.delete(
  "/delete",
  errorHandler(authenticate()),
  errorHandler(validationMiddleware(generalSchemaCheckOnlyToken)),
  errorHandler(userController.deleteUser)
);
//get user api if user login
router.get(
  "/getAccountData",
  errorHandler(authenticate()),
  errorHandler(validationMiddleware(generalSchemaCheckOnlyToken)),
  errorHandler(userController.getAccountData)
);
// Define route to handle both scenarios params and query
router.get(
  "/getProfileData/:userId?",
  errorHandler(validationMiddleware(profileSchema)),
  errorHandler(userController.getProfileData)
);
// api update user password
router.patch(
  "/updatePassword",
  errorHandler(authenticate()),
  errorHandler(validationMiddleware(updatePasswordSchema)),
  errorHandler(userController.updatePassword)
)
export default router;
