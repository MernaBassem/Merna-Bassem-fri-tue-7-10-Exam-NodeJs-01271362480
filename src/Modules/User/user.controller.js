import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";

import { sendEmailService } from "../../services/send-email.service.js";
import { ErrorClass } from "../../utils/error-class.utils.js";

import User from "../../../DB/Models/user.model.js";
import Company from "../../../DB/Models/company.model.js";
import Job from "../../../DB/Models/job.model.js";
import Application from "../../../DB/Models/application.model.js";

// signUp User

/*
 * answer:
  after validation
  1- destruct data from req.body
  2- Check if the email already exists
  3- check if the phone already exists
  4- take new instance
  5- hash password
  6- generate token
  7- confirmation Link
  8- send email
  9- save user
  10- return response user added successfully and user data
 */

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
      new ErrorClass("Email already exists", 400, email, "SignUp api")
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
    password: hashSync(password, +process.env.SALT_ROUNDS), // hash password (+) convert string to number
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
    subject: "Active Email",
    textMessage: "Active Email",
    htmlMessage: `<a href="${confirmationLink}">Click here to confirm your email To Active Email</a>`,
  });
  // check if email sent
  if (isEmailSent.rejected.length) {
    return next(
      new ErrorClass(
        "Email Not Sent",
        400,
        "Email Not Sent",
        email,
        "signUp api"
      )
    );
  }
  // Create a new user
  const user = await userInstance.save();

  // Respond with success
  res.status(201).json({ message: "Successfully registered", user });
};

// `-------------------------------------------------------------------------

/**
* answer:
1- take token from params
try : 
2- decode token
3- find user by id
4- update user isConfirmed to true
5- return response
catch : 
1- if token expired
2- decode token
3- create new token 
4- create new conformation
5- send new email
6- check email send
7- if email send return response email send else return response error
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
          // if error in send new conformation
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
 * answer:
 * after validation
  1- send user data if login in body
  2- check user found email or mobile number or recovery email and password
  3- check user active email
  4- create token
  5- update status user from offline to online
  6- if user found return token 
*/
export const signIn = async (req, res, next) => {
  // destruct data from req.body
  const { email, password, mobileNumber, recoveryEmail } = req.body;

  // Check if the user exists
  const user = await User.findOne({
    $or: [{ email }, { mobileNumber }, { recoveryEmail }],
  });
  if (!user) {
    return next(
      new ErrorClass(
        "Email or Mobile Number or Password or  Recovery Email is incorrect",
        400,
        { email, password, mobileNumber, recoveryEmail },
        "SignIn API"
      )
    );
  }
  // check email is active by comfirm email
  if (user.isConfirmed === false) {
    return next(
      new ErrorClass(
        "Please Frist Active Your Email ",
        400,
        user.email,
        "SignIn API"
      )
    );
  }

  // Verify the password
  const isPasswordValid = compareSync(password, user.password);
  if (!isPasswordValid) {
    return next(
      new ErrorClass(
        "Email or Mobile Number or Password or  Recovery Email is incorrect",
        400,
        { email, password, mobileNumber, recoveryEmail },
        "SignIn API"
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
 * answer:
 * after authentication and validation
 * 1- user must be logged in
 * 2- user must be online
 * 3- user data send in token in header
 * 4- update the status of the user to "offline"
 * 5- return "Logout Successful"
 *
 */
export const logOut = async (req, res, next) => {
  // check user is online
  if (req.authUser.status !== "online") {
    return next(
      new ErrorClass(
        "User must be online",
        400,
        "User must be online",
        "logout API"
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

// Update account.

/**
 * answer:
 * after authentication
 * 1. check user online
 * 2. Destructure firstName, lastName, email, mobileNumber, recoveryEmail, DOB from the body
 * 3. if update email or mobile number, Check email and mobile number uniqueness in all data
 * 4. If the email is updated, create new token and send verification email to active email
 * 5. If the email is updated, set isConfirmed to false and status to offline, then prompt the user to log in again
 * 6. Save the updated data
 * 7. Do not update password or role
 * 8. return updated data
 */

export const updateAccount = async (req, res, next) => {
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

  //  new variable contain user data
  const user = req.authUser;
  // check data is send or not (such new instance)
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) user.email = email;
  if (mobileNumber) user.mobileNumber = mobileNumber;
  if (recoveryEmail) user.recoveryEmail = recoveryEmail;
  if (DOB) user.DOB = DOB;
  // change username if find firstName and lastName
  if (firstName || lastName) {
    user.username = `${firstName || req.authUser.firstName}${
      lastName || req.authUser.lastName
    }`;
  }

  // Save the updated user data
  const updatedUser = await user.save();
  // Return success response
  return res.status(200).json({ message: "Update Successful", updatedUser });
};

//------------------------------------------------------------------------------------------------

// delete account

/**
 * answer:
 * after authentication and validation
 *  1- check user online
 *  2- delete user
 *  3- if deleted return response deleted else return error
 *  4- delete company related to user
 *  5- delete job related to user
 *  6- delete application related to user
 *  7- return deleted user
 */

export const deleteUser = async (req, res, next) => {
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
  // delete company related to user
  await Company.deleteMany({ companyHR: req.authUser._id });
  // delete job related to user
  await Job.deleteMany({ addedBy: req.authUser._id });
  // delete application related to user
  await Application.deleteMany({ userId: req.authUser._id });
  // return deleted user
  return res
    .status(200)
    .json({ message: "User deleted successfully", deletedUser });
};

//--------------------------------------------------------------------------------------------

// Get user account data

/*
answer:
after authentication and validation
1. check user online
2. get user data only owner the take id from req.authUser
3. check user found
4. return user data
*/

export const getAccountData = async (req, res, next) => {
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

// Get profile data for another user send the userId in params or query

/**
 * answer:
 * after authentication and validation
 * 1. check user online
 * 2. destruct userId from params or query
 * 3- check userId is provided in params or query
 * 4- check if user exists
 * 5- get user data
 * 6- return user data
 */

export const getProfileData = async (req, res, next) => {
  // check status online
  if (req.authUser.status !== "online") {
    return next(
      new ErrorClass(
        "User must be online",
        400,
        "User must be online",
        "get profile data API"
      )
    );
  }
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

// Update password

/*
answer:
after authentication and validation
1- check user online
2- destruct old password and new password from body
3- compare password with old password
4- if compare false return error
5- if compare true hash new password
6- update password and status to offline try login by new password
7- return updated password
*/

export const updatePassword = async (req, res, next) => {
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
    {
      password: hashedPassword,
      status: "offline",
    },
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
  // return updated password
  return res.status(200).json({
    message:
      "Password updated successfully , please login agin by new password",
    updatedPassword,
  });
};

//----------------------------------------------------------------------

//Forget password

/*
answer:
1- destruct email from body
2- find user by email
3- if user not found return error
4- generate otp
5- save otp and expiry in database
6- send otp via email
7- return response
*/

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
  // set expire time of otp
  const otpExpiry = Date.now() + 3600000;
  // save otp and expiry in DataBase
  const updateUser = await User.findByIdAndUpdate(
    user._id,
    { otp, otpExpiry },
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

//-----------------------------------------------------------------------

// reset password

/*
answer:
1- destruct email, otp and newPassword from body
2- check if email, otp and newPassword are provided
3- find user by email
4- if user not found return error
5- check if otp and otpExpiry are valid
6- if invalid return error
7- hash newPassword
7- update password after hash and clear otp and otpExpiry in database
8- return response
*/

export const resetPassword = async (req, res, next) => {
  // destruct email, otp and newPassword from body
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

  // check otp valid
  if (user.otp !== otp) {
    return next(
      new ErrorClass("Invalid OTP", 400, "Invalid OTP", "reset password API")
    );
  }

  // check otp expired
  if (Date.now() > user.otpExpiry) {
    return next(
      new ErrorClass("expired OTP", 400, "Invalid OTP", "reset password API")
    );
  }

  // hash password
  const hashedPassword = hashSync(newPassword, +process.env.SALT_ROUNDS);

  // update password
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
  return res.status(200).json({
    message: "Password reset successfully try login use new password",
  });
};


//-----------------------------------------------------------------------

// Get all accounts associated to a specific recovery Email 

/*
** answer
   after authenticate and validation

   1- check user online
   2- destruct recovery email from rq.authUser
   3- get all accounts associated to a specific recovery Email
   4- return accounts 
*/

export const getRecoveryEmail = async (req, res, next) => {

  // Check if the user is online
  if (req.authUser.status !== "online") {
    return next(
      new ErrorClass(
        "User must be online",
        400,
        "User must be online",
        "get recovery email API"
      )
    );
  }

  // take recovery email from rq.authUser.recoveryEmail
  const { recoveryEmail } = req.authUser;
  // get all accounts associated to a specific recovery Email
  const accounts = await User.find({ recoveryEmail });
  // return accounts
  return res.status(200).json({
    message: "all user found same recovery email",
    count: accounts.length,
    accounts,
  });
};
