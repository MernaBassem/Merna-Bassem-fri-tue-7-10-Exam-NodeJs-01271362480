// user model use mongoose
/*

*/

import mongoose from "mongoose";
const { Schema, model } = mongoose;

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userTechSkills: {
      type: [String],
      required: true,
    },
    userSoftSkills: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true, versionKey: "version_key" }
);

const Application =
  mongoose.models.Application || model("Application", applicationSchema);
export default Application;
