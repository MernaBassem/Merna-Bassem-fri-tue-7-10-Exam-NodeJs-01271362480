import { Router } from "express";

import * as userController from "./user.controller.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import { SignUpSchema ,SignInSchema} from "./user.schema.js";

const router = Router();

router.post(
  "/sign-up",
  errorHandler(validationMiddleware(SignUpSchema)),
  errorHandler(userController.signUp)
);
router.get("/confirm-email/:token",errorHandler(userController.confirmEmail));

router.post("/sign-in", errorHandler(validationMiddleware(SignInSchema)), errorHandler(userController.signIn));

export default router;
