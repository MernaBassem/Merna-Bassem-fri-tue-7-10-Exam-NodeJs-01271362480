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
    console.log("email exist", isEmailExists);

    return next(
      new ErrorClass(
        "Email already exists",
        400,
        email,
        "sign-up api"
      )
    );
  }
  // check if the phone already exists
  const isMobileNumberExist = await User.findOne({ mobileNumber });
  if (isMobileNumberExist) {
    console.log("phone exist", isMobileNumberExist);
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

          console.log(
            `Email sent status: ${JSON.stringify(isEmailSent, null, 2)}`
          );
          // error if email not send
          if (isEmailSent.rejected.length) {
            return next(
              new ErrorClass(
                "Email Not Sent",
                400,
                user.email,
                "confirmEmail "
              )
            );
          }
         // if email send success
          return res.status(400).json({
            message:
              "Email confirmation link expired. A new confirmation link has been sent to your email.",
          });
        } catch (emailErr) {
          console.error("Error sending email:", emailErr);
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

// signIn User

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
     return next( new ErrorClass(
       "Email or Mobile Number or Password is incorrect",
       400,
       { email, password, mobileNumber },
       "Sign-in API"
     ));

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
      return next(new ErrorClass(
        "Email or Mobile Number or Password is incorrect",
        400,
        { email, password, mobileNumber },
        "Sign-in API"
      ));
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
      return next(
        new ErrorClass("User not found", 404 , "logout API")
      );
    }

    return res.status(200).json({ message: "LogOut Successful" });
  
};



//------------------------------------------------------------------------------------------------
/**
 *  delete user 
 * - only the owner of the account can delete his account data
   - User must be loggedIn
   user data send in token in header
   
 */

export const deleteUser = async (req, res, next) => {
  // Ensure req.userId exists
  console.log(req.authUser);
  if (!req.authUser) {
    return next(
      new ErrorClass(
        "User ID is required",
        400,
        "Send Token in headers",
        "delete user API"
      ));
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
    return next(
      new ErrorClass("User not found", 404, "delete user API")
    );
  } 
  return res.status(200).json({ message: "User deleted successfully" });
};