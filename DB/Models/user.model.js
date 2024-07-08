// user model use mongoose
/*
1. firstName 
2. lastName
3. username ( firstName + lastName) 
4. email ⇒ ( unique )
5. password
6. recoveryEmail ⇒ (not unique)
7. DOB (date of birth, must be date format 2023-12-4)
8. mobileNumber ⇒ (unique)
9. role ⇒ (User, Company_HR )
10. status (online, offline)
*/

import mongoose from "mongoose";
import { systemRoles } from "../../src/utils/system-roles.utils.js";
const { Schema, model } = mongoose;

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minLength: 3,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minLength: 3,
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    recoveryEmail: {
      type: String,
      required: true,
    },
    DOB: {
      type: Date,
      default: Date.now,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(systemRoles),
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    otp: { type: String , default:null },
    otpExpiry: { type: Date , default:null },
  },
  { timestamps: true, versionKey: "version_key" }
);

// The username value is the combination of the value of the first name and the second name
// Middleware to set username before saving
userSchema.pre('validate', function(next) {
  this.username = `${this.firstName}${this.lastName}`;
  next();
});

const User = mongoose.models.User || model("User", userSchema);
export default User;
