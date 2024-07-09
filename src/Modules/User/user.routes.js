import { Router } from "express";

import * as userController from "./user.controller.js";

import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import {
  SignUpSchema,
  SignInSchema,
  generalSchemaCheckOnlyToken,
  profileSchema,
  updatePasswordSchema,
  updateUserSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
} from "./user.schema.js";
import { authenticate } from "../../Middlewares/authentication.middleware.js";

const router = Router();
// signUp api
router.post(
  "/signUp",
  errorHandler(validationMiddleware(SignUpSchema)),
  errorHandler(userController.signUp)
);
// confirm email api
router.get(
  "/confirm-email/:token",
   errorHandler(userController.confirmEmail)
  );

// signIn api
router.post(
  "/signIn",
  errorHandler(validationMiddleware(SignInSchema)),
  errorHandler(userController.signIn)
);

// logout api
router.post(
  "/logOut",
  errorHandler(authenticate()),
  errorHandler(validationMiddleware(generalSchemaCheckOnlyToken)),
  errorHandler(userController.logOut)
);

// update user api
router.put(
  "/updateAccount",
  errorHandler(authenticate()),
  errorHandler(validationMiddleware(updateUserSchema)),
  errorHandler(userController.updateAccount)
);

// delete user api
router.delete(
  "/deleteAccount",
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

// get profile api another user send userId in params and query
router.get(
  "/getProfileData/:userId?",
  errorHandler(authenticate()),
  errorHandler(validationMiddleware(profileSchema)),
  errorHandler(userController.getProfileData)
);

// api update user password
router.patch(
  "/updatePassword",
  errorHandler(authenticate()),
  errorHandler(validationMiddleware(updatePasswordSchema)),
  errorHandler(userController.updatePassword)
);


// forget password
router.post(
  "/forgetPassword",
  errorHandler(validationMiddleware(forgetPasswordSchema)),
  errorHandler(userController.forgetPassword)
);

// reset password
router.post(
  "/resetPassword",
  errorHandler(validationMiddleware(resetPasswordSchema)),
  errorHandler(userController.resetPassword)
);

//Get all accounts associated to a specific recovery Email
router.get(
  "/getRecoveryEmail",
  errorHandler(authenticate()),
  errorHandler(validationMiddleware(generalSchemaCheckOnlyToken)),
  errorHandler(userController.getRecoveryEmail)
);

export default router;
