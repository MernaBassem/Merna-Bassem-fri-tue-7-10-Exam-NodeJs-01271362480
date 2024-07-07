import { Router } from "express";

import * as userController from "./user.controller.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import { SignUpSchema, SignInSchema, LogoutSchema, DeleteSchema } from "./user.schema.js";
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
  errorHandler(validationMiddleware(LogoutSchema)),
  errorHandler(userController.logOut)
);
// delete user api
router.delete(
  "/delete",
  errorHandler(authenticate()),
  errorHandler(validationMiddleware(DeleteSchema)),
  errorHandler(userController.deleteUser)
)
export default router;
