import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";

import { sendEmailService } from "../../services/send-email.service.js";
import User from "../../../DB/Models/user.model.js";
import { ErrorClass } from "../../utils/error-class.utils.js";
/*
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @body -- user data in signup
 * @returns {object} return response { message, user }
 * @description create new user
 */

// signUp User
export const signUp = async (req, res, next) => {
  // destruct data from req.body
  const {
    firstName,
    lastName,
    email,
    password,
    recoveryEmail,
    DOB,
    mobileNumber,
    role,
  } = req.body;

  // Check if the email already exists
  const isEmailExists = await User.findOne({ email });
  if (isEmailExists) {
    return next(
      new ErrorClass("Email already exists", 400, email, "sign-up api")
    );
  }
  // check if the phone already exists
  const isMobileNumberExist = await User.findOne({ mobileNumber });
  if (isMobileNumberExist) {
    return next(
      new ErrorClass(
        "MobilNumber already exists",
        400,
        mobileNumber,
        "SignUp API"
      )
    );
  }

  // take new instance
  const userInstance = new User({
    firstName,
    lastName,
    email,
    password: hashSync(password, +process.env.SALT_ROUNDS), // hash password
    recoveryEmail,
    DOB,
    mobileNumber,
    role,
  });
  // generate token
  const token = jwt.sign(
    { _id: userInstance._id },
    process.env.CONFIRMATION_SECRET,
    {
      expiresIn: "10m",
    }
  );
  // confirmation Link
  const confirmationLink = `${req.protocol}://${req.headers.host}/user/confirm-email/${token}`;
  // send email
  const isEmailSent = await sendEmailService({
    to: email,
    subject: "Welcome to our app",
    textMessage: "Hello, welcome to our app",
    htmlMessage: `<a href="${confirmationLink}">Click here to confirm your email</a>`,
  });

  if (isEmailSent.rejected.length) {
    return next(
      new ErrorClass("Email Not Sent", 400, "Email Not Sent", email, "signUp ")
    );
  }
  // Create a new user
  const user = await userInstance.save();

  // Respond with success
  res.status(201).json({ message: "Successfully registered", user });
};

// //-----------------------------------------

/**
 * @param {token} req
 *  @returns {object} return response { message}
 * @description confirm email from link send to mail
 * if token expired generate new token
 */

export const confirmEmail = async (req, res, next) => {
  const { token } = req.params;

  try {
    const { _id } = jwt.verify(token, process.env.CONFIRMATION_SECRET);
    const user = await User.findOneAndUpdate(
      { _id, isConfirmed: false },
      { isConfirmed: true },
      { new: true }
    );

    if (!user) {
      return next(new ErrorClass("User not found", 400, "Confirm Email"));
    }

    res.status(200).json({ message: "Email confirmed" });
  } catch (err) {
    // check token expired
    if (err.name === "TokenExpiredError") {
      const decoded = jwt.decode(token);
      // user data
      const user = await User.findById(decoded._id);

      if (user && !user.isConfirmed) {
        const newToken = jwt.sign(
          { _id: user._id },
          process.env.CONFIRMATION_SECRET,
          { expiresIn: "10m" }
        );
        // New confirmation Link
        const newConfirmationLink = `${req.protocol}://${req.headers.host}/user/confirm-email/${newToken}`;
        // send new email
        try {
          const isEmailSent = await sendEmailService({
            to: user.email,
            subject: "Email confirmation link expired",
            textMessage:
              "Hello, your email confirmation link has expired. Here is a new one.",
            htmlMessage: `<a href="${newConfirmationLink}">Click here to confirm your email</a>`,
          });

          // error if email not send
          if (isEmailSent.rejected.length) {
            return next(
              new ErrorClass("Email Not Sent", 400, user.email, "confirmEmail ")
            );
          }
          // if email send success
          return res.status(400).json({
            message:
              "Email confirmation link expired. A new confirmation link has been sent to your email.",
          });
        } catch (emailErr) {
          return next(
            new ErrorClass(
              "Failed to send new confirmation email",
              500,
              emailErr.message
            )
          );
        }
      }

      return next(new ErrorClass("Token expired", 400, "Token expired"));
    }

    return next(new ErrorClass("Invalid token", 400, "Invalid token"));
  }
};

//-----------------------------------------------------------------------

// 2-signIn User

/*
  send user data if login in body
  check user found email or mobile number and password
  check user active email
  update status user from offline to online
  if user found return token 
*/
export const signIn = async (req, res, next) => {
  // destruct data from req.body
  const { email, password, mobileNumber } = req.body;

  // Check if the user exists
  const user = await User.findOne({ $or: [{ email }, { mobileNumber }] });
  if (!user) {
    return next(
      new ErrorClass(
        "Email or Mobile Number or Password is incorrect",
        400,
        { email, password, mobileNumber },
        "Sign-in API"
      )
    );
  }
  if (user.isConfirmed === false) {
    return next(
      new ErrorClass(
        "Please Frist Active Your Email ",
        400,
        user.email,
        "Sign-in API"
      )
    );
  }

  // Verify the password
  const isPasswordValid = compareSync(password, user.password);
  if (!isPasswordValid) {
    return next(
      new ErrorClass(
        "Email or Mobile Number or Password is incorrect",
        400,
        { email, password, mobileNumber },
        "Sign-in API"
      )
    );
  }

  // Sign a JWT token with user's ID and a secret key (make sure to use a strong secret)
  const token = jwt.sign({ userId: user._id }, process.env.LOGIN_SECRET, {
    expiresIn: "1h",
  }); // Token expires in 1 hour

  // Update status from online
  const updatedUser = await User.findByIdAndUpdate(user._id, {
    status: "online",
  });

  return res.status(200).json({ token });
};

//---------------------------------------------------------------------------------------------

// logout user
/**
 *
 * - user must be logged in
 * - user data send in token in header
 * - update the status of the user to "offline"
 * - return "Logout Successful"
 *
 */
export const logOut = async (req, res, next) => {
  // Ensure req.userId exists

  if (!req.authUser) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send Token in headers",
        "log-out API"
      )
    );
  }

  // Update the  status of the user to "offline"
  const updatedUser = await User.findByIdAndUpdate(
    req.authUser._id,
    {
      status: "offline",
    },
    { new: true }
  );
  // check user found
  if (!updatedUser) {
    return next(new ErrorClass("User not found", 404, "logout API"));
  }

  return res.status(200).json({ message: "LogOut Successful" });
};

//-----------------------------------------------------------------------------------------------
/**
 * question:
 * 3. Update account.
 *    - You can update (email, mobileNumber, recoveryEmail, DOB, lastName, firstName)
 *    - If the user updates the email or mobile number, make sure that the new data doesn’t conflict with any existing data in your database
 *    - User must be logged in
 *    - Only the owner of the account can update his account data
 */

/**
 * answer:
 * Steps:
 * 1. Send token in header to authenticate
 * 2. Destructure firstName, lastName, email, mobileNumber, recoveryEmail, DOB from the body
 * 3. Check email and mobile number uniqueness in all data
 * 4. If the email is updated, send a verification email
 * 5. If the email is updated, set isConfirmed to false and status to offline, then prompt the user to log in again
 * 6. Save the updated data
 * 7. Do not update password or role
 */

export const updateAccount = async (req, res, next) => {
  // Ensure req.authUser exists
  if (!req.authUser) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send Token in headers",
        "update account API"
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
        "update account API"
      )
    );
  }

  // Destructure firstName, lastName, email, mobileNumber, recoveryEmail, DOB from the request body
  const { firstName, lastName, email, mobileNumber, recoveryEmail, DOB } =
    req.body;

  // Check email or mobile number uniqueness
  const existingUser = await User.findOne({
    $or: [{ email }, { mobileNumber }],
  });
  console.log("existingUser", existingUser);
  // If an existing user with the same email or mobile number is found, return an error
  if (existingUser) {
    return next(
      new ErrorClass(
        "Email or Mobile Number already exists",
        400,
        "Email or Mobile Number already exists",
        "update account API"
      )
    );
  }

  // If the email is updated, send a verification email
  if (email && email !== req.authUser.email) {
    // Update isConfirmed to false and status to offline
    const userInstance = await User.findByIdAndUpdate(
      req.authUser._id,
      {
        isConfirmed: false,
        status: "offline",
      },
      { new: true }
    );

    // Generate token
    const token = jwt.sign(
      { _id: userInstance._id },
      process.env.CONFIRMATION_SECRET,
      { expiresIn: "10m" }
    );

    // Create confirmation link
    const confirmationLink = `${req.protocol}://${req.headers.host}/user/confirm-email/${token}`;

    // Send email
    const isEmailSent = await sendEmailService({
      to: email,
      subject: "Please confirm your email",
      textMessage: "Please confirm your email",
      htmlMessage: `<a href="${confirmationLink}">Click here to confirm your email</a>`,
    });

    // If the email was not sent, return an error
    if (isEmailSent.rejected.length) {
      return next(
        new ErrorClass(
          "Email Not Sent",
          400,
          "Email Not Sent",
          email,
          "update account API"
        )
      );
    }
  }

  // Update the user data
  const updatedUser = await User.findByIdAndUpdate(
    req.authUser._id,
    {
      firstName,
      lastName,
      email,
      mobileNumber,
      recoveryEmail,
      DOB,
      username: `${firstName || req.authUser.firstName}${
        lastName || req.authUser.lastName
      }`,
    },
    { new: true }
  );

  // Return success response
  return res.status(200).json({ message: "Update Successful", updatedUser });
};

//------------------------------------------------------------------------------------------------
/**
 *  4- delete user 
 * - only the owner of the account can delete his account data
   - User must be loggedIn
   user data send in token in header
   
 */

export const deleteUser = async (req, res, next) => {
  // Ensure req.userId exists
  if (!req.authUser) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send Token in headers",
        "delete user API"
      )
    );
  }
  // check status online
  if (req.authUser.status !== "online") {
    return next(
      new ErrorClass(
        "User must be online",
        400,
        "User must be online",
        "delete user API"
      )
    );
  }

  // delete user
  const deletedUser = await User.findByIdAndDelete(req.authUser._id);
  // user not found
  if (!deletedUser) {
    return next(new ErrorClass("User not found", 404, "delete user API"));
  }
  return res.status(200).json({ message: "User deleted successfully" });
};
//--------------------------------------------------------------------------------------------
// 5. Get user account data
//     - only the owner of the account can get his account data
//     - User must be loggedIn

export const getAccountData = async (req, res, next) => {
  // Ensure req.userId exists
  if (!req.authUser) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send Token in headers",
        "get account data API"
      )
    );
  }

  // check status online
  if (req.authUser.status !== "online") {
    return next(
      new ErrorClass(
        "User must be online",
        400,
        "User must be online",
        "get account data API"
      )
    );
  }

  // get user data only owner the take id from req.authUser
  const userData = await User.findById(req.authUser._id);
  // check user found
  if (!userData) {
    return next(new ErrorClass("User not found", 404, "get account data API"));
  }
  return res.status(200).json({ userData });
};
//-----------------------------------------------------------
// 6. Get profile data for another user
// - send the userId in params or query
/**
    send userId in params or query
    - check if user exists
    - get user data
    - return user data

 */
export const getProfileData = async (req, res, next) => {
  // Destruct userId from params or query
  const { userId } = req.params;
  const { userId: queryUserId } = req.query;

  // Check if userId is provided in params or query
  if (!userId && !queryUserId) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send User ID in params or query",
        "get profile data API"
      )
    );
  }

  // Use userId from params if available, otherwise use from query
  const idToSearch = userId || queryUserId;

  // Get user data
  const userData = await User.findById(idToSearch);

  // Check if user is found
  if (!userData) {
    return next(new ErrorClass("User not found", 404, "get profile data API"));
  }

  // Return user data
  return res.status(200).json({ userData });
};
//-----------------------------------------------------------------------------
// 7-Update password for user login
/**  only the owner of the account can update his password
  User must be loggedIn
  user data send in token in header
  check status online
  destruct old password and new password from body
  if old password not match return error compare password
  else hash new password
  update password
  return message "Password updated successfully"
*/

export const updatePassword = async (req, res, next) => {
  // Ensure req.userId exists
  if (!req.authUser) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send Token in headers",
        "update password API"
      )
    );
  }

  // check status online
  if (req.authUser.status !== "online") {
    return next(
      new ErrorClass(
        "User must be online",
        400,
        "User must be online",
        "update password API"
      )
    );
  }

  // destruct old password and new password from body
  const { oldPassword, newPassword } = req.body;
  // check if old password not match compare password API
  const oldPasswordMatch = compareSync(oldPassword, req.authUser.password);
  // check old password match
  if (!oldPasswordMatch) {
    return next(
      new ErrorClass(
        "Old password not match with user password",
        400,
        "Old password not match with user password",
        "update password API"
      )
    );
  }
  // hash new password

  const hashedPassword = hashSync(newPassword, +process.env.SALT_ROUNDS);
  // update password
  const updatedPassword = await User.findByIdAndUpdate(
    req.authUser._id,
    { password: hashedPassword },
    { new: true }
  );
  // check if password updated
  if (!updatedPassword) {
    return next(
      new ErrorClass(
        "Password not updated",
        400,
        "Password not updated",
        "update password API"
      )
    );
  }

  return res
    .status(200)
    .json({ message: "Password updated successfully", updatedPassword });
};
//----------------------------------------------------------------------

//Forget password (make sure of your data security specially the OTP and the newPassword )

/**
/forgot-password Route:

Find User: Find the user by email. If the user does not exist, return a 404 error.
Generate OTP: Generate a 6-character OTP using crypto.randomBytes.
Save OTP and Expiry: Save the OTP and its expiration time to the user's record.
Send OTP via Email: Use nodemailer to send the OTP to the user's email.



*/

// forget password

export const forgetPassword = async (req, res, next) => {
  // destruct email from body
  const { email } = req.body;
  // check if email is provided
  if (!email) {
    return next(
      new ErrorClass(
        "Email is required",
        400,
        "Send Email in body",
        "forget password API"
      )
    );
  }
  // find user by email
  const user = await User.findOne({ email });
  // check if user exists
  if (!user) {
    return next(
      new ErrorClass(
        "User not found",
        404,
        "User not found",
        "forget password API"
      )
    );
  }

  // generate otp
  const otp = Math.floor(100000 + Math.random() * 900000);
  // save otp and expiry in DataBase
  const updateUser = await User.findByIdAndUpdate(
    user._id,
    { otp, otpExpiry: Date.now() + 3600000 },
    { new: true }
  );

  //  send otp via email
  const isEmailSent = await sendEmailService({
    to: email,
    subject: "Your OTP",
    textMessage: "Your OTP",
    htmlMessage: `<h1>${otp}</h1>`,
  });
  // check isEmailSent
  if (!isEmailSent) {
    return next(
      new ErrorClass(
        "Email not sent",
        400,
        "Email not sent",
        "forget password API"
      )
    );
  }
  // return in state success
  return res
    .status(200)
    .json({ message: "OTP sent successfully", isEmailSent });
};
//--------------------------------------
/**
 * /reset-password Route:

  Find User: Find the user by email. If the user does not exist, return a 404 error.
  Verify OTP: Check if the provided OTP matches the one saved in the database and if it has not expired. If invalid, return a 400 error.
  Reset Password: Update the user's password, clear the OTP and its expiration time, and save the user record.
 */

export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  // check if email and otp are provided
  if (!email || !otp || !newPassword) {
    return next(
      new ErrorClass(
        "Email, OTP and New Password are required",
        400,
        "Send Email, OTP and New Password in body",
        "reset password API"
      )
    );
  }
  // find user by email
  const user = await User.findOne({ email });
  // check if user exists
  if (!user) {
    return next(
      new ErrorClass(
        "User not found",
        404,
        "User not found",
        "reset password API"
      )
    );
  }
  console.log("userrrrrrr", user);
  // check otp valid
  if (user.otp !== otp) {
    return next(
      new ErrorClass("Invalid OTP", 400, "Invalid OTP", "reset password API")
    );
  }
  // check otp expired
  console.log(user.otpExpiry);
  if (Date.now() > user.otpExpiry) {
    return next(
      new ErrorClass("expired OTP", 400, "Invalid OTP", "reset password API")
    );
  }
  // update password
  const hashedPassword = hashSync(newPassword, +process.env.SALT_ROUNDS);
  const updateUser = await User.findByIdAndUpdate(
    user._id,
    { password: hashedPassword },
    { new: true }
  );
  // clear otp and otpExpiry
  const clearOTP = await User.findByIdAndUpdate(
    user._id,
    { otp: null, otpExpiry: null, status: "offline" },
    { new: true }
  );
  // return success reset password
  return res
    .status(200)
    .json({
      message: "Password reset successfully try login use new password",
    });
};

//-----------------------------------------------------------------------
/*
 ** question
 Get all accounts associated to a specific recovery Email 
 send recovery email in params or query
*/
/*
** answer
   1- send recovery email in params or query
   2- check if users exists have same recovery email
   3- get users data
   4-check in data if users exists
   5- return users data
*/

export const getRecoveryEmail = async (req, res, next) => {
  // destruct recovery email from params or query
  const { recoveryEmail } = req.params;
  const { recoveryEmail: queryRecoveryEmail } = req.query;
  // check if recovery email is provided in params or query
  if (!recoveryEmail && !queryRecoveryEmail) {
    return next(
      new ErrorClass(
        "Recovery Email is required",
        400,
        "Send Recovery Email in params or query",
        "get recovery email API"
      )
    );
  }

  // Use recovery email from params if available, otherwise use from query
  const emailToSearch = recoveryEmail || queryRecoveryEmail;
  // check if users exists have same recovery email
  const users = await User.find({ recoveryEmail: emailToSearch });
  console.log(users);
  // check if users exists
  if (users.length === 0) {
    return next(
      new ErrorClass(
        "Users not found associated to this recovery email",
        404,
        "Users not found associated to this recovery email",
        "get recovery email API"
      )
    );
  }
  // return users data
  return res.status(200).json({ count: users.length, recoveryEmail, users });
};
