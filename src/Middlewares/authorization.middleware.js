import { ErrorClass } from "../utils/error-class.utils.js";

/**
 * @param {Array} allowedRoles - Array of allowed roles based on the router
 * @returns  {Function} - Middleware function
 * @description - Middleware function to check if the user role is allowed to access the route
*/
export const authorizationMiddleware = (allowedRoles) => {
  return async (req, res, next) => {
    // Get the loggedIn user from the request authUser from auth middleware
    const user = req.authUser;
    // Check if the allowed roles array includes the user role
    if (!allowedRoles.includes(user.role)) {
      return next(
        new ErrorClass(
          "Authorization Error",
          401,
          "You are not allowed to access this route"
        )
      );
    }
    next();
  };
};
